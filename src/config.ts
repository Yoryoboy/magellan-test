// In Vite, we use import.meta.env instead of process.env
export const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY as string;
export const NOTION_DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID as string;

// Admin view password — change the VITE_ADMIN_PASSWORD line in .env to set a different one
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || "nomaianomaly";
