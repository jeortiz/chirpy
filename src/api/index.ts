import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { cleanChirp, validateChirp } from "../utils/helpers.js";


export const handlerReadiness = async function (req: Request, res: Response): Promise<void> {
  res.status(200);
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
};

export async function handleValidateChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    type validateChirpData = {
        body: string
    }

    try {
        const postBody: validateChirpData = req.body;

        const isValid = validateChirp(postBody.body);

        if (isValid) {
            const validResponse = {"cleanedBody": cleanChirp(postBody.body)};
            res.status(200).send(JSON.stringify(validResponse));
        } else {
            // const error = {"error": "Chirp is too long"};
            // res.status(400).send(JSON.stringify(error));
            throw("Chirp is too long");
        }
    } catch (error) {
        next(error);
    }
}

export const handleMetrics = async function (req: Request, resp: Response): Promise<void> {
  resp.status(200);
  resp.set("Content-Type", "text/html; charset=utf-8");

  console.log(`Hits: ${config.fileServerHits}`);

  resp.send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileServerHits} times!</p>
            </body>
        </html>
    `);
};

export const handleResetMetrics = async function (req: Request, resp: Response): Promise<void> {
  resp.status(200);
  resp.set("Content-Type", "text/plain; charset=utf-8");

  config.fileServerHits = 0;

  resp.send("OK");
};
