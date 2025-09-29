/**
 * Warehouse API service for fetching warehouse data from backend
 */

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

export interface WarehouseAPIResponse {
  data: Warehouse[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

class WarehouseAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async getWarehouses(page: number = 1, pageSize: number = 10): Promise<WarehouseAPIResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/warehouses?page=${page}&pageSize=${pageSize}`
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
}

export const warehouseAPI = new WarehouseAPI();

/**
 * Extracts the first valid image URL from a photos string or array
 * Handles JSON arrays, regular arrays, and comma-separated strings
 * Filters out PDFs and non-image files
 */
export const getFirstImageUrl = (photosData: string | string[] | null): string | null => {
  if (!photosData) {
    console.log('No photos data provided');
    return null;
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
      return null;
    }

    // If we have an array with a single string containing comma-separated URLs, split it
    if (photoUrls.length === 1 && typeof photoUrls[0] === 'string' && photoUrls[0].includes(',')) {
      photoUrls = photoUrls[0].split(',').map(url => url.trim());
      console.log('Split single comma-separated string:', photoUrls);
    }

    // Filter for valid image URLs (exclude PDFs and other non-image formats)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const imageUrls = photoUrls.filter(url => {
      if (!url || typeof url !== 'string') {
        console.log('Invalid URL type:', url);
        return false;
      }
      
      const lowercaseUrl = url.toLowerCase();
      
      // Check if it's a PDF
      if (lowercaseUrl.includes('.pdf')) {
        console.log('Skipping PDF:', url);
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
                            lowercaseUrl.includes('r2.dev'); // Added for your Cloudflare R2 URLs
      
      // More flexible: accept if it looks like a valid URL and doesn't have obvious non-image indicators
      const looksLikeImage = hasImageExtension || 
                            isImageService || 
                            (url.startsWith('http') && !lowercaseUrl.includes('.pdf') && !lowercaseUrl.includes('.doc'));
      
      console.log(`URL: ${url}, hasImageExtension: ${hasImageExtension}, isImageService: ${isImageService}, looksLikeImage: ${looksLikeImage}`);
      
      return looksLikeImage;
    });

    console.log('Filtered image URLs:', imageUrls);
    
    // Return the first valid image URL
    const firstImage = imageUrls.length > 0 ? imageUrls[0] : null;
    console.log('Selected first image:', firstImage);
    
    return firstImage;
  } catch (error) {
    console.error('Error parsing photos data:', error);
    return null;
  }
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
  const apiImage = getFirstImageUrl(warehouse.photos);
  const finalImage = apiImage; // Don't use picsum fallback, let component handle grey placeholder
  
  console.log(`Warehouse ${warehouse.id}: API image = ${apiImage}, Final image = ${finalImage || 'null (will use grey placeholder)'}`);

  return {
    id: warehouse.id,
    image: finalImage,
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
