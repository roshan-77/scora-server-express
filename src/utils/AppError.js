class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    //This will give the stack trace of which function and line it failed
    //First param is the target error object (this), 2nd is optional used to exclude the constructor of AppError
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
