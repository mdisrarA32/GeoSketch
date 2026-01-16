## Packages
leaflet | Core mapping library
react-leaflet | React components for Leaflet
@types/leaflet | TypeScript definitions for Leaflet
@types/react-leaflet | TypeScript definitions for react-leaflet
@turf/turf | Advanced geospatial analysis (intersection, area, etc.)
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes
date-fns | Date formatting
lucide-react | Icon set (already in base but explicit check)

## Notes
- Frontend-only application using LocalStorage for persistence.
- Map tiles provided by OpenStreetMap.
- Nominatim API used for geocoding (search).
- Turf.js used for spatial constraints (containment, overlap).
- Leaflet CSS must be imported globally.
