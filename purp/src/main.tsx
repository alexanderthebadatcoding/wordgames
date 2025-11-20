// import { QueryClient } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
// import { WagmiProvider } from "wagmi";

import App from "./App.tsx";
// import { config } from "./wagmi.ts";

import "./index.css";

// Toggle dark mode on app load or via button
const html = document.documentElement;

// Add dark mode
html.classList.add("dark");

// const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <footer>
      <div className="flex items-center justify-center flex-col">
        <a href="https://bracky.app" className="hover:text-accent underline">
          Check Bracky for prices
        </a>
      </div>
    </footer>
  </React.StrictMode>
);
