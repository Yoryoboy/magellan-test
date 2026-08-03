// In Vite, we use import.meta.env instead of process.env
export const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY as string;
export const NOTION_DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID as string;
