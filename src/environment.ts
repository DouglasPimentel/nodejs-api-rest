import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const isProd: boolean = process.env.NODE_ENV === "production";
export const isDev: boolean = process.env.NODE_ENV === "development";
