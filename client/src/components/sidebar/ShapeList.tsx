import { Shape } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trash2, 
  Hexagon, 
  Square, 
  Circle, 
  Ruler, 
  MousePointer2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ShapeListProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'polygon': return Hexagon;
    case 'rectangle': return Square;
    case 'circle': return Circle;
    case 'line': return Ruler;
    default: return MousePointer2;
  }
};

const formatMeasurement = (shape: Shape) => {
  const m = shape.measurements as any;
  if (shape.type === 'line') {
    return `${(m.length || 0).toFixed(2)} m`;
  }
  const area = m.area || 0;
  if (area > 1000000) return `${(area / 1000000).toFixed(2)} km²`;
  return `${area.toFixed(2)} m²`;
};

export function ShapeList({ shapes, selectedId, onSelect, onDelete }: ShapeListProps) {
  if (shapes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <MousePointer2 className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm">No shapes drawn yet.</p>
        <p className="text-xs">Use the toolbar to start drawing.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-14rem)] pr-4 custom-scrollbar">
      <div className="space-y-3">
        {shapes.map((shape) => {
          const Icon = getIcon(shape.type);
          const isSelected = selectedId === shape.id;

          return (
            <div
              key={shape.id}
              className={cn(
                "group relative flex flex-col p-3 rounded-xl border bg-card transition-all duration-200 cursor-pointer hover:shadow-md",
                isSelected ? "border-primary ring-1 ring-primary/20 shadow-lg scale-[1.02]" : "hover:border-primary/50"
              )}
              onClick={() => onSelect(shape.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-secondary text-secondary-foreground",
                    isSelected && "bg-primary text-primary-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm leading-none mb-1">{shape.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {shape.type} • {format(new Date(shape.createdAt), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(shape.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Measurement</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {formatMeasurement(shape)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
