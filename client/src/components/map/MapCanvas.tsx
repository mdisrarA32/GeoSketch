import { useEffect, useRef, useState } from "react";
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
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  searchLocation: [number, number] | null;
}

// Custom hook to handle drawing logic directly with Leaflet
function MapEvents({ mode, setMode, onShapeCreated }: { mode: DrawingMode, setMode: (m: DrawingMode) => void, onShapeCreated: (s: Shape) => void }) {
  const map = useMap();
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const tempLayerRef = useRef<L.Layer | null>(null);

  // Clear temp layers when mode changes
  useEffect(() => {
    setPoints([]);
    if (tempLayerRef.current) {
      map.removeLayer(tempLayerRef.current);
      tempLayerRef.current = null;
    }
  }, [mode, map]);

  useMapEvents({
    click(e) {
      if (mode === 'select') return;

      const newPoints = [...points, e.latlng];
      setPoints(newPoints);

      if (mode === 'rectangle' && newPoints.length === 2) {
        // Complete Rectangle
        const bounds = L.latLngBounds(newPoints[0], newPoints[1]);
        const geoJson = L.rectangle(bounds).toGeoJSON();
        finishShape('rectangle', geoJson);
      } else if (mode === 'circle' && newPoints.length === 2) {
        // Complete Circle (Approximate as polygon)
        const radius = newPoints[0].distanceTo(newPoints[1]);
        const options = { steps: 64, units: 'meters' as const };
        const center = [newPoints[0].lng, newPoints[0].lat];
        const circlePoly = turf.circle(center, radius, options);
        finishShape('circle', circlePoly);
      }
    },
    mousemove(e) {
      if (points.length === 0) return;

      // Update preview layer
      if (tempLayerRef.current) {
        map.removeLayer(tempLayerRef.current);
      }

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
    },
    contextmenu() {
      // Right click to finish Polygon or Line
      if (mode === 'polygon' && points.length >= 3) {
         const geoJson = L.polygon(points).toGeoJSON();
         finishShape('polygon', geoJson);
      } else if (mode === 'line' && points.length >= 2) {
         const geoJson = L.polyline(points).toGeoJSON();
         finishShape('line', geoJson);
      }
    },
    keydown(e) {
      if (e.originalEvent.key === 'Escape') {
        setMode('select');
      }
    }
  });

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
    setMode('select'); // Reset mode
  };

  return null;
}

// Component to handle zooming to search results or selected shapes
function MapController({ selectedShape, searchLocation }: { selectedShape: Shape | null, searchLocation: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedShape) {
      const geo = L.geoJSON(selectedShape.geoJson as any);
      map.flyToBounds(geo.getBounds(), { padding: [50, 50] });
    }
  }, [selectedShape, map]);

  useEffect(() => {
    if (searchLocation) {
      map.flyTo(searchLocation, 16);
    }
  }, [searchLocation, map]);

  return null;
}

export function MapCanvas({ 
  mode, 
  setMode, 
  shapes, 
  onShapeCreated,
  selectedShapeId,
  onSelectShape,
  searchLocation
}: MapCanvasProps) {

  const selectedShape = shapes.find(s => s.id === selectedShapeId) || null;

  return (
    <MapContainer 
      center={[51.505, -0.09]} 
      zoom={13} 
      className="w-full h-full"
      zoomControl={false} // We'll add custom positioned controls if needed, or stick to default styled via CSS
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapEvents mode={mode} setMode={setMode} onShapeCreated={onShapeCreated} />
      <MapController selectedShape={selectedShape} searchLocation={searchLocation} />

      {/* Render Shapes */}
      <FeatureGroup>
        {shapes.map((shape) => (
          <GeoJSON 
            key={shape.id} 
            data={shape.geoJson as any}
            style={() => ({
              color: shape.id === selectedShapeId ? '#7c3aed' : '#3b82f6',
              weight: shape.id === selectedShapeId ? 4 : 2,
              opacity: 0.8,
              fillOpacity: shape.id === selectedShapeId ? 0.4 : 0.2,
            })}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onSelectShape(shape.id);
              }
            }}
          />
        ))}
      </FeatureGroup>

      {/* Search Result Marker */}
      {searchLocation && (
        <Marker position={searchLocation}>
          <Popup>Search Result</Popup>
        </Marker>
      )}

    </MapContainer>
  );
}
