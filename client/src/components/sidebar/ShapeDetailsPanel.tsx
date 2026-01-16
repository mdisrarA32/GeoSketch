import { Shape } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import * as turf from "@turf/turf";

interface ShapeDetailsPanelProps {
  shape: Shape | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const getDotColor = (type: string) => {
  switch (type) {
    case 'rectangle': return 'bg-orange-500';
    case 'circle': return 'bg-pink-500';
    case 'polygon': return 'bg-blue-500';
    case 'line': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
};

const formatValue = (val: number | undefined) => (val ? val.toFixed(2) : "0.00");

export function ShapeDetailsPanel({ shape, onClose, onDelete }: ShapeDetailsPanelProps) {
  if (!shape) return null;

  const measurements = shape.measurements as any;
  const geoJson = shape.geoJson as any;
  
  // Calculate center for display
  let center: [number, number] | null = null;
  try {
    const centroid = turf.centroid(geoJson);
    center = [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]];
  } catch (e) {
    console.error("Centroid calculation failed", e);
  }

  return (
    <div className="w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full", getDotColor(shape.type))} />
          <h2 className="text-lg font-bold text-white truncate max-w-[180px]">{shape.name}</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</span>
              <p className="text-sm font-medium text-slate-200 capitalize">{shape.type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {shape.type === 'line' ? 'Length' : 'Area'}
              </span>
              <p className="text-sm font-medium text-slate-200">
                {shape.type === 'line' 
                  ? `${formatValue(measurements.length)} m` 
                  : `${formatValue(measurements.area)} m²`}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Center Coordinates</span>
            <p className="text-sm font-mono text-slate-300">
              {center ? `${center[0].toFixed(6)}, ${center[1].toFixed(6)}` : 'N/A'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Created At</span>
            <p className="text-sm font-medium text-slate-300">
              {format(new Date(shape.createdAt), "MMM d, yyyy • HH:mm:ss")}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shape ID</span>
            <p className="text-[10px] font-mono text-slate-500 break-all bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
              {shape.id}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-800 bg-slate-950/30">
        <Button 
          variant="destructive" 
          className="w-full h-11 rounded-xl font-bold gap-2 shadow-lg shadow-red-900/20"
          onClick={() => onDelete(shape.id)}
        >
          <Trash2 className="h-4 w-4" />
          Delete Shape
        </Button>
      </div>
    </div>
  );
}
