import { useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MapCanvas } from "@/components/map/MapCanvas";
import { DrawToolbar, DrawingMode } from "@/components/map/DrawToolbar";
import { useShapes } from "@/hooks/use-shapes";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("select");
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  
  const { shapes, addShape, removeShape } = useShapes();
  const { toast } = useToast();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shapes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "shapes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Export Successful",
      description: "shapes.json has been downloaded.",
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Map takes up the full background */}
      <div className="absolute inset-0 z-0">
        <MapCanvas
          mode={drawingMode}
          setMode={setDrawingMode}
          shapes={shapes}
          onShapeCreated={addShape}
          selectedShapeId={selectedShapeId}
          onSelectShape={setSelectedShapeId}
          searchLocation={searchLocation}
        />
      </div>

      {/* Left Toolbar */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
        <DrawToolbar
          mode={drawingMode}
          setMode={setDrawingMode}
          onCancel={() => setDrawingMode("select")}
        />
      </div>

      {/* Right Sidebar - Floating Card Style */}
      <div className="absolute right-6 top-6 bottom-6 z-20 pointer-events-none">
        <div className="h-full pointer-events-auto">
          <Sidebar
            shapes={shapes}
            selectedId={selectedShapeId}
            onSelectShape={setSelectedShapeId}
            onDeleteShape={removeShape}
            onSearchSelect={(lat, lon) => setSearchLocation([lat, lon])}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
}
