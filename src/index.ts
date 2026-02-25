import express, { NextFunction, Request, Response } from "express";
import { errorHandler, middlewareLogResponses, middlewareMetricsInc } from "./utils/middleware.js";
import { handleMetrics, handleResetMetrics, handlerReadiness, handleValidateChirp } from "./api/index.js";

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

app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handleValidateChirp(req, res, next)).catch(next);
});

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});