import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@bundlros/ui/styles/global.css";

// Fix for modules using process.env
(window as any).process = { env: { API_KEY: "" } };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
