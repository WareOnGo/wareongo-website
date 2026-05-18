import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { geocodingService, LocationCoordinates, GeocodingError } from '@/services/geocodingService';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default marker icon
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Props interface for the WarehouseLocationMap component
export interface WarehouseLocationMapProps {
  address: string;
  city: string;
  state: string;
  postalCode?: string | null;
  warehouseId: string | number;
  className?: string;
}

// Loading state component
const MapLoadingState: React.FC<{ stage: 'geocoding' | 'map' | 'complete' }> = ({ stage }) => {
  const getLoadingMessage = () => {
    switch (stage) {
      case 'geocoding':
        return { primary: 'Locating warehouse...', secondary: 'Finding coordinates' };
      case 'map':
        return { primary: 'Loading map...', secondary: 'Preparing map tiles' };
      default:
        return { primary: 'Loading...', secondary: 'Please wait' };
    }
  };

  const message = getLoadingMessage();

  return (
    <div className="flex items-center justify-center h-full bg-wareongo-blue/5 border border-wareongo-blue/20 rounded-2xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-wareongo-blue animate-spin mx-auto mb-2" />
        <p className="text-sm text-wareongo-blue font-medium">{message.primary}</p>
        <p className="text-xs text-wareongo-slate mt-1">{message.secondary}</p>
      </div>
    </div>
  );
};

// Error state component
const MapErrorState: React.FC<{ 
  error: string; 
  onRetry?: () => void; 
  showRetry?: boolean;
}> = ({ error, onRetry, showRetry = false }) => (
  <div className="flex items-center justify-center h-full bg-wareongo-blue/5 border border-wareongo-blue/20 rounded-2xl p-4">
    <div className="text-center max-w-sm">
      <AlertCircle className="w-8 h-8 text-wareongo-blue/60 mx-auto mb-2" />
      <p className="text-sm text-wareongo-slate mb-2">{error}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-wareongo-blue hover:underline font-medium"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

// Main WarehouseLocationMap component
const WarehouseLocationMap: React.FC<WarehouseLocationMapProps> = ({
  address,
  city,
  state,
  postalCode,
  warehouseId,
  className = ''
}) => {
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStage, setLoadingStage] = useState<'geocoding' | 'map' | 'complete'>('geocoding');
  const mapRef = useRef<any>(null);

  // Geocode the warehouse location
  const geocodeLocation = async () => {
    try {
      setIsLoading(true);
      setLoadingStage('geocoding');
      setError(null);

      const result = await geocodingService.geocodeLocation({
        postalCode,
        city,
        state,
        country: 'India'
      });

      setCoordinates(result);
      setLoadingStage('map');
      // Set loading to false after successful geocoding
      // The map will show with a loading overlay until it's ready
      setIsLoading(false);
    } catch (err) {
      console.error('Geocoding failed:', err);
      
      let errorMessage = 'Unable to load map location';
      
      if (err instanceof GeocodingError) {
        switch (err.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'RATE_LIMITED':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 'GEOCODING_FAILED':
            errorMessage = 'Location not found. Showing approximate area.';
            break;
          default:
            errorMessage = err.message || 'Unable to load map location';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle map ready state
  const handleMapReady = () => {
    setIsMapReady(true);
    setLoadingStage('complete');
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    geocodeLocation();
  };

  // Initial geocoding on component mount
  useEffect(() => {
    geocodeLocation();
  }, [address, city, state, postalCode]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`border border-wareongo-blue rounded-2xl overflow-hidden bg-transparent ${className}`}>
        <div className="p-0 h-full">
          <MapLoadingState stage={loadingStage} />
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !coordinates) {
    return (
      <div className={`border border-wareongo-blue rounded-2xl overflow-hidden bg-transparent ${className}`}>
        <div className="p-0 h-full">
          <MapErrorState
            error={error}
            onRetry={handleRetry}
            showRetry={retryCount < 3}
          />
        </div>
      </div>
    );
  }

  // Render map if coordinates are available
  if (!coordinates) {
    return (
      <div className={`border border-wareongo-blue rounded-2xl overflow-hidden bg-transparent ${className}`}>
        <div className="p-0 h-full">
          <MapErrorState error="Location data not available" />
        </div>
      </div>
    );
  }

  const position: LatLngExpression = [coordinates.lat, coordinates.lng];
  
  // Determine zoom level based on accuracy
  const getZoomLevel = (accuracy: string): number => {
    switch (accuracy) {
      case 'postal':
        return 16; // Close zoom for postal code accuracy - street level
      case 'city':
        return 13; // Medium zoom for city accuracy - neighborhood level
      case 'state':
        return 9;  // Wide zoom for state accuracy - regional level
      case 'approximate':
      default:
        return 7;  // Very wide zoom for approximate locations - country level
    }
  };

  // Get appropriate map bounds and center based on accuracy
  const getMapOptions = (coords: LocationCoordinates) => {
    const baseOptions = {
      center: [coords.lat, coords.lng] as LatLngExpression,
      zoom: getZoomLevel(coords.accuracy)
    };

    // For less accurate locations, we might want to show a wider area
    if (coords.accuracy === 'state' || coords.accuracy === 'approximate') {
      return {
        ...baseOptions,
        zoom: Math.max(baseOptions.zoom, 8) // Ensure minimum zoom for context
      };
    }

    return baseOptions;
  };

  const mapOptions = getMapOptions(coordinates);

  return (
    <div className={`border border-wareongo-blue rounded-2xl overflow-hidden bg-transparent ${className}`}>
      <div className="p-0 h-full">
        <div className="relative h-full rounded-2xl overflow-hidden">
          {/* Loading overlay for map initialization */}
          {!isMapReady && (
            <div className="absolute inset-0 bg-wareongo-blue/5 bg-opacity-90 z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-6 h-6 text-wareongo-blue animate-spin mx-auto mb-1" />
                <p className="text-xs text-wareongo-slate">Initializing map…</p>
              </div>
            </div>
          )}
          
          <MapContainer
            center={mapOptions.center}
            zoom={mapOptions.zoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            className="z-0"
            attributionControl={true}
            zoomControl={true}
            scrollWheelZoom={false}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            keyboard={true}
            whenReady={() => {
              // Mark map as ready
              handleMapReady();
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={3}
            />
            <Marker 
              position={position} 
              icon={defaultIcon}
              eventHandlers={{
                mouseover: (e) => {
                  // Only auto-open popup on desktop (non-touch devices)
                  if (!('ontouchstart' in window)) {
                    e.target.openPopup();
                  }
                }
              }}
            >
              <Popup
                closeButton={true}
                autoClose={false}
                closeOnEscapeKey={true}
                className="warehouse-popup"
                maxWidth={280}
                minWidth={200}
              >
                <div className="text-sm font-sans">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-wareongo-slate mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-wareongo-blue flex-shrink-0" />
                    <span className="truncate">Warehouse #{warehouseId}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-wareongo-blue font-semibold break-words leading-relaxed">
                      {address}
                    </div>
                    <div className="text-wareongo-slate">
                      {city}, {state}
                    </div>
                    {postalCode && (
                      <div className="text-wareongo-slate text-xs">
                        Postal Code: {postalCode}
                      </div>
                    )}
                  </div>
                  {coordinates.accuracy !== 'postal' && (
                    <div className="text-xs text-wareongo-blue mt-2 px-2 py-1 border border-wareongo-blue/20 bg-wareongo-blue/5 rounded-md">
                      Approximate location ({coordinates.accuracy} level)
                    </div>
                  )}
                  {coordinates.displayName && coordinates.displayName !== `${city}, ${state}, India` && (
                    <div className="text-xs text-wareongo-slate mt-2 border-t border-wareongo-blue/20 pt-2 break-words">
                      Geocoded: {coordinates.displayName}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Accuracy indicator */}
          {coordinates.accuracy !== 'postal' && (
            <div className="absolute top-2 right-2 bg-wareongo-ivory/95 border border-wareongo-blue/20 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-wareongo-blue font-medium z-10">
              Approximate location
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseLocationMap;