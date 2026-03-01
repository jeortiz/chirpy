import { NextFunction, Request, Response } from "express";
import { config, Platforms } from "../config.js";
import { cleanChirp, validateChirp } from "../utils/helpers.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import { createUser, deleteAllUsers } from "../db/queries/users.js";
import { createChirp } from "../db/queries/chirps.js";


export const handlerReadiness = async function (req: Request, res: Response): Promise<void> {
  res.status(200);
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
};

export async function handlePostChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    type chirpData = {
        body: string
        userId: string
    }
    
    if ((req.body as chirpData).userId === undefined) {
        throw new BadRequestError();
    }

    const postBody: chirpData = req.body;

    const isValid = validateChirp(postBody.body);

    if (isValid) {
        const newChirp = await createChirp(postBody);

        newChirp.body = cleanChirp(newChirp.body);
        res.status(201)
            .send(JSON.stringify(newChirp));
    } else {
        throw(new BadRequestError("Chirp is too long. Max length is 140"));
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

    if (config.platform !== Platforms.DEV) {
        throw new UnauthorizedError();
    }

    resp.status(200);
    resp.set("Content-Type", "text/plain; charset=utf-8");

    config.fileServerHits = 0;

    deleteAllUsers();

    resp.send("OK");
};

export async function handlePostUsers(req: Request, resp: Response): Promise<void> {
    if (!req.body.email) {
        throw new BadRequestError("User email not provided");
    }

    const newUser = await createUser({email: req.body.email});

    resp.status(201)
        .set("Content-Type", "application/json; charset=utf-8")
        .send(JSON.stringify(newUser));
}
