# Warehouse Detail Page Design Document

## Overview

The warehouse detail page feature creates individual pages for each warehouse, displaying comprehensive information in a modern, user-friendly interface. The page includes an image carousel, detailed specifications, and a contact form, following the existing design patterns shown in the provided screenshots.

## Architecture

### Component Structure
```
WarehouseDetail (Page Component)
├── WarehouseImageCarousel
├── WarehouseInfo
│   ├── WarehouseHeader
│   ├── WarehouseSpecs
│   └── ContactSection
└── LoadingState / ErrorState
```

### Routing Integration
- New route: `/warehouse/:id` 
- Integrates with existing React Router setup in App.tsx
- Updates WarehouseCard component to navigate to detail page on click

### Data Flow
1. URL parameter extraction (`useParams` hook)
2. API call to `/warehouses/:id` endpoint
3. Data transformation and state management
4. Component rendering with fetched data

## Components and Interfaces

### 1. WarehouseDetail Page Component

**Location**: `src/pages/WarehouseDetail.tsx`

**Responsibilities**:
- Route parameter handling
- API data fetching
- Loading and error state management
- Layout orchestration

**Key Features**:
- Uses React Query for data fetching and caching
- Responsive layout matching existing design patterns
- Error handling for invalid warehouse IDs
- Loading states with skeleton components

### 2. WarehouseImageCarousel Component

**Location**: `src/components/WarehouseImageCarousel.tsx`

**Responsibilities**:
- Display warehouse images in a carousel format
- Handle image filtering (exclude PDFs, documents)
- Provide navigation controls and indicators
- Manage image loading states and errors

**Key Features**:
- Smooth transitions between images
- Touch/swipe support for mobile devices
- Fallback for missing or invalid images
- Keyboard navigation support
- Image lazy loading for performance

**Design Specifications**:
- Large main image display (600px height on desktop)
- Thumbnail navigation at bottom
- Previous/Next arrow buttons
- Image counter indicator
- Responsive design for mobile/tablet

### 3. WarehouseInfo Component

**Location**: `src/components/WarehouseInfo.tsx`

**Responsibilities**:
- Display warehouse specifications and details
- Organize information in structured sections
- Maintain consistent styling with existing components

**Sections**:
- **Header**: Address, city/state, warehouse code
- **Infrastructure**: Type, docks, height specifications  
- **Space Details**: Total space, available space, pricing
- **Compliance**: Fire NOC, safety measures
- **Additional Features**: Other specifications

### 4. ContactSection Component

**Location**: `src/components/ContactSection.tsx`

**Responsibilities**:
- Display contact form for inquiries
- Handle form submission
- Integrate with existing form submission service

**Features**:
- "Schedule a visit" and "Request a callback" buttons
- Form fields: Name, Mobile, Email
- Form validation and error handling
- Success/error messaging
- Integration with existing ContactFormDialog

## Data Models

### WarehouseDetail Interface
```typescript
interface WarehouseDetail {
  id: number;
  address: string;
  city: string;
  state: string;
  numberOfDocks: string;
  totalSpaceSqft: number[];
  clearHeightFt: string;
  warehouseType: string;
  zone: string;
  compliances: string;
  otherSpecifications: string;
  ratePerSqft: string;
  photos: string[];
  fireNocAvailable: boolean | null;
  fireSafetyMeasures: string | null;
}
```

### API Response Format
The component will consume the existing API endpoint `/warehouses/:id` which returns:
```json
{
  "id": 420,
  "address": "KIADB Aerospace Industrial Park, Devanahalli",
  "numberOfDocks": "2-4",
  "totalSpaceSqft": [50180],
  "clearHeightFt": "50ft",
  "city": "Bangalore",
  "state": "Karnataka",
  "photos": ["url1", "url2", "url3"],
  "warehouseType": "PEB",
  "zone": "SOUTH",
  "compliances": "Industrial Land Sanction",
  "otherSpecifications": "1000kva power supply, Rainwater harvesting setup, STP available",
  "ratePerSqft": "40",
  "fireNocAvailable": null,
  "fireSafetyMeasures": null
}
```

## Error Handling

### API Error Scenarios
1. **Warehouse Not Found (404)**: Display user-friendly "Warehouse not found" message with navigation back to listings
2. **Network Errors**: Show retry mechanism with error message
3. **Invalid Warehouse ID**: Redirect to 404 page or show error message
4. **Server Errors (500)**: Display generic error message with support contact

### Image Loading Errors
1. **Invalid Image URLs**: Filter out and continue with valid images
2. **Image Load Failures**: Show placeholder or skip to next valid image
3. **No Valid Images**: Display "Images available on request" placeholder

### Form Submission Errors
1. **Validation Errors**: Inline field validation with error messages
2. **Network Failures**: Retry mechanism with user feedback
3. **Server Errors**: Clear error messaging with support contact

## Testing Strategy

### Unit Tests
- Component rendering with mock data
- Image carousel navigation functionality
- Form validation logic
- Error state handling
- Data transformation utilities

### Integration Tests
- API integration with warehouse endpoint
- Form submission flow
- Navigation between listing and detail pages
- Image loading and error handling

### User Acceptance Tests
- Complete user journey from listing to detail page
- Form submission and success flow
- Responsive design across devices
- Image carousel functionality
- Error scenarios and recovery

## Performance Considerations

### Image Optimization
- Lazy loading for carousel images
- Image compression and format optimization
- Progressive loading with placeholders
- Preloading of adjacent carousel images

### Data Fetching
- React Query for caching and background updates
- Optimistic loading states
- Error boundary implementation
- Memory leak prevention

### Bundle Size
- Code splitting for detail page components
- Lazy loading of non-critical components
- Tree shaking of unused utilities

## Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Arrow key navigation for image carousel
- Enter/Space key activation for buttons

### Screen Reader Support
- Proper ARIA labels for carousel controls
- Alt text for all images
- Form field labels and descriptions
- Error message announcements

### Visual Accessibility
- High contrast ratios for text
- Focus indicators for interactive elements
- Responsive text sizing
- Color-blind friendly design

## Mobile Responsiveness

### Breakpoint Strategy
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Mobile Optimizations
- Touch-friendly carousel controls
- Optimized image sizes for mobile
- Collapsible information sections
- Mobile-first form design
- Swipe gestures for carousel

## Integration Points

### Existing Components
- Reuse existing UI components (Button, Input, Card, etc.)
- Integrate with ContactFormDialog for form submissions
- Use existing toast notifications for feedback
- Maintain consistent styling with current design system

### Services Integration
- Extend warehouseAPI service with getWarehouseById method
- Use existing formSubmission service for contact forms
- Integrate with existing error handling patterns

### Navigation Integration
- Update WarehouseCard component to link to detail pages
- Add breadcrumb navigation for better UX
- Implement back navigation to listings

## Security Considerations

### Input Validation
- Sanitize warehouse ID parameter
- Validate form inputs on client and server
- Prevent XSS through proper data handling

### API Security
- Handle authentication if required
- Rate limiting considerations
- Secure image URL handling

## Future Enhancements

### Phase 2 Features
- Image zoom functionality
- Virtual tour integration
- Comparison with other warehouses
- Favorite/bookmark functionality
- Social sharing capabilities

### Analytics Integration
- Track page views and user interactions
- Monitor form conversion rates
- Image carousel engagement metrics
- Performance monitoring