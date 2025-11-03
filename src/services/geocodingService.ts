/**
 * Geocoding service for converting addresses to coordinates using Nominatim API
 */

// Type definitions for geocoding
export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy: 'postal' | 'city' | 'state' | 'approximate';
  displayName?: string;
}

export interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
  place_id: number;
  type?: string;
  class?: string;
}

export interface GeocodingParams {
  postalCode?: string | null;
  city: string;
  state: string;
  country?: string;
}

// Custom error class for geocoding errors
export class GeocodingError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GeocodingError';
  }
}

// Cache interface for storing geocoding results
interface CacheEntry {
  coordinates: LocationCoordinates;
  timestamp: number;
  expiresAt: number;
}

class GeocodingService {
  private readonly baseURL = 'https://nominatim.openstreetmap.org/search';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly requestDelay = 1000; // 1 second delay between requests for rate limiting
  private readonly maxRetries = 3; // Maximum number of retry attempts
  private readonly baseBackoffDelay = 1000; // Base delay for exponential backoff (1 second)
  private lastRequestTime = 0;
  private pendingRequests = new Map<string, Promise<LocationCoordinates>>();

  /**
   * Main geocoding method with fallback logic and request debouncing
   */
  async geocodeLocation(params: GeocodingParams): Promise<LocationCoordinates> {
    const { postalCode, city, state, country = 'India' } = params;

    // Generate cache key
    const cacheKey = this.generateCacheKey(params);
    
    // Check cache first
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Check if there's already a pending request for the same location (debouncing)
    const existingRequest = this.pendingRequests.get(cacheKey);
    if (existingRequest) {
      console.log(`Debouncing: returning existing request for ${cacheKey}`);
      return existingRequest;
    }

    // Create new request promise
    const requestPromise = this.executeGeocodingWithFallback(params, cacheKey);
    
    // Store the promise to enable debouncing
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute geocoding with fallback strategies
   */
  private async executeGeocodingWithFallback(
    params: GeocodingParams, 
    cacheKey: string
  ): Promise<LocationCoordinates> {
    // Validate input parameters
    this.validateLocationParams(params);
    
    const { postalCode, city, state, country = 'India' } = params;

    // Try geocoding with fallback strategy
    const fallbackStrategies = [
      // Strategy 1: Postal code + city + state
      () => postalCode ? this.geocodeByPostalCode(postalCode, city, state, country) : null,
      // Strategy 2: City + state
      () => this.geocodeByCity(city, state, country),
      // Strategy 3: State only
      () => this.geocodeByState(state, country),
      // Strategy 4: Default to country center
      () => this.getDefaultLocation(country)
    ];

    let lastError: Error | null = null;

    for (const strategy of fallbackStrategies) {
      try {
        const result = await strategy();
        if (result) {
          // Validate coordinates before caching
          if (!this.validateCoordinates(result.lat, result.lng)) {
            console.warn('Invalid coordinates received, trying next strategy');
            continue;
          }
          
          // Cache the successful result
          this.cacheResult(cacheKey, result);
          return result;
        }
      } catch (error) {
        console.warn('Geocoding strategy failed:', error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // If all strategies fail, throw error
    throw new GeocodingError(
      'Unable to geocode location with any available strategy',
      'GEOCODING_FAILED',
      lastError || undefined
    );
  }

  /**
   * Geocode using postal code + city + state
   */
  private async geocodeByPostalCode(
    postalCode: string,
    city: string,
    state: string,
    country: string
  ): Promise<LocationCoordinates | null> {
    const sanitizedQuery = this.sanitizeQuery(`${postalCode} ${city}, ${state}, ${country}`);
    const result = await this.makeGeocodingRequest(sanitizedQuery);
    
    if (result) {
      return {
        ...result,
        accuracy: 'postal'
      };
    }
    
    return null;
  }

  /**
   * Geocode using city + state
   */
  private async geocodeByCity(
    city: string,
    state: string,
    country: string
  ): Promise<LocationCoordinates | null> {
    const sanitizedQuery = this.sanitizeQuery(`${city}, ${state}, ${country}`);
    const result = await this.makeGeocodingRequest(sanitizedQuery);
    
    if (result) {
      return {
        ...result,
        accuracy: 'city'
      };
    }
    
    return null;
  }

  /**
   * Geocode using state only
   */
  private async geocodeByState(
    state: string,
    country: string
  ): Promise<LocationCoordinates | null> {
    const sanitizedQuery = this.sanitizeQuery(`${state}, ${country}`);
    const result = await this.makeGeocodingRequest(sanitizedQuery);
    
    if (result) {
      return {
        ...result,
        accuracy: 'state'
      };
    }
    
    return null;
  }

  /**
   * Get default location for country (fallback)
   */
  private async getDefaultLocation(country: string): Promise<LocationCoordinates> {
    // Default coordinates for India (center of the country)
    if (country.toLowerCase() === 'india') {
      return {
        lat: 20.5937,
        lng: 78.9629,
        accuracy: 'approximate',
        displayName: 'India (approximate center)'
      };
    }
    
    // For other countries, try to geocode the country name
    const result = await this.makeGeocodingRequest(country);
    if (result) {
      return {
        ...result,
        accuracy: 'approximate'
      };
    }
    
    // Ultimate fallback - world center
    return {
      lat: 0,
      lng: 0,
      accuracy: 'approximate',
      displayName: 'World center (fallback)'
    };
  }

  /**
   * Make actual HTTP request to Nominatim API with rate limiting and exponential backoff
   */
  private async makeGeocodingRequest(query: string): Promise<Omit<LocationCoordinates, 'accuracy'> | null> {
    return this.makeRequestWithRetry(query, 0);
  }

  /**
   * Make request with exponential backoff retry logic
   */
  private async makeRequestWithRetry(
    query: string, 
    attemptNumber: number
  ): Promise<Omit<LocationCoordinates, 'accuracy'> | null> {
    // Implement rate limiting
    await this.enforceRateLimit();

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        addressdetails: '1'
      });

      const url = `${this.baseURL}?${params.toString()}`;
      console.log(`Geocoding request (attempt ${attemptNumber + 1}): ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WarehouseLocationMap/1.0'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      // Handle rate limiting (429) and server errors (5xx) with retry
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (attemptNumber < this.maxRetries - 1) {
          const backoffDelay = this.calculateBackoffDelay(attemptNumber);
          console.log(`Request failed with status ${response.status}, retrying in ${backoffDelay}ms`);
          await this.delay(backoffDelay);
          return this.makeRequestWithRetry(query, attemptNumber + 1);
        } else {
          throw new GeocodingError(
            `HTTP error after ${this.maxRetries} attempts! status: ${response.status}`,
            response.status === 429 ? 'RATE_LIMITED' : 'SERVER_ERROR'
          );
        }
      }

      if (!response.ok) {
        throw new GeocodingError(
          `HTTP error! status: ${response.status}`,
          'HTTP_ERROR'
        );
      }

      const data: NominatimResponse[] = await response.json();
      
      if (!data || data.length === 0) {
        console.log(`No results found for query: ${query}`);
        return null;
      }

      const result = data[0];
      const coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name
      };

      // Validate coordinates
      if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
        throw new GeocodingError(
          'Invalid coordinates received from geocoding service',
          'INVALID_COORDINATES'
        );
      }

      console.log(`Geocoding successful for "${query}":`, coordinates);
      return coordinates;

    } catch (error) {
      if (error instanceof GeocodingError) {
        throw error;
      }

      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        if (attemptNumber < this.maxRetries - 1) {
          const backoffDelay = this.calculateBackoffDelay(attemptNumber);
          console.log(`Request timed out, retrying in ${backoffDelay}ms`);
          await this.delay(backoffDelay);
          return this.makeRequestWithRetry(query, attemptNumber + 1);
        } else {
          throw new GeocodingError(
            `Request timed out after ${this.maxRetries} attempts`,
            'TIMEOUT_ERROR',
            error
          );
        }
      }

      // Handle network errors with retry
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (attemptNumber < this.maxRetries - 1) {
          const backoffDelay = this.calculateBackoffDelay(attemptNumber);
          console.log(`Network error, retrying in ${backoffDelay}ms`);
          await this.delay(backoffDelay);
          return this.makeRequestWithRetry(query, attemptNumber + 1);
        } else {
          throw new GeocodingError(
            `Network error after ${this.maxRetries} attempts: Unable to connect to geocoding service`,
            'NETWORK_ERROR',
            error
          );
        }
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new GeocodingError(
          'Invalid response format from geocoding service',
          'PARSE_ERROR',
          error
        );
      }

      throw new GeocodingError(
        `Geocoding request failed: ${error instanceof Error ? error.message : String(error)}`,
        'REQUEST_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attemptNumber: number): number {
    // Exponential backoff: baseDelay * (2 ^ attemptNumber) + random jitter
    const exponentialDelay = this.baseBackoffDelay * Math.pow(2, attemptNumber);
    const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Utility method for creating delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enforce rate limiting (1 request per second for Nominatim)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Generate cache key from geocoding parameters
   */
  private generateCacheKey(params: GeocodingParams): string {
    const { postalCode, city, state, country = 'India' } = params;
    return `${postalCode || 'null'}_${city}_${state}_${country}`.toLowerCase();
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult(cacheKey: string): LocationCoordinates | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    console.log(`Cache hit for key: ${cacheKey}`);
    return entry.coordinates;
  }

  /**
   * Cache geocoding result
   */
  private cacheResult(cacheKey: string, coordinates: LocationCoordinates): void {
    const now = Date.now();
    const entry: CacheEntry = {
      coordinates,
      timestamp: now,
      expiresAt: now + this.cacheExpiration
    };
    
    this.cache.set(cacheKey, entry);
    console.log(`Cached result for key: ${cacheKey}`);
    
    // Clean up expired entries periodically
    this.cleanupExpiredCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Clear all cached results
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('Geocoding cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Validate location parameters before geocoding
   */
  private validateLocationParams(params: GeocodingParams): void {
    const { city, state } = params;
    
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      throw new GeocodingError(
        'City is required and must be a non-empty string',
        'INVALID_CITY'
      );
    }
    
    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      throw new GeocodingError(
        'State is required and must be a non-empty string',
        'INVALID_STATE'
      );
    }

    // Validate postal code if provided
    if (params.postalCode && typeof params.postalCode !== 'string') {
      throw new GeocodingError(
        'Postal code must be a string if provided',
        'INVALID_POSTAL_CODE'
      );
    }
  }

  /**
   * Sanitize query string to prevent injection attacks
   */
  private sanitizeQuery(query: string): string {
    // Remove potentially dangerous characters and limit length
    return query
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .replace(/[;|&$`]/g, '') // Remove command injection characters
      .trim()
      .substring(0, 200); // Limit query length
  }

  /**
   * Check if coordinates are within reasonable bounds
   */
  private validateCoordinates(lat: number, lng: number): boolean {
    // Check if coordinates are within valid ranges
    if (lat < -90 || lat > 90) {
      return false;
    }
    if (lng < -180 || lng > 180) {
      return false;
    }
    
    // Additional validation for India (rough bounding box)
    // India is approximately between 6°N to 37°N latitude and 68°E to 97°E longitude
    const isInIndia = lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97;
    
    // Allow coordinates outside India but log a warning
    if (!isInIndia) {
      console.warn(`Coordinates (${lat}, ${lng}) appear to be outside India`);
    }
    
    return true;
  }

  /**
   * Get service health status
   */
  public async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastRequestTime: number;
    cacheSize: number;
    pendingRequests: number;
  }> {
    try {
      // Try a simple geocoding request to test service availability
      const testResult = await this.makeGeocodingRequest('India');
      
      return {
        status: testResult ? 'healthy' : 'degraded',
        lastRequestTime: this.lastRequestTime,
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastRequestTime: this.lastRequestTime,
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size
      };
    }
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();

// Export class for testing
export { GeocodingService };