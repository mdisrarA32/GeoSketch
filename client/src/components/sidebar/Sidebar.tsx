import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Map as MapIcon, Download, Layers } from "lucide-react";
import { ShapeList } from "./ShapeList";
import { Shape } from "@shared/schema";
import { useSearchPlaces } from "@/hooks/use-search-places";
import { ColorModeToggle } from "@/components/ui/color-mode-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SidebarProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelectShape: (id: string) => void;
  onDeleteShape: (id: string) => void;
  onSearchSelect: (lat: number, lon: number) => void;
  onExport: () => void;
}

export function Sidebar({ 
  shapes, 
  selectedId, 
  onSelectShape, 
  onDeleteShape, 
  onSearchSelect,
  onExport
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: places, isLoading } = useSearchPlaces(searchQuery);

  const handleSearchSelect = (lat: string, lon: string) => {
    onSearchSelect(parseFloat(lat), parseFloat(lon));
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r z-20 w-80 lg:w-96 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-primary">
            <MapIcon className="h-6 w-6" />
            <h1 className="font-bold text-xl tracking-tight text-foreground">GeoSketch</h1>
          </div>
          <ColorModeToggle />
        </div>

        {/* Search */}
        <div className="relative">
          <Popover open={open && (places?.length ?? 0) > 0} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search places..."
                  className="pl-9 bg-secondary/50 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpen(true);
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px] lg:w-[350px]" align="start">
              <div className="max-h-[300px] overflow-auto p-1">
                {isLoading && <div className="p-2 text-xs text-muted-foreground">Searching...</div>}
                {places?.map((place) => (
                  <button
                    key={place.place_id}
                    className="w-full text-left p-2.5 hover:bg-muted rounded-md text-sm transition-colors flex flex-col gap-0.5"
                    onClick={() => handleSearchSelect(place.lat, place.lon)}
                  >
                    <span className="font-medium truncate block w-full">{place.display_name.split(',')[0]}</span>
                    <span className="text-xs text-muted-foreground truncate block w-full opacity-70">
                      {place.display_name}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Shapes List Header */}
      <div className="p-4 px-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>My Shapes ({shapes.length})</span>
        </div>
        
        {shapes.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 px-6 pt-2">
        <ShapeList
          shapes={shapes}
          selectedId={selectedId}
          onSelect={onSelectShape}
          onDelete={onDeleteShape}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30 text-xs text-center text-muted-foreground">
        <p>Right-click to finish Polygon/Line drawing.</p>
        <p>Press ESC to cancel.</p>
      </div>
    </div>
  );
}
