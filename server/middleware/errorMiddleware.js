export const errorHandler = (err, req, res, next) => {
  // Log the error with context
  console.error('=== Global Error Handler ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Method:', req.method);
  console.error('URL:', req.url);
  console.error('User ID:', req.user?._id || 'Not authenticated');
  console.error('Error Type:', err.constructor.name);
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  console.error('Request Body:', req.body);
  console.error('Request Query:', req.query);
  console.error('Request Params:', req.params);
  console.error('=== End Error Log ===');

  // Determine status code
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    code = 'UPLOAD_ERROR';
  }

  // Prepare error response
  const errorResponse = {
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Add validation errors if available
  if (err.errors) {
    errorResponse.errors = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message,
      value: err.errors[key].value
    }));
  }

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      code: err.code,
      statusCode: err.statusCode
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// Async error wrapper for controllers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error helper
export const createValidationError = (field, message) => {
  const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  error.errors = { [field]: { message, value: undefined } };
  return error;
};

// Not found error helper
export const createNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Unauthorized error helper
export const createUnauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

// Forbidden error helper
export const createForbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

// Use proper status codes:
// 200 for success
// 400 for invalid/expired token
// 404 for user not found
// 500 for server errors