import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Environment validation schemas
const DatabaseConfigSchema = z.object({
  DB_HOST_1: z.string().min(1, 'DB_HOST_1 is required'),
  DB_PORT_1: z.string().regex(/^\d+$/, 'DB_PORT_1 must be a number').transform(Number),
  DB_USER_1: z.string().min(1, 'DB_USER_1 is required'),
  DB_PASSWORD_1: z.string().min(1, 'DB_PASSWORD_1 is required'),
  DB_HOST_2: z.string().min(1, 'DB_HOST_2 is required'),
  DB_PORT_2: z.string().regex(/^\d+$/, 'DB_PORT_2 must be a number').transform(Number),
  DB_USER_2: z.string().min(1, 'DB_USER_2 is required'),
  DB_PASSWORD_2: z.string().min(1, 'DB_PASSWORD_2 is required'),
});

const ServerConfigSchema = z.object({
  SERVER1_PORT: z.string().regex(/^\d+$/, 'SERVER1_PORT must be a number').transform(Number),
  SERVER1_API_KEY: z.string().min(1, 'SERVER1_API_KEY is required'),
  SERVER1_URL: z.string().url('SERVER1_URL must be a valid URL'),
  SERVER2_PORT: z.string().regex(/^\d+$/, 'SERVER2_PORT must be a number').transform(Number),
  SERVER2_API_KEY: z.string().min(1, 'SERVER2_API_KEY is required'),
  SERVER2_URL: z.string().url('SERVER2_URL must be a valid URL'),
});

const AppConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Combined environment schema
const EnvironmentSchema = DatabaseConfigSchema.merge(ServerConfigSchema).merge(AppConfigSchema);

// Validate environment variables
const validateEnv = () => {
  try {
    return EnvironmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated config
export const config = validateEnv();

// Database configurations
export const databaseConfig = {
  server1: {
    host: config.DB_HOST_1,
    port: config.DB_PORT_1,
    user: config.DB_USER_1,
    password: config.DB_PASSWORD_1,
  },
  server2: {
    host: config.DB_HOST_2,
    port: config.DB_PORT_2,
    user: config.DB_USER_2,
    password: config.DB_PASSWORD_2,
  },
};

// Server configurations
export const serverConfig = {
  server1: {
    port: config.SERVER1_PORT,
    apiKey: config.SERVER1_API_KEY,
    url: config.SERVER1_URL,
  },
  server2: {
    port: config.SERVER2_PORT,
    apiKey: config.SERVER2_API_KEY,
    url: config.SERVER2_URL,
  },
};

// App configuration
export const appConfig = {
  nodeEnv: config.NODE_ENV,
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
}; 