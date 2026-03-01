import type { MigrationConfig } from "drizzle-orm/migrator";

const migrationConfig: MigrationConfig = {
  migrationsFolder: "src/db/data",
};

export enum Platforms {
    DEV = 'dev',
    PROD = 'prod',
}

type DBConfig = {
    migrationConfig: MigrationConfig,
    connectionString: string,
}

type APIConfig = {
    fileServerHits: number
    platform: string
    db: DBConfig
}

process.loadEnvFile(".env");

export const config: APIConfig = { 
    fileServerHits: 0,
    platform: envOrThrow("PLATFORM"),
    db: {
        migrationConfig,
        connectionString: envOrThrow("DB_URL"),
    }
}

function envOrThrow(key: string): string {
    if (!(key in process.env)) {
        throw new Error;
    }

    return process.env[key] as string
}