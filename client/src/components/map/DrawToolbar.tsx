import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MousePointer2, 
  Hexagon, 
  Square, 
  Circle as CircleIcon, 
  Ruler, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawingMode = "select" | "polygon" | "rectangle" | "circle" | "line";

interface DrawToolbarProps {
  mode: DrawingMode;
  setMode: (mode: DrawingMode) => void;
  onCancel: () => void;
}

export function DrawToolbar({ mode, setMode, onCancel }: DrawToolbarProps) {
  const tools = [
    { id: "select", icon: MousePointer2, label: "Select Mode (ESC)" },
    { id: "polygon", icon: Hexagon, label: "Draw Polygon" },
    { id: "rectangle", icon: Square, label: "Draw Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Draw Circle" },
    { id: "line", icon: Ruler, label: "Draw Line" },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background/95 backdrop-blur shadow-lg border rounded-full p-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-4 duration-300">
      {tools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <Button
              variant={mode === tool.id ? "default" : "ghost"}
              size="icon"
              className={cn(
                "rounded-full h-10 w-10 transition-all", 
                mode === tool.id && "shadow-md scale-105"
              )}
              onClick={() => setMode(tool.id as DrawingMode)}
            >
              <tool.icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs font-medium">
            {tool.label}
          </TooltipContent>
        </Tooltip>
      ))}

      {mode !== "select" && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full h-10 w-10"
                onClick={onCancel}
              >
                <X className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Cancel Drawing</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
