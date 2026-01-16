import { useState, useEffect, useCallback, useRef } from "react";
import { type Shape, SHAPE_LIMITS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import * as turf from "@turf/turf";

const STORAGE_KEY = "gis_app_shapes_v1";

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  const isInternalUpdate = useRef(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setShapes(parsed);
        setHistory([parsed]);
        setHistoryIndex(0);
      } catch (e) {
        console.error("Failed to parse shapes", e);
      }
    } else {
      setHistory([[]]);
      setHistoryIndex(0);
    }
  }, []);

  // Save to local storage whenever shapes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
    
    if (!isInternalUpdate.current) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(shapes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    isInternalUpdate.current = false;
  }, [shapes]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isInternalUpdate.current = true;
      const prevIndex = historyIndex - 1;
      setShapes(history[prevIndex]);
      setHistoryIndex(prevIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isInternalUpdate.current = true;
      const nextIndex = historyIndex + 1;
      setShapes(history[nextIndex]);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  const addShape = useCallback((newShape: Shape) => {
    setShapes((prev) => {
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

      if (newShape.type !== 'line') {
        const newGeo = newShape.geoJson as any;
        const newFeature = turf.feature(newGeo.geometry || newGeo);
        
        for (const existing of prev) {
          if (existing.type === 'line') continue;
          
          const existingGeo = existing.geoJson as any;
          const existingFeature = turf.feature(existingGeo.geometry || existingGeo);

          try {
            if (turf.booleanContains(existingFeature, newFeature) || turf.booleanWithin(newFeature, existingFeature)) {
              toast({
                title: "Invalid Placement",
                description: "New shape cannot be completely inside or enclose an existing shape.",
                variant: "destructive",
              });
              return prev;
            }

            if (turf.booleanContains(newFeature, existingFeature)) {
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

      let finalGeo = newShape.geoJson as any;
      if (newShape.type !== 'line') {
        let finalFeature = turf.feature(finalGeo.geometry || finalGeo);

        for (const existing of prev) {
          if (existing.type === 'line') continue;
          
          try {
            const existingGeo = existing.geoJson as any;
            const existingFeature = turf.feature(existingGeo.geometry || existingGeo);

            if (turf.booleanIntersects(finalFeature, existingFeature)) {
               const diff = turf.difference(turf.featureCollection([finalFeature, existingFeature]));
               if (diff) {
                 finalFeature = diff;
                 toast({
                   title: "Shape Trimmed",
                   description: "Overlapping area was automatically removed.",
                 });
               } else {
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
        finalGeo = finalFeature.geometry;
      }
      
      let newMeasurements = newShape.measurements;
      if (newShape.type !== 'line') {
        const areaSqM = turf.area(finalGeo);
        newMeasurements = { area: areaSqM };
      }

      return [...prev, { 
        ...newShape, 
        geoJson: finalGeo,
        measurements: newMeasurements
      }];
    });
  }, [toast]);

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Shape Deleted", description: "The shape has been removed." });
  }, [toast]);

  const updateShape = useCallback((updatedShape: Shape) => {
    setShapes((prev) => prev.map((s) => (s.id === updatedShape.id ? updatedShape : s)));
  }, []);

  return {
    shapes,
    addShape,
    removeShape,
    updateShape,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}
