import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MousePointer2, 
  Hexagon, 
  Square, 
  Circle as CircleIcon, 
  Ruler, 
  Plus,
  Minus,
  Undo2,
  Redo2,
  SeparatorHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMap } from "react-leaflet";

export type DrawingMode = "select" | "polygon" | "rectangle" | "circle" | "line";

interface DrawToolbarProps {
  mode: DrawingMode;
  setMode: (mode: DrawingMode) => void;
  onCancel: () => void;
}

export function DrawToolbar({ mode, setMode, onCancel }: DrawToolbarProps) {
  // We need access to the map for zoom controls
  // But DrawToolbar is rendered inside Home, not MapContainer
  // We'll handle this by letting the map events handle the logic if needed, 
  // or just using a standard zoom trigger. 
  // For now, let's keep the UI strictly as requested.

  const drawingTools = [
    { id: "polygon", icon: Hexagon, label: "Draw Polygon" },
    { id: "rectangle", icon: Square, label: "Draw Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Draw Circle" },
    { id: "line", icon: Ruler, label: "Draw Line" },
  ] as const;

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800">
      {drawingTools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-xl transition-all duration-200",
                mode === tool.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              onClick={() => setMode(tool.id as DrawingMode)}
            >
              <tool.icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white">
            {tool.label}
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="w-8 h-px bg-slate-800 my-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => {
              // This will be handled via a global event or prop if we want it to work perfectly
              window.dispatchEvent(new CustomEvent('map-zoom-in'));
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white">Zoom In</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('map-zoom-out'));
            }}
          >
            <Minus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white">Zoom Out</TooltipContent>
      </Tooltip>

      <div className="w-8 h-px bg-slate-800 my-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white">Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Redo2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white">Redo</TooltipContent>
      </Tooltip>
    </div>
  );
}
