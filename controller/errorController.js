const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handleDuplicateErrorDB = (err) => {
  const duplicateVal = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${duplicateVal}. Please use another value.`;
  return new AppError(message, 404);
};

const handleJsonWebTokenError = (error) => {
  return new AppError(`Token Error: ${error.message}`, 401);
};

const handleTokenExpiredError = (error) => {
  return new AppError(`Token Error: ${error.message}`, 401);
};

const sendErrorDev = (err, req, res, next) => {
  res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res, next) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  } else {
    //programming/ unknown errors that we dont want to leak
    console.error("ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res, next);
  } else {
    //production
    let error = Object.assign(err);
    //copy

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);
    if (error.name === "TokenExpiredError")
      error = handleTokenExpiredError(error);
    sendErrorProd(error, req, res, next);
  }
};
