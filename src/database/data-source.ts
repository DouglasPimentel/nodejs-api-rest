import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { isDev } from "#/environment";
import { User } from "#/modules/user/user.entity";
import { Tool } from "#/modules/tool/tool.entity";

dotenv.config({ path: ".env.local" });

const POSTGRES_HOST: string = process.env.POSTGRES_HOST!;
const POSTGRES_PORT: number = Number(process.env.POSTGRES_PORT);
const POSTGRES_USER: string = process.env.POSTGRES_USER!;
const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD!;
const POSTGRES_DATABASE: string = process.env.POSTGRES_DATABASE!;

const AppDataSource = new DataSource({
  type: "postgres",
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  synchronize: true,
  logging: isDev,
  entities: [User, Tool],
  subscribers: [],
  migrations: ["src/database/migrations/*.ts"],
  migrationsTableName: "custom_migration_table",
});

let db: DataSource;

async function initializeDatabase(): Promise<void> {
  db = await AppDataSource.initialize();
}

export { AppDataSource, db, initializeDatabase };
