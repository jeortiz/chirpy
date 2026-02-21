import { NextFunction, Request, Response } from "express";

export function middlewareLogResponses(req: Request, res: Response, nextFunc: NextFunction): void {
    res.on("finish",() => {
        const statusCode = res.statusCode;

        if (statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });

    nextFunc();

}