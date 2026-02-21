import express from "express";
import { Response, Request } from "express"
import { middlewareLogResponses } from "./utils/middleware.js";

const app = express();
const PORT = 8080;

const handlerReadiness = async function (req: Request, resp: Response): Promise<void> {
    resp.status(200);
    resp.set("Content-Type", "text/plain; charset=utf-8");
    resp.send("OK")
}

app.use(middlewareLogResponses);

app.use("/app", express.static("./src/app"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});