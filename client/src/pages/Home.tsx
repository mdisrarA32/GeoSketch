import { useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MapCanvas } from "@/components/map/MapCanvas";
import { DrawToolbar, DrawingMode } from "@/components/map/DrawToolbar";
import { ShapeDetailsPanel } from "@/components/sidebar/ShapeDetailsPanel";
import { useShapes } from "@/hooks/use-shapes";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("select");
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  
  const { shapes, addShape, removeShape, updateShape, undo, redo, canUndo, canRedo } = useShapes();
  const { toast } = useToast();

  const selectedShape = shapes.find(s => s.id === selectedShapeId) || null;

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
      <div className="absolute inset-0 z-0">
        <MapCanvas
          mode={drawingMode}
          setMode={setDrawingMode}
          shapes={shapes}
          onShapeCreated={addShape}
          onShapeUpdated={updateShape}
          selectedShapeId={selectedShapeId}
          onSelectShape={setSelectedShapeId}
          searchLocation={searchLocation}
        />
      </div>

      <div className="absolute left-6 top-6 bottom-6 z-20 flex gap-6 pointer-events-none">
        <div className="flex flex-col justify-center pointer-events-auto">
          <DrawToolbar
            mode={drawingMode}
            setMode={setDrawingMode}
            onCancel={() => setDrawingMode("select")}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>

        <div className="h-full pointer-events-auto">
          <ShapeDetailsPanel
            shape={selectedShape}
            onClose={() => setSelectedShapeId(null)}
            onDelete={(id) => {
              removeShape(id);
              setSelectedShapeId(null);
            }}
          />
        </div>
      </div>

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
