import { Shape } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trash2, 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShapeListProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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

export function ShapeList({ shapes, selectedId, onSelect, onDelete }: ShapeListProps) {
  if (shapes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <p className="text-sm italic">No shapes found</p>
      </div>
    );
  }

  // Group by type
  const grouped = shapes.reduce((acc, shape) => {
    if (!acc[shape.type]) acc[shape.type] = [];
    acc[shape.type].push(shape);
    return acc;
  }, {} as Record<string, Shape[]>);

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-6">
        {Object.entries(grouped).map(([type, typeShapes]) => (
          <div key={type} className="space-y-2">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              {type}s
            </h5>
            <div className="space-y-1">
              {typeShapes.map((shape) => {
                const isSelected = selectedId === shape.id;
                return (
                  <div
                    key={shape.id}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "bg-slate-800 text-white shadow-inner" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    )}
                    onClick={() => onSelect(shape.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", getDotColor(shape.type))} />
                      <span className="text-sm font-medium truncate">{shape.name}</span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(shape.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
