import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs";
import path from "path";
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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
    },
    host: "0.0.0.0",
    port: 8000, // Change this to your desired port
    open: true, // Automatically open the browser
  },
});
