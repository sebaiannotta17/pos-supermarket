import type { Category, Product } from "../types";
import { DEFAULT_CATEGORIES, MOCK_PRODUCTS } from "../data/mockProducts";
import {
  migrateCategoryRow,
  migrateProductRow,
} from "../lib/productValues";
import { useInventoryStore } from "./useInventoryStore";
import { useProfileStore } from "./useProfileStore";

const LEGACY_KEY = "inventory-catalog-v1";
const SCHEMA_VERSION_KEY = "catalog-schema-version";
const CURRENT_SCHEMA_VERSION = "3";

function storageKey(profileId: string): string {
  return `inventory-catalog-${profileId}`;
}

function unwrapCatalogEnvelope(parsed: unknown): {
  products?: unknown;
  categories?: unknown;
} | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if ("state" in o && typeof o.state === "object" && o.state !== null) {
    const inner = o.state as Record<string, unknown>;
    return { products: inner.products, categories: inner.categories };
  }
  return { products: o.products, categories: o.categories };
}

function migrateProfileStorage(profileId: string): void {
  const key = storageKey(profileId);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const blob = unwrapCatalogEnvelope(parsed);
    if (!blob) return;
    const categories = normalizeCategories(blob.categories);
    localStorage.setItem(
      key,
      JSON.stringify({
        products: normalizeProducts(blob.products, categories),
        categories,
      })
    );
  } catch {
    /* ignore */
  }
}

/** Migraciones de esquema en localStorage. */
function applySchemaMigrations(): void {
  if (typeof localStorage === "undefined") return;
  const stored = localStorage.getItem(SCHEMA_VERSION_KEY);

  if (stored === CURRENT_SCHEMA_VERSION) return;

  if (!stored || stored === "1") {
    const emptyCatalog = JSON.stringify({
      products: [],
      categories: DEFAULT_CATEGORIES,
    });
    localStorage.setItem(storageKey("mama"), emptyCatalog);
    localStorage.setItem(storageKey("papa"), emptyCatalog);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(SCHEMA_VERSION_KEY, "2");
  }

  if (localStorage.getItem(SCHEMA_VERSION_KEY) === "2") {
    migrateProfileStorage("mama");
    migrateProfileStorage("papa");
    localStorage.setItem(SCHEMA_VERSION_KEY, "3");
  }
}

let legacyMigrated = false;

export function migrateLegacyCatalogOnce(): void {
  if (typeof localStorage === "undefined" || legacyMigrated) return;
  legacyMigrated = true;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;
  if (!localStorage.getItem(storageKey("mama"))) {
    try {
      const parsed = JSON.parse(legacy) as unknown;
      const blob = unwrapCatalogEnvelope(parsed);
      if (blob) {
        const categories = normalizeCategories(blob.categories);
        localStorage.setItem(
          storageKey("mama"),
          JSON.stringify({
            products: normalizeProducts(blob.products, categories),
            categories,
          })
        );
        return;
      }
    } catch {
      /* copia cruda */
    }
    localStorage.setItem(storageKey("mama"), legacy);
  }
}

let allowSave = false;

export function enableCatalogSaves(): void {
  allowSave = true;
}

export function saveCatalogNow(): void {
  if (typeof localStorage === "undefined" || !allowSave) return;
  const id = useProfileStore.getState().activeProfileId;
  const { products, categories } = useInventoryStore.getState();
  localStorage.setItem(
    storageKey(id),
    JSON.stringify({ products, categories })
  );
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCatalogSave(): void {
  if (!allowSave) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    saveCatalogNow();
  }, 450);
}

function normalizeProducts(raw: unknown, categories: Category[]): Product[] {
  if (!Array.isArray(raw)) return MOCK_PRODUCTS;
  if (raw.length === 0) return [];
  const mapped: Product[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    mapped.push(migrateProductRow(row as Record<string, unknown>, categories));
  }
  return mapped;
}

function normalizeCategories(raw: unknown): Category[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORIES;
  const mapped: Category[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    mapped.push(migrateCategoryRow(row as Record<string, unknown>));
  }
  return mapped.length > 0 ? mapped : DEFAULT_CATEGORIES;
}

export function loadCatalogForActiveProfile(): void {
  const id = useProfileStore.getState().activeProfileId;
  const raw = localStorage.getItem(storageKey(id));
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const blob = unwrapCatalogEnvelope(parsed);
      if (blob) {
        const categories = normalizeCategories(blob.categories);
        useInventoryStore.setState({
          products: normalizeProducts(blob.products, categories),
          categories,
          lastFeedback: null,
        });
        return;
      }
    } catch {
      /* siguiente */
    }
  }
  useInventoryStore.setState({
    products: MOCK_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
    lastFeedback: null,
  });
}

export function initCatalogAfterProfilesHydrated(): void {
  applySchemaMigrations();
  migrateLegacyCatalogOnce();
  loadCatalogForActiveProfile();
  enableCatalogSaves();
}

export function switchCatalogProfile(profileId: string): void {
  const current = useProfileStore.getState().activeProfileId;
  if (profileId === current) return;
  saveCatalogNow();
  useProfileStore.getState().setActiveProfileId(profileId);
  allowSave = false;
  loadCatalogForActiveProfile();
  enableCatalogSaves();
}

export function registerCatalogAutoSave(): void {
  if (typeof window === "undefined") return;
  useInventoryStore.subscribe(() => {
    scheduleCatalogSave();
  });
  window.addEventListener("beforeunload", saveCatalogNow);
}
