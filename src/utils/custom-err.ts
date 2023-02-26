export class CustomError extends Error {
  httpStatusCode: number;
  message: string;

  constructor(message: string, httpStatusCode: number = 500) {
    super();
    this.httpStatusCode = httpStatusCode;
    this.message = message;
  }
}
