import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode = 500, message } = err;

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 'ENOTFOUND') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service unavailable';
  }

  // Don't leak error details in production
  if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Send error response
  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
  });
};

// Custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error factory functions
export const createError = (
  message: string,
  statusCode: number,
  code: string
) => {
  return new CustomError(message, statusCode, code);
};

export const badRequest = (message: string) =>
  createError(message, 400, 'BAD_REQUEST');
export const unauthorized = (message: string) =>
  createError(message, 401, 'UNAUTHORIZED');
export const forbidden = (message: string) =>
  createError(message, 403, 'FORBIDDEN');
export const notFound = (message: string) =>
  createError(message, 404, 'NOT_FOUND');
export const conflict = (message: string) =>
  createError(message, 409, 'CONFLICT');
export const tooManyRequests = (message: string) =>
  createError(message, 429, 'TOO_MANY_REQUESTS');
export const internalError = (message: string) =>
  createError(message, 500, 'INTERNAL_ERROR');
