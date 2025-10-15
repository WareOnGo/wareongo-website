import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import ContactFormDialog from '@/components/ContactFormDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';

// Filter interface
interface WarehouseFilters {
  city: string;
  state: string;
  fireCompliance: string;
  warehouseType: string;
  minSqft: number;
  maxSqft: number;
}

const Listings = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20
  });

  // Filter state
  const [filters, setFilters] = useState<WarehouseFilters>({
    city: '',
    state: '',
    fireCompliance: '',
    warehouseType: '',
    minSqft: 0,
    maxSqft: 100000,
  });

  // Options for dropdowns (will be populated from API or hardcoded)
  const cityOptions = ['Bangalore', 'Hosur', 'Kolkata', 'Delhi', 'Hyderabad'];
  const stateOptions = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana'];
  const warehouseTypeOptions = ['RCC', 'PEB'];
  const fireComplianceOptions = ['Yes', 'No'];


  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async (page: number = 1, pageSize?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPageSize = pageSize || pagination.pageSize;
      
      // Map Bangalore to query both "Bangalore" and "Bengaluru"
      let cityFilter = filters.city && filters.city !== 'all' ? filters.city : undefined;
      if (cityFilter && cityFilter.toLowerCase() === 'bangalore') {
        cityFilter = 'Bangalore,Bengaluru';
      }
      
      // Map frontend filters to backend API parameters
      const apiFilters = {
        city: cityFilter,
        state: filters.state && filters.state !== 'all' ? filters.state : undefined,
        warehouseType: filters.warehouseType && filters.warehouseType !== 'all' ? filters.warehouseType : undefined,
        fireNocAvailable: filters.fireCompliance 
          ? filters.fireCompliance === 'yes' 
          : undefined,
        minSpace: filters.minSqft > 0 ? filters.minSqft : undefined,
        maxSpace: filters.maxSqft < 100000 ? filters.maxSqft : undefined,
      };
      
      // Remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(apiFilters).filter(([_, v]) => v !== undefined)
      ) as any;
      
      console.log('Sending filters to API:', cleanFilters);
      
      const response = await warehouseAPI.getWarehouses(page, currentPageSize, cleanFilters);
      
      // Transform API data to component format
      const transformedWarehouses = response.data.map(transformWarehouseData);
      
      setWarehouses(transformedWarehouses);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
      setError('Failed to load warehouses. Please try again later.');
      setWarehouses([]); // Set empty array if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof WarehouseFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSqftRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      minSqft: values[0],
      maxSqft: values[1]
    }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    // Reset to page 1 and fetch with filters
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchWarehouses(1);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      state: '',
      fireCompliance: '',
      warehouseType: '',
      minSqft: 0,
      maxSqft: 100000,
    });
    fetchWarehouses(1);
  };

  const hasActiveFilters = () => {
    return filters.city || filters.state || filters.fireCompliance || filters.warehouseType || 
           filters.minSqft > 0 || filters.maxSqft < 100000;
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
    fetchWarehouses(1, newPageSize);
  };

  const handleWarehouseClick = (warehouseId: number) => {
    // Open contact dialog with the warehouse ID
    console.log(`Clicked warehouse ${warehouseId}`);
    setSelectedWarehouseId(warehouseId);
    setIsContactDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
        <div className="section-container">
          <div className="text-center mb-8">
            <h1 className="section-title text-4xl md:text-5xl mb-4">Warehouse Listings</h1>
            <p className="text-lg text-wareongo-charcoal max-w-2xl mx-auto">
              Discover premium warehouse spaces across India. Find the perfect storage solution for your business needs.
            </p>
          </div>

          {/* Filter Toggle Button */}
          <div className="mb-6 flex justify-between items-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters() && (
                <span className="ml-1 bg-wareongo-blue text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </Button>
            {hasActiveFilters() && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-wareongo-blue">Filter Warehouses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* City Filter */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={filters.city}
                    onValueChange={(value) => handleFilterChange('city', value)}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cityOptions.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => handleFilterChange('state', value)}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {stateOptions.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fire Compliance Filter */}
                <div className="space-y-2">
                  <Label htmlFor="fireCompliance">Fire Compliance</Label>
                  <Select
                    value={filters.fireCompliance}
                    onValueChange={(value) => handleFilterChange('fireCompliance', value)}
                  >
                    <SelectTrigger id="fireCompliance">
                      <SelectValue placeholder="Select compliance" />
                    </SelectTrigger>
                    <SelectContent>
                      {fireComplianceOptions.map(option => (
                        <SelectItem key={option} value={option.toLowerCase()}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Warehouse Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="warehouseType">Warehouse Type</Label>
                  <Select
                    value={filters.warehouseType}
                    onValueChange={(value) => handleFilterChange('warehouseType', value)}
                  >
                    <SelectTrigger id="warehouseType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {warehouseTypeOptions.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Area Range Filter */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Total Area Range (sqft)</Label>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                    <Slider
                      min={0}
                      max={100000}
                      step={1000}
                      value={[filters.minSqft, filters.maxSqft]}
                      onValueChange={handleSqftRangeChange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>{filters.minSqft.toLocaleString()} sqft</span>
                      <span>{filters.maxSqft.toLocaleString()} sqft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={clearFilters} variant="outline">
                  Reset
                </Button>
                <Button onClick={applyFilters} className="bg-wareongo-blue hover:bg-blue-700">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => fetchWarehouses(pagination.currentPage)}
                className="bg-wareongo-blue text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Warehouse Grid */}
          {!loading && !error && warehouses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {warehouses.map((warehouse) => (
                <WarehouseCard
                  key={warehouse.id}
                  id={warehouse.id}
                  image={warehouse.image}
                  images={warehouse.images}
                  address={warehouse.address}
                  location={warehouse.location}
                  size={warehouse.size}
                  ceilingHeight={warehouse.ceilingHeight}
                  price={warehouse.price}
                  fireCompliance={warehouse.fireCompliance}
                  features={warehouse.features}
                  onClick={() => handleWarehouseClick(warehouse.id)}
                />
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!loading && !error && warehouses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-wareongo-charcoal mb-4">No warehouses found</p>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more results.
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-wareongo-blue text-white rounded hover:bg-opacity-90 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination Info and Controls */}
          {!loading && !error && warehouses.length > 0 && (
            <div className="text-center space-y-4">
              {/* Show info only if there are results */}
              <p className="text-wareongo-charcoal text-sm">
                Showing {warehouses.length} of {pagination.totalItems} warehouses 
                {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
              </p>
              
              {/* Page Size Selector - only show if there are multiple pages or enough items */}
              {pagination.totalItems > 10 && (
                <div className="flex justify-center items-center gap-3 mb-4">
                  <label htmlFor="pageSize" className="text-sm text-gray-600">
                    Listings per page:
                  </label>
                  <select
                    id="pageSize"
                    value={pagination.pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-wareongo-blue"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
              
              {/* Pagination buttons */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => fetchWarehouses(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchWarehouses(pageNum)}
                          className={`px-3 py-2 rounded text-sm ${
                            pageNum === pagination.currentPage
                              ? 'bg-wareongo-blue text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => fetchWarehouses(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title="Request Full Warehouse Listings"
        description="Share your details to get access to our complete warehouse inventory"
        successMessage="Thank you! Our team will send you the complete listings within 2 hours."
        source={selectedWarehouseId ? `${selectedWarehouseId}` : "listings"}
      />
    </div>
  );
};

export default Listings;
