export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Use proper status codes:
// 200 for success
// 400 for invalid/expired token
// 404 for user not found
// 500 for server errors