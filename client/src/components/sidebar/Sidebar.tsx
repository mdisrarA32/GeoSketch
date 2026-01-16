import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Map as MapIcon, Download, Layers } from "lucide-react";
import { ShapeList } from "./ShapeList";
import { Shape } from "@shared/schema";
import { useSearchPlaces } from "@/hooks/use-search-places";
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
  const [shapeSearch, setShapeSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: places, isLoading } = useSearchPlaces(searchQuery);

  const handleSearchSelect = (lat: string, lon: string) => {
    onSearchSelect(parseFloat(lat), parseFloat(lon));
    setOpen(false);
    setSearchQuery("");
  };

  const filteredShapes = shapes.filter(s => 
    s.name.toLowerCase().includes(shapeSearch.toLowerCase()) ||
    s.type.toLowerCase().includes(shapeSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl w-80 lg:w-96 shadow-2xl overflow-hidden">
      {/* Search Section */}
      <div className="p-6 space-y-4 border-b border-slate-800">
        <div className="relative">
          <Popover open={open && (places?.length ?? 0) > 0} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search location..."
                  className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpen(true);
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px] lg:w-[350px] bg-slate-900 border-slate-800 text-white" align="start">
              <div className="max-h-[300px] overflow-auto p-1">
                {isLoading && <div className="p-2 text-xs text-slate-400">Searching...</div>}
                {places?.map((place) => (
                  <button
                    key={place.place_id}
                    className="w-full text-left p-2.5 hover:bg-slate-800 rounded-md text-sm transition-colors flex flex-col gap-0.5"
                    onClick={() => handleSearchSelect(place.lat, place.lon)}
                  >
                    <span className="font-medium truncate block w-full text-white">{place.display_name.split(',')[0]}</span>
                    <span className="text-xs text-slate-400 truncate block w-full opacity-70">
                      {place.display_name}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search shapes..."
            className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:ring-primary/20"
            value={shapeSearch}
            onChange={(e) => setShapeSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Layers Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
            <Layers className="h-4 w-4 text-primary" />
            <span>Layers ({shapes.length})</span>
          </div>
        </div>

        <div className="flex-1 px-4 overflow-hidden">
          <ShapeList
            shapes={filteredShapes}
            selectedId={selectedId}
            onSelect={onSelectShape}
            onDelete={onDeleteShape}
          />
        </div>
      </div>

      {/* Export Section */}
      <div className="p-6 bg-slate-900/50 border-t border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Export GeoJSON</h3>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-semibold"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
