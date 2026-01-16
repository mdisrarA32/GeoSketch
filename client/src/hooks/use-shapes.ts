import { useState, useEffect, useCallback } from "react";
import { type Shape, SHAPE_LIMITS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import * as turf from "@turf/turf";

const STORAGE_KEY = "gis_app_shapes_v1";

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const { toast } = useToast();

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setShapes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse shapes", e);
      }
    }
  }, []);

  // Save to local storage whenever shapes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

  const addShape = useCallback((newShape: Shape) => {
    setShapes((prev) => {
      // Check limits
      const typeCount = prev.filter((s) => s.type === newShape.type).length;
      const limit = SHAPE_LIMITS[newShape.type as keyof typeof SHAPE_LIMITS] || 100;
      
      if (typeCount >= limit) {
        toast({
          title: "Limit Reached",
          description: `You can only create ${limit} ${newShape.type}s.`,
          variant: "destructive",
        });
        return prev;
      }

      // Check Spatial Constraints (Containment)
      // Only for Polygon, Rectangle (which is a polygon in GeoJSON), and Circle (approximated)
      if (newShape.type !== 'line') {
        const newGeo = newShape.geoJson as any;
        
        for (const existing of prev) {
          if (existing.type === 'line') continue;
          
          const existingGeo = existing.geoJson as any;

          // Check if new shape is INSIDE an existing shape
          try {
            if (turf.booleanContains(existingGeo, newGeo)) {
              toast({
                title: "Invalid Placement",
                description: "New shape cannot be completely inside an existing shape.",
                variant: "destructive",
              });
              return prev;
            }

            // Check if new shape CONTAINS an existing shape
            if (turf.booleanContains(newGeo, existingGeo)) {
              toast({
                title: "Invalid Placement",
                description: "New shape cannot completely enclose an existing shape.",
                variant: "destructive",
              });
              return prev;
            }
          } catch (err) {
            console.warn("Spatial check failed", err);
          }
        }
      }

      // Check Overlaps & Trim
      let finalGeo = newShape.geoJson as any;
      
      if (newShape.type !== 'line') {
        for (const existing of prev) {
          if (existing.type === 'line') continue;
          
          try {
            const existingGeo = existing.geoJson as any;
            if (turf.booleanOverlap(finalGeo, existingGeo) || turf.intersect(finalGeo, existingGeo)) {
               const difference = turf.difference(finalGeo, existingGeo);
               if (difference) {
                 finalGeo = difference;
                 toast({
                   title: "Shape Trimmed",
                   description: "Overlapping area was automatically removed.",
                 });
               } else {
                 // Completely overlapped/consumed
                 toast({
                   title: "Invalid Placement",
                   description: "Shape completely overlaps with existing area.",
                   variant: "destructive"
                 });
                 return prev;
               }
            }
          } catch (err) {
             console.warn("Overlap check failed", err);
          }
        }
      }
      
      // Recalculate area/length if geometry changed
      let newMeasurements = newShape.measurements;
      if (newShape.type !== 'line') {
        const areaSqM = turf.area(finalGeo);
        newMeasurements = { area: areaSqM };
      }

      const shapeToAdd = { 
        ...newShape, 
        geoJson: finalGeo,
        measurements: newMeasurements
      };

      return [...prev, shapeToAdd];
    });
  }, [toast]);

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Shape Deleted", description: "The shape has been removed." });
  }, [toast]);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  return {
    shapes,
    addShape,
    removeShape,
    updateShape,
  };
}
