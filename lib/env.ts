import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_POOLED: z.string().url().optional().or(z.literal("")),
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.string().url().default("http://localhost:3000"),
  RATE_LIMIT_REDIS_URL: z.string().url().optional().or(z.literal("")),
  AI_PROVIDER_API_KEY: z.string().optional(),
  MONITORING_DSN: z.string().optional(),
});

function getEnv() {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED,
    SESSION_SECRET: process.env.SESSION_SECRET,
    APP_URL: process.env.APP_URL,
    RATE_LIMIT_REDIS_URL: process.env.RATE_LIMIT_REDIS_URL,
    AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY,
    MONITORING_DSN: process.env.MONITORING_DSN,
  });
}

export const env = {
  get DATABASE_URL() { return getEnv().DATABASE_URL; },
  get DATABASE_URL_POOLED() { return getEnv().DATABASE_URL_POOLED || undefined; },
  get SESSION_SECRET() { return getEnv().SESSION_SECRET; },
  get APP_URL() { return getEnv().APP_URL; },
  get RATE_LIMIT_REDIS_URL() { return getEnv().RATE_LIMIT_REDIS_URL || undefined; },
  get AI_PROVIDER_API_KEY() { return getEnv().AI_PROVIDER_API_KEY || undefined; },
  get MONITORING_DSN() { return getEnv().MONITORING_DSN || undefined; },
};
