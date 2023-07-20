class AppError extends Error {
  constructor(message, statusCode) {
    //message
    const defaultMessage = "Oops! Something went wrong";
    message = message || defaultMessage;
    super(message);

    this.statusCode = statusCode || 500;
    this.status = String(this.statusCode).startsWith("4") ? "Fail" : "Error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
