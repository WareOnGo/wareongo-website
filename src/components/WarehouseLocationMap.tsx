import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">{message.primary}</p>
        <p className="text-xs text-gray-500 mt-1">{message.secondary}</p>
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
  <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-4">
    <div className="text-center max-w-sm">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-2">{error}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
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

      console.log('Geocoding warehouse location:', { address, city, state, postalCode });

      const result = await geocodingService.geocodeLocation({
        postalCode,
        city,
        state,
        country: 'India'
      });

      console.log('Geocoding result:', result);
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
      <Card className={className}>
        <CardContent className="p-0 h-full">
          <MapLoadingState stage={loadingStage} />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error && !coordinates) {
    return (
      <Card className={className}>
        <CardContent className="p-0 h-full">
          <MapErrorState 
            error={error} 
            onRetry={handleRetry}
            showRetry={retryCount < 3}
          />
        </CardContent>
      </Card>
    );
  }

  // Render map if coordinates are available
  if (!coordinates) {
    return (
      <Card className={className}>
        <CardContent className="p-0 h-full">
          <MapErrorState error="Location data not available" />
        </CardContent>
      </Card>
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
    <Card className={className}>
      <CardContent className="p-0 h-full">
        <div className="relative h-full rounded-lg overflow-hidden">
          {/* Loading overlay for map initialization */}
          {!isMapReady && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-90 z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-1" />
                <p className="text-xs text-gray-600">Initializing map...</p>
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
                click: () => {
                  console.log('Warehouse marker clicked');
                },
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
                <div className="text-sm">
                  <div className="font-semibold mb-2 flex items-center text-blue-700">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Warehouse #{warehouseId}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-700 font-medium break-words">
                      {address}
                    </div>
                    <div className="text-gray-600">
                      {city}, {state}
                    </div>
                    {postalCode && (
                      <div className="text-gray-600 text-xs">
                        Postal Code: {postalCode}
                      </div>
                    )}
                  </div>
                  {coordinates.accuracy !== 'postal' && (
                    <div className="text-xs text-orange-600 mt-2 p-1 bg-orange-50 rounded">
                      📍 Approximate location ({coordinates.accuracy} level accuracy)
                    </div>
                  )}
                  {coordinates.displayName && coordinates.displayName !== `${city}, ${state}, India` && (
                    <div className="text-xs text-gray-500 mt-1 border-t pt-1 break-words">
                      Geocoded: {coordinates.displayName}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Accuracy indicator */}
          {coordinates.accuracy !== 'postal' && (
            <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 shadow-sm z-10">
              Approximate location
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseLocationMap;