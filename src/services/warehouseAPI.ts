/**
 * Warehouse API service for fetching warehouse data from backend
 */

import { config, getApiUrl } from '@/config/config';

// Type definitions for the API response
export interface Warehouse {
  id: number;
  address: string;
  city: string;
  state: string;
  totalSpaceSqft: number[];
  clearHeightFt: string | null;
  compliances: string;
  otherSpecifications: string | null;
  ratePerSqft: string;
  photos: string[] | string | null;
  fireNocAvailable: boolean | null;
  fireSafetyMeasures: string | null;
}

// Extended interface for warehouse detail page with additional fields
export interface WarehouseDetail extends Warehouse {
  numberOfDocks?: string;
  warehouseType?: string;
  zone?: string;
}

export interface WarehouseAPIResponse {
  data: Warehouse[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Response interface for individual warehouse detail
export interface WarehouseDetailResponse {
  data?: WarehouseDetail;
  error?: string;
  message?: string;
}

// Custom error class for warehouse API errors
export class WarehouseAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'WarehouseAPIError';
  }
}

class WarehouseAPI {
  private baseURL: string;

  constructor(baseURL: string = config.apiBaseUrl) {
        this.baseURL = baseURL;
  }

  async getWarehouses(
    page: number = 1, 
    pageSize: number = 10,
    filters?: {
      city?: string;
      state?: string;
      warehouseType?: string;
      fireNocAvailable?: boolean;
      minSpace?: number;
      maxSpace?: number;
    }
  ): Promise<WarehouseAPIResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      // Add filters if provided
      if (filters) {
        if (filters.city) {
          params.append('city', filters.city);
        }
        if (filters.state) {
          params.append('state', filters.state);
        }
        if (filters.warehouseType) {
          params.append('warehouseType', filters.warehouseType);
        }
        if (filters.fireNocAvailable !== undefined) {
          params.append('fireNocAvailable', filters.fireNocAvailable.toString());
        }
        if (filters.minSpace !== undefined && filters.minSpace > 0) {
          params.append('minSpace', filters.minSpace.toString());
        }
        if (filters.maxSpace !== undefined && filters.maxSpace < 100000) {
          params.append('maxSpace', filters.maxSpace.toString());
        }
      }

      const response = await fetch(
        `${this.baseURL}/warehouses?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  /**
   * Fetch individual warehouse by ID
   * @param id - Warehouse ID
   * @returns Promise<WarehouseDetail> - Individual warehouse data
   * @throws WarehouseAPIError - For API errors including 404, network failures, etc.
   */
  async getWarehouseById(id: number | string): Promise<WarehouseDetail> {
    try {
      // Validate warehouse ID
      const warehouseId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (!warehouseId || isNaN(warehouseId) || warehouseId <= 0) {
        throw new WarehouseAPIError(
          'Invalid warehouse ID provided',
          400,
          'INVALID_ID'
        );
      }

      console.log(`Fetching warehouse details for ID: ${warehouseId}`);

      const response = await fetch(
        `${this.baseURL}/warehouses/${warehouseId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle different HTTP status codes
      if (!response.ok) {
        let errorMessage = 'Failed to fetch warehouse details';
        let errorCode = 'FETCH_ERROR';

        switch (response.status) {
          case 404:
            errorMessage = 'Warehouse not found';
            errorCode = 'WAREHOUSE_NOT_FOUND';
            break;
          case 400:
            errorMessage = 'Invalid warehouse ID';
            errorCode = 'INVALID_REQUEST';
            break;
          case 500:
            errorMessage = 'Server error occurred';
            errorCode = 'SERVER_ERROR';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable';
            errorCode = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = `HTTP error! status: ${response.status}`;
            errorCode = 'HTTP_ERROR';
        }

        throw new WarehouseAPIError(errorMessage, response.status, errorCode);
      }

      const result: WarehouseDetailResponse = await response.json();

      // Handle API response structure
      if (result.error) {
        throw new WarehouseAPIError(
          result.error || 'API returned an error',
          response.status,
          'API_ERROR'
        );
      }

      if (!result.data) {
        // Handle case where response doesn't have expected structure
        // Some APIs might return the warehouse data directly
        const warehouseData = result as unknown as WarehouseDetail;
        if (warehouseData && typeof warehouseData === 'object' && 'id' in warehouseData) {
          return this.transformWarehouseDetailData(warehouseData);
        }
        
        throw new WarehouseAPIError(
          'Invalid response format from API',
          200,
          'INVALID_RESPONSE'
        );
      }

      // Extract warehouse data from response
      const warehouseData = result.data || (result as unknown as WarehouseDetail);
      
      return this.transformWarehouseDetailData(warehouseData);

    } catch (error) {
      console.error('Error fetching warehouse by ID:', error);
      
      // Re-throw WarehouseAPIError as-is
      if (error instanceof WarehouseAPIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new WarehouseAPIError(
          'Network error: Unable to connect to the server',
          0,
          'NETWORK_ERROR'
        );
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new WarehouseAPIError(
          'Invalid response format from server',
          200,
          'PARSE_ERROR'
        );
      }

      // Handle any other unexpected errors
      throw new WarehouseAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Transform and validate warehouse detail data for the detail page
   * @param warehouse - Raw warehouse data from API
   * @returns WarehouseDetail - Transformed warehouse data
   */
  private transformWarehouseDetailData(warehouse: WarehouseDetail): WarehouseDetail {
    // Validate required fields
    if (!warehouse.id) {
      throw new WarehouseAPIError(
        'Warehouse data missing required ID field',
        200,
        'INVALID_DATA'
      );
    }

    // Ensure photos is properly formatted
    let processedPhotos: string[] = [];
    if (warehouse.photos) {
      processedPhotos = getAllImageUrls(warehouse.photos);
    }

    // Return transformed warehouse data with defaults for missing fields
    return {
      ...warehouse,
      address: warehouse.address || 'Address not available',
      city: warehouse.city || 'City not specified',
      state: warehouse.state || 'State not specified',
      totalSpaceSqft: Array.isArray(warehouse.totalSpaceSqft) 
        ? warehouse.totalSpaceSqft 
        : warehouse.totalSpaceSqft 
          ? [warehouse.totalSpaceSqft as unknown as number]
          : [0],
      clearHeightFt: warehouse.clearHeightFt || 'Not specified',
      compliances: warehouse.compliances || 'Compliance information not available',
      otherSpecifications: warehouse.otherSpecifications || null,
      ratePerSqft: warehouse.ratePerSqft || 'Price on request',
      photos: processedPhotos,
      fireNocAvailable: warehouse.fireNocAvailable ?? null,
      fireSafetyMeasures: warehouse.fireSafetyMeasures || null,
      numberOfDocks: warehouse.numberOfDocks || 'Not specified',
      warehouseType: warehouse.warehouseType || 'Standard',
      zone: warehouse.zone || 'Not specified',
    };
  }
}

export const warehouseAPI = new WarehouseAPI();

/**
 * Extracts the first valid image URL from a photos string or array
 * Handles JSON arrays, regular arrays, and comma-separated strings
 * Filters out PDFs and non-image files
 */
export const getFirstImageUrl = (photosData: string | string[] | null): string | null => {
  const allImages = getAllImageUrls(photosData);
  return allImages.length > 0 ? allImages[0] : null;
};

/**
 * Extracts all valid image URLs from a photos string or array
 * Handles JSON arrays, regular arrays, and comma-separated strings
 * Filters out PDFs and non-image files
 */
export const getAllImageUrls = (photosData: string | string[] | null): string[] => {
  if (!photosData) {
    console.log('No photos data provided');
    return [];
  }

  try {
    console.log('Processing photos data:', photosData);
    
    let photoUrls: string[] = [];
    
    // Handle different input types
    if (Array.isArray(photosData)) {
      // If it's already an array
      console.log('Photos data is already an array:', photosData);
      photoUrls = photosData;
    } else if (typeof photosData === 'string') {
      // If it's a string, try to parse as JSON first
      try {
        photoUrls = JSON.parse(photosData);
        console.log('Parsed as JSON array:', photoUrls);
      } catch {
        // If JSON parsing fails, try splitting by comma
        photoUrls = photosData.split(',').map(url => url.trim());
        console.log('Parsed as comma-separated:', photoUrls);
      }
    } else {
      console.log('Unknown photos data type:', typeof photosData);
      return [];
    }

    // If we have an array with a single string containing comma-separated URLs, split it
    if (photoUrls.length === 1 && typeof photoUrls[0] === 'string' && photoUrls[0].includes(',')) {
      photoUrls = photoUrls[0].split(',').map(url => url.trim());
      console.log('Split single comma-separated string:', photoUrls);
    }

    // Filter for valid image URLs (exclude PDFs and other non-image formats)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const excludedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar', '.7z'];
    
    const imageUrls = photoUrls.filter(url => {
      if (!url || typeof url !== 'string') {
        console.log('Invalid URL type:', url);
        return false;
      }
      
      // Trim whitespace
      url = url.trim();
      
      // Must start with http or https
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.log('Invalid URL protocol:', url);
        return false;
      }
      
      const lowercaseUrl = url.toLowerCase();
      
      // Exclude non-image file types
      const hasExcludedExtension = excludedExtensions.some(ext => lowercaseUrl.includes(ext));
      if (hasExcludedExtension) {
        console.log('Skipping non-image file:', url);
        return false;
      }
      
      // Check if it has a valid image extension
      const hasImageExtension = imageExtensions.some(ext => lowercaseUrl.includes(ext));
      const isImageService = lowercaseUrl.includes('picsum.photos') ||
                            lowercaseUrl.includes('placeholder.com') ||
                            lowercaseUrl.includes('unsplash.com') ||
                            lowercaseUrl.includes('cloudinary.com') ||
                            lowercaseUrl.includes('imgur.com') ||
                            lowercaseUrl.includes('amazonaws.com') ||
                            lowercaseUrl.includes('r2.dev') ||
                            lowercaseUrl.includes('googleusercontent.com') ||
                            lowercaseUrl.includes('imagekit.io');
      
      // Accept if it looks like a valid image URL
      const looksLikeImage = hasImageExtension || isImageService;
      
      if (!looksLikeImage) {
        console.log(`Filtering out URL (no image indicators): ${url}`);
      }
      
      return looksLikeImage;
    });

    console.log(`Filtered ${photoUrls.length} URLs down to ${imageUrls.length} image URLs`);
    
    return imageUrls;
  } catch (error) {
    console.error('Error parsing photos data:', error);
    return [];
  }
};

/**
 * Transform warehouse detail data for the detail page component
 * @param warehouse - WarehouseDetail data from API
 * @returns Transformed data optimized for detail page display
 */
export const transformWarehouseDetailData = (warehouse: WarehouseDetail) => {
  console.log('Transforming warehouse detail data:', warehouse);
  
  // Get all image URLs
  const imageUrls = getAllImageUrls(warehouse.photos);
  
  // Parse space information
  const totalSpaces = Array.isArray(warehouse.totalSpaceSqft) 
    ? warehouse.totalSpaceSqft 
    : [warehouse.totalSpaceSqft as unknown as number];
  
  const mainSpace = totalSpaces[0] || 0;
  const availableSpaces = totalSpaces.length > 1 ? totalSpaces.slice(1) : [];
  
  // Parse pricing
  const ratePerSqft = warehouse.ratePerSqft 
    ? parseInt(warehouse.ratePerSqft.replace(/[^\d]/g, '')) || 0
    : 0;
  
  // Parse specifications
  const specifications = {
    infrastructure: {
      type: warehouse.warehouseType || 'Standard',
      numberOfDocks: warehouse.numberOfDocks || 'Not specified',
      clearHeight: warehouse.clearHeightFt || 'Not specified',
    },
    space: {
      totalSpace: mainSpace,
      availableSpaces: availableSpaces,
      ratePerSqft: ratePerSqft,
    },
    location: {
      address: warehouse.address,
      city: warehouse.city,
      state: warehouse.state,
      zone: warehouse.zone || 'Not specified',
    },
    compliance: {
      fireNocAvailable: warehouse.fireNocAvailable,
      fireSafetyMeasures: warehouse.fireSafetyMeasures,
      compliances: warehouse.compliances,
    },
    features: warehouse.otherSpecifications 
      ? warehouse.otherSpecifications.split(',').map(f => f.trim()).filter(f => f)
      : [],
  };

  return {
    id: warehouse.id,
    images: imageUrls,
    specifications,
    rawData: warehouse, // Keep original data for any edge cases
  };
};

/**
 * Transform API warehouse data to component props format
 */
export const transformWarehouseData = (warehouse: Warehouse) => {
  console.log('Transforming warehouse data:', warehouse);
  
  // Extract features from otherSpecifications and add compliances
  let features: string[] = [];
  
  // Add compliances as the first bullet point if available
  if (warehouse.compliances && warehouse.compliances.trim()) {
    features.push(`Compliances: ${warehouse.compliances.trim()}`);
  }
  
  // Add other specifications as additional bullet points
  if (warehouse.otherSpecifications && warehouse.otherSpecifications.trim()) {
    const otherFeatures = warehouse.otherSpecifications
      .split(',')
      .filter(f => f.trim())
      .map(f => f.trim());
    features = features.concat(otherFeatures);
  }
  
  // If no features found, provide defaults
  if (features.length === 0) {
    features = ['Modern warehouse facility', 'Professional storage solutions', 'Strategic location'];
  }

  // Get the main size (first value or single value)
  const mainSize = Array.isArray(warehouse.totalSpaceSqft) 
    ? warehouse.totalSpaceSqft[0] 
    : warehouse.totalSpaceSqft || 0;

  // Parse ceiling height
  const ceilingHeight = warehouse.clearHeightFt 
    ? parseInt(warehouse.clearHeightFt.replace(/[^\d]/g, '')) || 10
    : 10;

  // Parse price
  const price = warehouse.ratePerSqft 
    ? parseInt(warehouse.ratePerSqft.replace(/[^\d]/g, '')) || 35
    : 35;

  // Get image URL
  const apiImages = getAllImageUrls(warehouse.photos);
  const finalImages = apiImages.length > 0 ? apiImages : []; // Empty array if no images
  
  console.log(`Warehouse ${warehouse.id}: Found ${apiImages.length} images`);

  return {
    id: warehouse.id,
    image: finalImages.length > 0 ? finalImages[0] : null,
    images: finalImages,
    address: warehouse.address,
    location: {
      city: warehouse.city,
      state: warehouse.state
    },
    size: mainSize,
    ceilingHeight,
    price,
    fireCompliance: warehouse.fireNocAvailable || false,
    features: features.slice(0, 3) // Limit to 3 features
  };
};
