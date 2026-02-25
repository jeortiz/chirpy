
export class CustomError extends Error {
    statusCode = 500;
    constructor(message: string) {
        super(message);
    }
}

export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(message: string = "Bad Request") {
        super(message);
    }
}

export class UnauthorizedError extends CustomError {
    statusCode = 401;
    constructor(message: string = "Unauthorized") {
        super(message);
    }
}

export class ForbiddenError extends CustomError {
    statusCode = 403;
    
    constructor(message: string = "Forbidden") {
        super(message);
    }
}

export class NotFoundError extends CustomError {
    statusCode = 404;

    constructor(message: string = "Not Found") {
        super(message);
    }
}