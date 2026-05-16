import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/PageHead';
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
import { trackEvent } from '@/lib/analytics';

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
  const navigate = useNavigate();
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
    pageSize: 21
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
    trackEvent('filter_apply', {
      city: filters.city || undefined,
      state: filters.state || undefined,
      fire_compliance: filters.fireCompliance || undefined,
      warehouse_type: filters.warehouseType || undefined,
      min_sqft: filters.minSqft,
      max_sqft: filters.maxSqft,
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchWarehouses(1);
  };

  const clearFilters = () => {
    trackEvent('filter_clear', {});
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
    // Navigate to warehouse detail page
    console.log(`Navigating to warehouse ${warehouseId}`);
    navigate(`/warehouse/${warehouseId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="Warehouse Listings Across India | WareOnGo"
        description="Browse 1,500+ verified warehouse listings across India. Filter by city, size, compliance, and warehouse type. Direct contact, transparent pricing."
        path="/listings"
      />
      <Navbar />

      <main className="flex-grow bg-wareongo-ivory">
        <div className="section-container">
          <div className="max-w-2xl mb-8 md:mb-12">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
              Inventory
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-3 leading-tight">
              Warehouse Listings
            </h1>
            <p className="text-wareongo-slate text-sm sm:text-base md:text-lg">
              Premium warehouse spaces across India. Find the perfect storage solution for your business.
            </p>
          </div>

          {/* Filter Toggle Button */}
          <div className="mb-6 flex justify-between items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-wareongo-blue text-wareongo-blue text-sm font-medium bg-transparent hover:bg-wareongo-blue/5 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide filters' : 'Show filters'}
              {hasActiveFilters() && (
                <span className="ml-1 bg-wareongo-blue text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-wareongo-slate hover:text-wareongo-blue transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-transparent border border-wareongo-blue rounded-2xl p-6 sm:p-8 mb-8">
              <div className="mb-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-1.5">
                  Refine
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-wareongo-blue">Filter warehouses</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-[13px]">City</Label>
                  <Select
                    value={filters.city}
                    onValueChange={(value) => handleFilterChange('city', value)}
                  >
                    <SelectTrigger id="city" className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                      <SelectItem value="all" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">All cities</SelectItem>
                      {cityOptions.map(city => (
                        <SelectItem key={city} value={city} className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-[13px]">State</Label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => handleFilterChange('state', value)}
                  >
                    <SelectTrigger id="state" className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                      <SelectItem value="all" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">All states</SelectItem>
                      {stateOptions.map(state => (
                        <SelectItem key={state} value={state} className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fireCompliance" className="text-[13px]">Fire compliance</Label>
                  <Select
                    value={filters.fireCompliance}
                    onValueChange={(value) => handleFilterChange('fireCompliance', value)}
                  >
                    <SelectTrigger id="fireCompliance" className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                      <SelectValue placeholder="Select compliance" />
                    </SelectTrigger>
                    <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                      {fireComplianceOptions.map(option => (
                        <SelectItem key={option} value={option.toLowerCase()} className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="warehouseType" className="text-[13px]">Warehouse type</Label>
                  <Select
                    value={filters.warehouseType}
                    onValueChange={(value) => handleFilterChange('warehouseType', value)}
                  >
                    <SelectTrigger id="warehouseType" className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                      <SelectItem value="all" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">All types</SelectItem>
                      {warehouseTypeOptions.map(type => (
                        <SelectItem key={type} value={type} className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[13px]">Total area range (sqft)</Label>
                  <div className="pt-2">
                    <Slider
                      min={0}
                      max={100000}
                      step={1000}
                      value={[filters.minSqft, filters.maxSqft]}
                      onValueChange={handleSqftRangeChange}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-xs text-wareongo-slate font-medium">
                      <span>{filters.minSqft.toLocaleString()} sqft</span>
                      <span>{filters.maxSqft.toLocaleString()} sqft</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 h-10 rounded-xl border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-wareongo-blue/5 border border-wareongo-blue/20 rounded-2xl h-80"></div>
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
                className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Warehouse Grid */}
          {!loading && !error && warehouses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {warehouses.map((warehouse, idx) => (
                <WarehouseCard
                  key={warehouse.id}
                  id={warehouse.id}
                  index={idx}
                  image={warehouse.image}
                  images={warehouse.images}
                  address={warehouse.address}
                  location={warehouse.location}
                  size={warehouse.size}
                  ceilingHeight={warehouse.ceilingHeight}
                  price={warehouse.price}
                  fireCompliance={warehouse.fireCompliance}
                  features={warehouse.features}
                  onClick={() => {
                    trackEvent('listing_open', {
                      warehouse_id: warehouse.id,
                      source: 'listings_page',
                      position: (pagination.currentPage - 1) * pagination.pageSize + idx + 1,
                      page: pagination.currentPage,
                      address: warehouse.address,
                      city: warehouse.location?.city,
                      state: warehouse.location?.state,
                      size_sqft: warehouse.size,
                      price_per_sqft: warehouse.price,
                    });
                    handleWarehouseClick(warehouse.id);
                  }}
                />
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!loading && !error && warehouses.length === 0 && (
            <div className="text-center py-16 border border-wareongo-blue/30 rounded-2xl">
              <p className="text-lg sm:text-xl text-wareongo-blue font-semibold mb-2">No warehouses found</p>
              <p className="text-wareongo-slate text-sm mb-6">
                Try adjusting your filters to see more results.
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Pagination Info and Controls */}
          {!loading && !error && warehouses.length > 0 && (
            <div className="text-center space-y-5">
              <p className="text-wareongo-slate text-sm">
                Showing {warehouses.length} of {pagination.totalItems} warehouses
                {pagination.totalPages > 1 && ` · Page ${pagination.currentPage} of ${pagination.totalPages}`}
              </p>

              {pagination.totalItems > 10 && (
                <div className="flex justify-center items-center gap-3">
                  <label htmlFor="pageSize" className="text-xs uppercase tracking-[0.18em] text-wareongo-slate">
                    Per page
                  </label>
                  <select
                    id="pageSize"
                    value={pagination.pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 h-9 bg-transparent border border-wareongo-blue/30 rounded-lg text-sm text-wareongo-blue focus:outline-none focus:ring-2 focus:ring-wareongo-blue/30"
                  >
                    <option value={10}>10</option>
                    <option value={21}>21</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      const next = pagination.currentPage - 1;
                      trackEvent('listings_paginate', { from_page: pagination.currentPage, to_page: next, direction: 'prev' });
                      fetchWarehouses(next);
                    }}
                    disabled={pagination.currentPage === 1}
                    className="px-4 h-9 rounded-lg border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1.5">
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

                      const isActive = pageNum === pagination.currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            trackEvent('listings_paginate', { from_page: pagination.currentPage, to_page: pageNum, direction: 'jump' });
                            fetchWarehouses(pageNum);
                          }}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors border ${
                            isActive
                              ? 'bg-wareongo-blue text-white border-wareongo-blue'
                              : 'bg-transparent text-wareongo-blue border-wareongo-blue/30 hover:bg-wareongo-blue/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const next = pagination.currentPage + 1;
                      trackEvent('listings_paginate', { from_page: pagination.currentPage, to_page: next, direction: 'next' });
                      fetchWarehouses(next);
                    }}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 h-9 rounded-lg border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
