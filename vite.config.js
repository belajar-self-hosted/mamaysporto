import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    host: "127.0.0.1",
    port: 3333,
    proxy: {
      "/api/chat": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api": {
        target: process.env.VITE_API_URL || "http://100.69.196.46:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
