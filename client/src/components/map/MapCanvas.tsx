import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap, useMapEvents, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
import { type Shape } from "@shared/schema";
import { DrawingMode } from "./DrawToolbar";

// Fix Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapCanvasProps {
  mode: DrawingMode;
  setMode: (mode: DrawingMode) => void;
  shapes: Shape[];
  onShapeCreated: (shape: Shape) => void;
  onShapeUpdated: (shape: Shape) => void;
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  searchLocation: [number, number] | null;
}

function MapEvents({ mode, setMode, onShapeCreated }: { mode: DrawingMode, setMode: (m: DrawingMode) => void, onShapeCreated: (s: Shape) => void }) {
  const map = useMap();
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const tempLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    setPoints([]);
    if (tempLayerRef.current) {
      map.removeLayer(tempLayerRef.current);
      tempLayerRef.current = null;
    }
  }, [mode, map]);

  useEffect(() => {
    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();
    window.addEventListener('map-zoom-in', handleZoomIn);
    window.addEventListener('map-zoom-out', handleZoomOut);
    return () => {
      window.removeEventListener('map-zoom-in', handleZoomIn);
      window.removeEventListener('map-zoom-out', handleZoomOut);
    };
  }, [map]);

  const finishShape = (type: string, geoJson: any) => {
    let measurements = {};
    if (type === 'line') {
      measurements = { length: turf.length(geoJson, { units: 'meters' }) };
    } else {
      measurements = { area: turf.area(geoJson) };
    }

    const newShape: Shape = {
      id: uuidv4(),
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      geoJson,
      measurements,
      createdAt: new Date().toISOString(),
    };

    onShapeCreated(newShape);
    setMode('select');
  };

  useMapEvents({
    click(e) {
      if (mode === 'select') return;
      const newPoints = [...points, e.latlng];
      setPoints(newPoints);

      if (mode === 'rectangle' && newPoints.length === 2) {
        const bounds = L.latLngBounds(newPoints[0], newPoints[1]);
        const geoJson = L.rectangle(bounds).toGeoJSON();
        finishShape('rectangle', geoJson);
      } else if (mode === 'circle' && newPoints.length === 2) {
        const radius = newPoints[0].distanceTo(newPoints[1]);
        const center = [newPoints[0].lng, newPoints[0].lat];
        const circlePoly = turf.circle(center, radius, { steps: 64, units: 'meters' });
        finishShape('circle', circlePoly);
      }
    },
    dblclick(e) {
      if (mode === 'polygon' && points.length >= 3) {
         const geoJson = L.polygon(points).toGeoJSON();
         finishShape('polygon', geoJson);
      } else if (mode === 'line' && points.length >= 2) {
         const geoJson = L.polyline(points).toGeoJSON();
         finishShape('line', geoJson);
      }
    },
    mousemove(e) {
      if (points.length === 0) return;
      if (tempLayerRef.current) map.removeLayer(tempLayerRef.current);

      if (mode === 'line') {
        tempLayerRef.current = L.polyline([...points, e.latlng], { color: 'blue', dashArray: '5, 10' }).addTo(map);
      } else if (mode === 'polygon') {
        tempLayerRef.current = L.polygon([...points, e.latlng], { color: 'blue', dashArray: '5, 10' }).addTo(map);
      } else if (mode === 'rectangle') {
        tempLayerRef.current = L.rectangle(L.latLngBounds(points[0], e.latlng), { color: 'blue', dashArray: '5, 10' }).addTo(map);
      } else if (mode === 'circle') {
        const radius = points[0].distanceTo(e.latlng);
        tempLayerRef.current = L.circle(points[0], { radius, color: 'blue', dashArray: '5, 10' }).addTo(map);
      }
    }
  });

  return null;
}

function MapController({ selectedShape, searchLocation }: { selectedShape: Shape | null, searchLocation: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedShape) {
      const geo = L.geoJSON(selectedShape.geoJson as any);
      map.flyToBounds(geo.getBounds(), { padding: [50, 50] });
    }
  }, [selectedShape, map]);
  useEffect(() => {
    if (searchLocation) map.flyTo(searchLocation, 16);
  }, [searchLocation, map]);
  return null;
}

function DragHandler({ selectedShape, onShapeUpdated, onDragStart, onDragEnd }: { 
  selectedShape: Shape | null, 
  onShapeUpdated: (s: Shape) => void,
  onDragStart: () => void,
  onDragEnd: () => void
}) {
  const map = useMap();
  const draggingRef = useRef(false);
  const offsetRef = useRef<[number, number]>([0, 0]);

  useMapEvents({
    mousedown(e) {
      if (!selectedShape) return;
      
      const layer = L.geoJSON(selectedShape.geoJson as any);
      const bounds = layer.getBounds();
      
      if (bounds.contains(e.latlng)) {
        draggingRef.current = true;
        onDragStart();
        const centroid = turf.centroid(selectedShape.geoJson as any);
        offsetRef.current = [
          e.latlng.lng - centroid.geometry.coordinates[0],
          e.latlng.lat - centroid.geometry.coordinates[1]
        ];
        map.dragging.disable();
      }
    },
    mousemove(e) {
      if (!draggingRef.current || !selectedShape) return;

      const newCenter = [
        e.latlng.lng - offsetRef.current[0],
        e.latlng.lat - offsetRef.current[1]
      ];
      
      const oldCentroid = turf.centroid(selectedShape.geoJson as any);
      const delta = [
        newCenter[0] - oldCentroid.geometry.coordinates[0],
        newCenter[1] - oldCentroid.geometry.coordinates[1]
      ];
      
      const movedGeoJson = turf.transformTranslate(
        selectedShape.geoJson as any,
        Math.sqrt(delta[0]**2 + delta[1]**2),
        Math.atan2(delta[0], delta[1]) * 180 / Math.PI,
        { units: 'degrees' }
      );

      onShapeUpdated({ ...selectedShape, geoJson: movedGeoJson });
    },
    mouseup() {
      if (draggingRef.current) {
        draggingRef.current = false;
        onDragEnd();
        map.dragging.enable();
      }
    }
  });

  return null;
}

const SHAPE_STYLES: Record<string, any> = {
  rectangle: { color: '#f97316', fillColor: '#fb923c', weight: 2, opacity: 0.8, fillOpacity: 0.3 },
  circle: { color: '#ec4899', fillColor: '#f472b6', weight: 2, opacity: 0.8, fillOpacity: 0.3 },
  polygon: { color: '#3b82f6', fillColor: '#60a5fa', weight: 2, opacity: 0.8, fillOpacity: 0.3 },
  line: { color: '#ef4444', weight: 3, opacity: 0.8 },
};

export function MapCanvas({ mode, setMode, shapes, onShapeCreated, onShapeUpdated, selectedShapeId, onSelectShape, searchLocation }: MapCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const selectedShape = shapes.find(s => s.id === selectedShapeId) || null;

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents mode={mode} setMode={setMode} onShapeCreated={onShapeCreated} />
        <MapController selectedShape={selectedShape} searchLocation={searchLocation} />
        <DragHandler 
          selectedShape={selectedShape} 
          onShapeUpdated={onShapeUpdated}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />

        <FeatureGroup>
          {shapes.map((shape) => (
            <GeoJSON 
              key={`${shape.id}-${JSON.stringify(shape.geoJson)}`} 
              data={shape.geoJson as any}
              style={() => {
                const baseStyle = SHAPE_STYLES[shape.type] || SHAPE_STYLES.polygon;
                const isSelected = shape.id === selectedShapeId;
                return {
                  ...baseStyle,
                  weight: isSelected ? baseStyle.weight + 2 : baseStyle.weight,
                  fillOpacity: isSelected ? baseStyle.fillOpacity + 0.2 : baseStyle.fillOpacity,
                  color: isSelected ? '#ffffff' : baseStyle.color,
                  dashArray: isDragging && isSelected ? '5, 10' : undefined
                };
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  onSelectShape(shape.id);
                }
              }}
            />
          ))}
        </FeatureGroup>

        {searchLocation && <Marker position={searchLocation} />}
      </MapContainer>
    </div>
  );
}
