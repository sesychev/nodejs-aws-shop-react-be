export class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class DatabaseConnectionError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message); // Error Establishing a Database Connection
        this.name = 'DatabaseConnectionError';
        this.statusCode = 500;
    }
}

export class ValidationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message); // Product data is invalid
        this.name = "ValidationError";
        this.statusCode = 400;
    }
}
