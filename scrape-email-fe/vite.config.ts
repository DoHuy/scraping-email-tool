import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ globals: { global: true, process: true, Buffer: true } }),
  ],
  server: {
    cors: {
      origin: "*", // Allows all origins
      methods: ["GET", "POST", "PUT", "DELETE"], // Example methods
      allowedHeaders: ["Content-Type"], // Example headers
      credentials: true, // Example credentials setting
    },
    port: 8000, // Change this to your desired port
    open: true, // Automatically open the browser
  },
});
