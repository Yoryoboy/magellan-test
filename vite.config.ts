import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const token = env.NOTION_API_KEY ?? process.env.NOTION_API_KEY;

  if (command === "serve" && !token) {
    throw new Error(
      "NOTION_API_KEY is not set. Add it to .env (server-side only, never VITE_-prefixed) before starting the dev server."
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api/notion": {
          target: "https://api.notion.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/notion/, "/v1"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("Authorization", `Bearer ${token}`);
              proxyReq.setHeader("Notion-Version", "2022-06-28");
            });
          },
        },
      },
    },
  };
});
