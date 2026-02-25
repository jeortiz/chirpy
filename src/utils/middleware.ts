import { NextFunction, Request, Response } from "express";
import { config } from "../config.js"

export function middlewareLogResponses(req: Request, res: Response, nextFunc: NextFunction): void {
    res.on("finish",() => {
        const statusCode = res.statusCode;

        if (statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });

    nextFunc();

}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction): void {

  config.fileServerHits += 1;

  next();
}

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.log(error);
    res.status(500).json({"error": "Something went wrong on our end"});
}