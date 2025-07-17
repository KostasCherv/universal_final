import { z } from 'zod';

// Zod Schemas
export const ServerConfigSchema = z.object({
  port: z.number().int().positive(),
  apiKey: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url()
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    timestamp: z.string().datetime()
  });

export const InterServerRequestSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1)
});

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  createdAt: z.date()
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  description: z.string().optional(),
  stock: z.number().int().min(0)
});
;

// TypeScript Types (inferred from Zod schemas)
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type ApiResponse<T = any> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodAny>>>;
export type InterServerRequest = z.infer<typeof InterServerRequestSchema>;
export type User = z.infer<typeof UserSchema>;
export type Product = z.infer<typeof ProductSchema>;

// Specific API Response Types
export type UserApiResponse = z.infer<ReturnType<typeof ApiResponseSchema<typeof UserSchema>>>;
export type UsersApiResponse = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodArray<typeof UserSchema>>>>;
export type ProductApiResponse = z.infer<ReturnType<typeof ApiResponseSchema<typeof ProductSchema>>>;
export type ProductsApiResponse = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodArray<typeof ProductSchema>>>>;
export type CountApiResponse = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodObject<{ count: z.ZodNumber }>>>>;
