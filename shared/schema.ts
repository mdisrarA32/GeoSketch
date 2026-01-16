import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Although this is a frontend-only app, we define the schema here for type consistency
// and potential future backend integration.

export const shapes = pgTable("shapes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'polygon', 'rectangle', 'circle', 'line'
  geoJson: jsonb("geo_json").notNull(), // Store the full GeoJSON Feature
  measurements: jsonb("measurements").notNull(), // Area (sq m) or Length (m)
  createdAt: text("created_at").notNull(),
});

export const insertShapeSchema = createInsertSchema(shapes);

export type Shape = typeof shapes.$inferSelect;
export type InsertShape = z.infer<typeof insertShapeSchema>;

// Configuration limits (can be imported by frontend)
export const SHAPE_LIMITS = {
  polygon: 10,
  rectangle: 5,
  circle: 5,
  line: 20
} as const;
