import { NextFunction, Request, Response } from "express";
import { config, Platforms } from "../config.js";
import { cleanChirp, validateChirp } from "../utils/helpers.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { createUser, deleteAllUsers, getUserBy } from "../db/queries/users.js";
import { createChirp, getAllChirps, getChirp } from "../db/queries/chirps.js";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { NewUser } from "src/db/schema.js";


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

export async function handleGetAllChirps(req: Request, resp: Response, next: NextFunction): Promise<void> {
    const results = await getAllChirps();

    resp.status(200);
    resp.send(JSON.stringify(results));
    
}

export async function handleGetChirp(req: Request, resp: Response, next: NextFunction): Promise<void> {

    if (!req.params.chirpId) {
        throw new Error();
    }

    const result = await getChirp(req.params.chirpId as string);

    if (!result) {
        throw new NotFoundError();
    }
    
    resp.status(200);
    resp.send(JSON.stringify(result));
    
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
    if (!req.body.password) {
        throw new BadRequestError("User password not provided");
    }

    const hashedPassword = await hashPassword(req.body.password);

    const newUser = await createUser({email: req.body.email, hashedPassword});

    resp.status(201)
        .set("Content-Type", "application/json; charset=utf-8")
        .send(JSON.stringify(newUser));
}

export async function handleLogin(req: Request, resp: Response): Promise<void> {

    type UserResponse = Omit<NewUser, "hashedPassword">;

    if (!req.body.email) {
        throw new BadRequestError("User email not provided");
    }
    if (!req.body.password) {
        throw new BadRequestError("User password not provided");
    }

    const userData = await getUserBy(req.body.email);

    if (!userData || !userData.hashedPassword) {
        throw new UnauthorizedError("incorrect email or password");
    }

    if (await checkPasswordHash(req.body.password, userData.hashedPassword)) {

        const userResponse: UserResponse = {
            email: userData.email,
            id: userData.id,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        }

        resp.status(200)
            .set("Content-Type", "application/json; charset=utf-8")
            .send(JSON.stringify(userResponse));
    } else {
        throw new UnauthorizedError("incorrect email or password");
    }
}
