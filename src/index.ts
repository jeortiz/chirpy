import express, { NextFunction, Request, Response } from "express";
import { errorHandler, middlewareLogResponses, middlewareMetricsInc } from "./utils/middleware.js";
import { handleMetrics, handlePostUsers, handleResetMetrics, handlerReadiness, handlePostChirp, handleGetAllChirps, handleGetChirp, handleLogin } from "./api/index.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.connectionString, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);


const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);

app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handleMetrics(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handleResetMetrics(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlePostChirp(req, res, next)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handleGetAllChirps(req, res, next)).catch(next);
});

app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handleGetChirp(req, res, next)).catch(next);
});

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlePostUsers(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
  Promise.resolve(handleLogin(req, res)).catch(next);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});