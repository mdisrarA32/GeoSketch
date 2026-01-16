import { z } from 'zod';
import { insertShapeSchema, shapes } from './schema';

// Minimal routes definitions for the frontend structure.
// Since the app is frontend-only using LocalStorage, these are primarily for type inference checks
// and structure compatibility.

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Placeholder for any future API needs
  status: {
    get: {
      method: 'GET' as const,
      path: '/api/status',
      responses: {
        200: z.object({ status: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
