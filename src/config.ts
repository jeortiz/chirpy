type APIConfig = {
    fileServerHits: number
    dbURL: string
}

process.loadEnvFile("../.env");

export const config: APIConfig = { 
    fileServerHits: 0,
    dbURL: envOrThrow("DB_URL"),
}

function envOrThrow(key: string): string {
    if (!(key in process.env)) {
        throw new Error;
    }

    return process.env[key] as string
}