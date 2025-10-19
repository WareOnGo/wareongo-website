# Configuration Guide

This file contains all the centralized configuration for the WareOnGo frontend application.

## File Location
`src/config/config.ts`

## Configuration Options

### 1. API Base URL
```typescript
apiBaseUrl: 'https://wareongo-website-backend.onrender.com'
```
- Update this when deploying to different environments (development, staging, production)

### 2. API Endpoints
```typescript
api: {
  warehouses: '/warehouses',
  enquiries: '/enquiries',
  customerRequests: '/customer-requests',
  googleLogin: '/api/auth/google-login',
}
```
- These are relative paths that will be appended to `apiBaseUrl`

### 3. Google OAuth Client ID
```typescript
googleClientId: '457806840342-8uqcocglvgkjd8h9m0mldk79pvbvos8d.apps.googleusercontent.com'
```
- Get this from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Update when using different Google OAuth projects

### 4. Pagination Defaults
```typescript
pagination: {
  defaultPageSize: 20,
  maxPageSize: 50,
}
```

### 5. Filter Defaults
```typescript
filters: {
  maxBudget: 100000,
  minBudget: 0,
  cities: ['Bangalore', 'Hosur', 'Kolkata', 'Delhi', 'Hyderabad'],
}
```

## Usage in Code

### Import the config:
```typescript
import { config, getApiUrl } from '@/config/config';
```

### Use API endpoints:
```typescript
// Get full URL
const url = getApiUrl(config.api.warehouses);
// Returns: 'https://wareongo-website-backend.onrender.com/warehouses'

// Or use directly
fetch(`${config.apiBaseUrl}${config.api.enquiries}`, {...})
```

### Use other config values:
```typescript
const clientId = config.googleClientId;
const defaultPage = config.pagination.defaultPageSize;
```

## Files Using This Config

1. **src/App.tsx** - Google OAuth Provider
2. **src/services/warehouseAPI.ts** - Warehouse data fetching
3. **src/services/formSubmission.ts** - Contact form submissions
4. **src/services/warehouseRequest.ts** - Warehouse request form
5. **src/components/LoginButton.js** - Google login authentication

## Deployment

When deploying to different environments, simply update the values in `config.ts`:

### Development
```typescript
apiBaseUrl: 'http://localhost:5000'
```

### Production
```typescript
apiBaseUrl: 'https://wareongo-website-backend.onrender.com'
```

No need for `.env` files - all configuration is in one TypeScript file that's committed to the repository!
