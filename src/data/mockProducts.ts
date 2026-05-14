import type { Product } from "../types";

export const CATEGORIES = [
  "Almacén",
  "Bebidas",
  "Lácteos",
  "Panadería",
  "Limpieza",
  "Frutas y Verduras",
  "Carnicería",
  "Snacks",
  "Higiene",
  "Congelados",
] as const;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p-001",
    barcode: "7790001000017",
    name: "Coca-Cola 1.5L",
    price: 1850,
    category: "Bebidas",
    stock: 42,
    image:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80",
  },
  {
    id: "p-002",
    barcode: "7790001000024",
    name: "Agua Mineral 2L",
    price: 850,
    category: "Bebidas",
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1560847468-5eef330c0ebd?w=300&q=80",
  },
  {
    id: "p-003",
    barcode: "7790001000031",
    name: "Leche Entera La Serenísima 1L",
    price: 1290,
    category: "Lácteos",
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80",
  },
  {
    id: "p-004",
    barcode: "7790001000048",
    name: "Pan Lactal Bimbo 540g",
    price: 2150,
    category: "Panadería",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1568471173242-461f0a730452?w=300&q=80",
  },
  {
    id: "p-005",
    barcode: "7790001000055",
    name: "Arroz Gallo Oro 1kg",
    price: 1750,
    category: "Almacén",
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80",
  },
  {
    id: "p-006",
    barcode: "7790001000062",
    name: "Fideos Matarazzo 500g",
    price: 980,
    category: "Almacén",
    stock: 75,
    image:
      "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&q=80",
  },
  {
    id: "p-007",
    barcode: "7790001000079",
    name: "Aceite Cocinero Girasol 900ml",
    price: 2890,
    category: "Almacén",
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
  },
  {
    id: "p-008",
    barcode: "7790001000086",
    name: "Yerba Mate Taragüi 1kg",
    price: 4250,
    category: "Almacén",
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&q=80",
  },
  {
    id: "p-009",
    barcode: "7790001000093",
    name: "Detergente Magistral 750ml",
    price: 1580,
    category: "Limpieza",
    stock: 38,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&q=80",
  },
  {
    id: "p-010",
    barcode: "7790001000109",
    name: "Papel Higiénico Higienol x4",
    price: 2450,
    category: "Higiene",
    stock: 27,
    image:
      "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=300&q=80",
  },
  {
    id: "p-011",
    barcode: "7790001000116",
    name: "Manzana Roja kg",
    price: 1690,
    category: "Frutas y Verduras",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&q=80",
  },
  {
    id: "p-012",
    barcode: "7790001000123",
    name: "Banana kg",
    price: 1290,
    category: "Frutas y Verduras",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&q=80",
  },
  {
    id: "p-013",
    barcode: "7790001000130",
    name: "Papas Lays Clásicas 130g",
    price: 1450,
    category: "Snacks",
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80",
  },
  {
    id: "p-014",
    barcode: "7790001000147",
    name: "Chocolate Milka Leche 100g",
    price: 1990,
    category: "Snacks",
    stock: 33,
    image:
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&q=80",
  },
  {
    id: "p-015",
    barcode: "7790001000154",
    name: "Helado Frigor 1L",
    price: 4890,
    category: "Congelados",
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&q=80",
  },
  {
    id: "p-016",
    barcode: "7790001000161",
    name: "Pechuga de Pollo kg",
    price: 3990,
    category: "Carnicería",
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&q=80",
  },
  {
    id: "p-017",
    barcode: "7790001000178",
    name: "Yogur Yogurísimo Frutilla 900g",
    price: 1890,
    category: "Lácteos",
    stock: 24,
    image:
      "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300&q=80",
  },
  {
    id: "p-018",
    barcode: "7790001000185",
    name: "Queso Cremoso La Paulina 500g",
    price: 4150,
    category: "Lácteos",
    stock: 16,
    image:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&q=80",
  },
  {
    id: "p-019",
    barcode: "7790001000192",
    name: "Cerveza Quilmes 1L",
    price: 2350,
    category: "Bebidas",
    stock: 48,
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&q=80",
  },
  {
    id: "p-020",
    barcode: "7790001000208",
    name: "Lavandina Ayudín 1L",
    price: 990,
    category: "Limpieza",
    stock: 55,
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&q=80",
  },
];
