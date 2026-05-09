import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.code).json({
      error: error.error,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Request validation failed',
      code: 400,
      details: error.flatten(),
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    code: 500,
  });
};
