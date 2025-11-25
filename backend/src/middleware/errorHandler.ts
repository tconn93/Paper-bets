import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Handle PostgreSQL errors
  if ('code' in err) {
    const pgError = err as any;

    // Unique constraint violation
    if (pgError.code === '23505') {
      const field = pgError.detail?.match(/\(([^)]+)\)/)?.[1] || 'field';
      return res.status(409).json({
        success: false,
        error: `${field} already exists`,
      });
    }

    // Foreign key violation
    if (pgError.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Referenced record does not exist',
      });
    }

    // Check constraint violation
    if (pgError.code === '23514') {
      return res.status(400).json({
        success: false,
        error: 'Invalid data provided',
      });
    }
  }

  // Default error response (500 Internal Server Error)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
