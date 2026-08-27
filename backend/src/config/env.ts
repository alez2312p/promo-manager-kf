import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(65535)),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z
    .string({
      required_error: 'DATABASE_URL is required',
    })
    .url({
      message: 'DATABASE_URL must be a valid connection URL (e.g. postgresql://user:pass@host:port/db)',
    }),
  CORS_ORIGIN: z
    .string()
    .default('*'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ [CONFIG] Invalid environment variables:');
    const formattedErrors = result.error.format();
    
    // Iterate and print each validation error
    for (const [key, value] of Object.entries(formattedErrors)) {
      if (key === '_errors') continue;
      const errors = (value as { _errors?: string[] })?._errors;
      if (errors && errors.length > 0) {
        console.error(`  - ${key}: ${errors.join(', ')}`);
      }
    }

    throw new Error(
      `Environment validation failed. Please check your .env file. Missing or invalid variables: ${Object.keys(
        result.error.flatten().fieldErrors
      ).join(', ')}`
    );
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
