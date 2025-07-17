import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          timestamp: new Date().toISOString()
        });
      }
      return next(error);
    }
  };
};

export const validateResponse = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      try {
        schema.parse(data);
        return originalJson.call(this, data);
      } catch (error) {
        if (error instanceof ZodError) {
          console.error('Response validation error:', error.errors);
          return originalJson.call(this, {
            success: false,
            message: 'Internal validation error',
            timestamp: new Date().toISOString()
          });
        }
        return originalJson.call(this, data);
      }
    };
    
    next();
  };
};
