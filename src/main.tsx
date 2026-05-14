import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ProfileBootstrap } from "./ProfileBootstrap.tsx";
import { registerCatalogAutoSave } from "./store/catalogStorage";

registerCatalogAutoSave();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProfileBootstrap />
    <App />
  </StrictMode>,
);
