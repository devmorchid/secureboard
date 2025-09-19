import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy common Laravel auth and API routes to backend to avoid CORS during local development
      // This forwards requests like /sanctum/csrf-cookie, /login, /register, /logout and /api/*
      '^/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
      '^/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // If the browser is requesting HTML (navigating to /login), bypass the proxy
        // and let Vite serve index.html (SPA route). Only proxy XHR/fetch requests.
        bypass: (req) => {
          const accept = req.headers && (req.headers.accept as string | undefined);
          if (accept && accept.includes('text/html')) return '/index.html';
        },
      },
      '^/logout': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          const accept = req.headers && (req.headers.accept as string | undefined);
          if (accept && accept.includes('text/html')) return '/index.html';
        },
      },
      '^/register': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          const accept = req.headers && (req.headers.accept as string | undefined);
          if (accept && accept.includes('text/html')) return '/index.html';
        },
      },
      '^/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '^/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
