# GIS Map Drawing Application

## Overview

This is a map-based drawing application built with React and TypeScript that renders OpenStreetMap tiles and allows users to draw, manage, search, and export geometrical features. The application enforces spatial constraints on polygonal shapes using Turf.js for geospatial operations. Data persistence is handled client-side using LocalStorage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite with custom configuration for Replit environment
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)

### Map System
- **Mapping Library**: Leaflet with react-leaflet bindings
- **Tile Provider**: OpenStreetMap free tiles
- **Geospatial Analysis**: Turf.js for spatial operations (intersection, containment, area calculations)
- **Geocoding**: OpenStreetMap Nominatim API for location search

### Data Layer
- **Client Storage**: LocalStorage for shape persistence (key: `gis_app_shapes_v1`)
- **Database Schema**: PostgreSQL with Drizzle ORM (prepared for future backend integration)
- **Schema Location**: `shared/schema.ts` defines shape structure and limits

### Drawing Constraints
The application enforces strict spatial rules for polygonal shapes (Polygon, Rectangle, Circle):
1. Partial overlaps are automatically trimmed using Turf.js difference operations
2. Full enclosure (one shape completely containing another) blocks the drawing operation
3. LineStrings are exempt from overlap constraints

### Shape Limits
Defined in `shared/schema.ts`:
- Polygons: 10 max
- Rectangles: 5 max
- Circles: 5 max
- Lines: 20 max

### Key Components
- `MapCanvas`: Main map rendering with Leaflet, handles drawing events
- `DrawToolbar`: Drawing tool selection UI
- `Sidebar`: Shape list, search, and export functionality
- `ShapeDetailsPanel`: Selected shape information display

### Server Architecture
- **Runtime**: Node.js with Express
- **Purpose**: Primarily serves static files; core application logic is frontend-only
- **Database**: PostgreSQL connection via Drizzle ORM (configured but minimally used)

## External Dependencies

### APIs
- **OpenStreetMap Tiles**: Base map layer (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- **Nominatim Geocoding**: Location search (`https://nominatim.openstreetmap.org/search`)

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Session Store**: connect-pg-simple for Express sessions (if needed)

### Key NPM Packages
- `leaflet` / `react-leaflet`: Map rendering
- `@turf/turf`: Geospatial calculations
- `@tanstack/react-query`: Data fetching and caching
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `uuid`: Unique ID generation for shapes
- `date-fns`: Date formatting
- `zod`: Schema validation