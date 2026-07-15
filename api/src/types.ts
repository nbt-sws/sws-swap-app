import type { Hono } from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    tenantId: string;
    userId: string;
    userTier: string;
    userEmail: string;
  }
}

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}
