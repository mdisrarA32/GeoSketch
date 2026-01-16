import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple health check endpoint
  app.get(api.status.get.path, (_req, res) => {
    res.json({ status: "online" });
  });

  return httpServer;
}
