const errorMiddleware = (error, req, res, next) => {
  console.error(error);
  const statusCode = error.statusCode || 500;

  const message = error.isOperational ? error.message : "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message: message || "Internal server Error",
  });
};

export default errorMiddleware;
