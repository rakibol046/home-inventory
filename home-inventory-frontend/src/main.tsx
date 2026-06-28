import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/global.css";
import App from "./App.tsx";
import { Providers } from "./app/providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
