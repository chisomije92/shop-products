export class CustomError extends Error {
    constructor(message, httpStatusCode = 500) {
        super();
        this.httpStatusCode = httpStatusCode;
        this.message = message;
    }
}
//# sourceMappingURL=custom-err.js.map