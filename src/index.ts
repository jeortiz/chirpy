import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./utils/middleware.js";
import { handleMetrics, handleResetMetrics, handlerReadiness, handleValidateChirp } from "./api/index.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handleMetrics);
app.post("/admin/reset", handleResetMetrics);

app.post("/api/validate_chirp", handleValidateChirp);

app.get("/api/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});