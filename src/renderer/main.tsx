import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Renderer: Starting React app...");

const rootElement = document.getElementById("root");
console.log("Renderer: Root element found:", !!rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Renderer: React app rendered successfully");
} else {
  console.error("Renderer: Root element not found!");
}

