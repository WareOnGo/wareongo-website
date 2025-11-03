# Warehouse Location Map Design Document

## Overview

The warehouse location map feature adds an interactive map component to the warehouse detail page using OpenStreetMap and Leaflet.js. The map displays the warehouse location based on postal code or city data, filling the empty space in the bottom right area of the desktop layout while maintaining responsive design across all devices.

## Architecture

### Component Structure
```
WarehouseDetail (Updated Page Component)
├── WarehouseImageCarousel
├── WarehouseInfo
└── WarehouseLocationMap (New Component)
    ├── MapContainer (Leaflet Map)
    ├── LocationMarker
    └── LoadingState / ErrorState
```

### Technology Stack
- **Mapping Library**: Leaflet.js (lightweight, open-source)
- **Map Tiles**: OpenStreetMap (free, no API key required)
- **Geocoding**: Nominatim API (OpenStreetMap's geocoding service)
- **React Integration**: React-Leaflet for React component integration

### Data Flow
1. Extract postal code and city from warehouse data
2. Geocode location to coordinates using Nominatim API
3. Initialize Leaflet map with coordinates
4. Display marker with warehouse information
5. Handle loading states and error scenarios

## Components and Interfaces

### 1. WarehouseLocationMap Component

**Location**: `src/components/WarehouseLocationMap.tsx`

**Responsibilities**:
- Geocode warehouse location from postal code or city
- Render interactive map with OpenStreetMap tiles
- Display warehouse marker with popup information
- Handle loading and error states
- Manage responsive behavior

**Props Interface**:
```typescript
interface WarehouseLocationMapProps {
  address: string;
  city: string;
  state: string;
  postalCode: string | null;
  warehouseId: string | number;
  className?: string;
}
```

**Key Features**:
- Automatic geocoding with fallback from postal code to city
- Responsive container sizing
- Loading skeleton during geocoding
- Error handling with fallback messages
- Marker popup with warehouse address
- Appropriate zoom levels for context

### 2. Geocoding Service

**Location**: `src/services/geocodingService.ts`

**Responsibilities**:
- Convert postal code or city to coordinates
- Handle API rate limiting and errors
- Provide caching for repeated requests
- Fallback logic for incomplete location data

**Service Interface**:
```typescript
interface GeocodingService {
  geocodeLocation(params: {
    postalCode?: string;
    city: string;
    state: string;
  }): Promise<{
    lat: number;
    lng: number;
    accuracy: 'postal' | 'city' | 'approximate';
  }>;
}
```

**API Integration**:
- Uses Nominatim API: `https://nominatim.openstreetmap.org/search`
- Query format: `{postalCode} {city}, {state}, India`
- Fallback to city-level search if postal code fails
- Response caching to minimize API calls

## Data Models

### Location Coordinates
```typescript
interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy: 'postal' | 'city' | 'approximate';
  displayName?: string;
}
```

### Geocoding Response
```typescript
interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
  place_id: number;
}
```

## Layout Integration

### Desktop Layout (≥1024px)
- Map positioned in bottom right area of the warehouse detail page
- Dimensions: 400px width × 300px height
- Positioned alongside the WarehouseInfo component
- Maintains existing grid layout structure

### Tablet Layout (768px - 1023px)
- Map repositioned below warehouse information
- Full width of container with 250px height
- Stacked layout maintaining content hierarchy

### Mobile Layout (<768px)
- Map displayed full width below all content
- Height: 200px for optimal mobile viewing
- Touch-friendly controls and interactions

### CSS Grid Integration
```css
/* Desktop */
.warehouse-detail-grid {
  grid-template-areas: 
    "carousel info"
    "carousel map"
    "details details";
}

/* Tablet */
.warehouse-detail-grid {
  grid-template-areas:
    "carousel"
    "info"
    "map"
    "details";
}

/* Mobile */
.warehouse-detail-grid {
  grid-template-areas:
    "carousel"
    "info"
    "map"
    "details";
}
```

## Error Handling

### Geocoding Failures
1. **Invalid Postal Code**: Fallback to city-level geocoding
2. **City Not Found**: Display map centered on state with message
3. **Network Errors**: Show retry button with error message
4. **API Rate Limiting**: Implement exponential backoff and user feedback

### Map Loading Errors
1. **Tile Loading Failures**: Graceful degradation with error message
2. **JavaScript Errors**: Error boundary with fallback UI
3. **Browser Compatibility**: Feature detection and fallbacks

### Fallback Strategies
```typescript
const geocodingFallbacks = [
  () => geocodeByPostalCode(postalCode, city, state),
  () => geocodeByCity(city, state),
  () => geocodeByState(state),
  () => defaultIndiaCenter()
];
```

## Performance Considerations

### Map Optimization
- Lazy loading of Leaflet library
- Tile caching by browser
- Debounced geocoding requests
- Component memoization for stable props

### Bundle Size Management
- Dynamic import of Leaflet components
- Tree shaking of unused Leaflet features
- CDN delivery for Leaflet CSS and assets

### Caching Strategy
- Browser localStorage for geocoding results
- 24-hour cache expiration
- Cache key based on location string
- Fallback to session storage if localStorage unavailable

## Accessibility

### Keyboard Navigation
- Tab navigation to map container
- Arrow key navigation within map
- Enter/Space for marker interaction
- Escape to close popups

### Screen Reader Support
- ARIA labels for map container and controls
- Alt text for marker information
- Descriptive text for map region
- Announcement of location changes

### Visual Accessibility
- High contrast markers and controls
- Sufficient color contrast for text overlays
- Focus indicators for interactive elements
- Scalable text and controls

## Security Considerations

### API Security
- No API keys required for OpenStreetMap/Nominatim
- Rate limiting compliance (1 request per second)
- Input sanitization for geocoding queries
- HTTPS-only API requests

### Data Privacy
- No user location tracking
- No personal data sent to mapping services
- Minimal data exposure in API requests
- Compliance with privacy policies

## Testing Strategy

### Unit Tests
- Geocoding service functionality
- Component rendering with mock data
- Error handling scenarios
- Responsive behavior testing

### Integration Tests
- Map initialization and rendering
- Marker placement accuracy
- API integration with mocked responses
- Error boundary functionality

### Visual Testing
- Cross-browser map rendering
- Responsive layout verification
- Marker and popup display
- Loading state appearance

## Dependencies

### New Dependencies
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

### CSS Dependencies
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

## Implementation Phases

### Phase 1: Core Map Component
- Basic map rendering with OpenStreetMap tiles
- Geocoding service implementation
- Simple marker placement
- Basic responsive layout

### Phase 2: Enhanced Features
- Marker popups with warehouse information
- Loading states and error handling
- Improved responsive design
- Performance optimizations

### Phase 3: Polish and Testing
- Accessibility improvements
- Cross-browser testing
- Performance monitoring
- User experience refinements

## Integration Points

### Existing Components
- Update WarehouseDetail page layout
- Integrate with existing loading states
- Use existing error handling patterns
- Maintain design system consistency

### Services Integration
- Extend warehouse data transformation
- Add geocoding to data pipeline
- Integrate with existing error boundaries
- Use existing toast notifications

## Future Enhancements

### Advanced Features
- Satellite view toggle
- Nearby amenities display
- Distance calculations
- Directions integration
- Multiple warehouse comparison map

### Performance Improvements
- Server-side geocoding caching
- Progressive map loading
- Offline map support
- Advanced tile caching