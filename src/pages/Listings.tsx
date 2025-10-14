import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import ContactFormDialog from '@/components/ContactFormDialog';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';

const Listings = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async (page: number = 1, pageSize?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPageSize = pageSize || pagination.pageSize;
      const response = await warehouseAPI.getWarehouses(page, currentPageSize);
      
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
          <div className="text-center mb-12">
            <h1 className="section-title text-4xl md:text-5xl mb-4">Warehouse Listings</h1>
            <p className="text-lg text-wareongo-charcoal max-w-2xl mx-auto">
              Discover premium warehouse spaces across India. Find the perfect storage solution for your business needs.
            </p>
          </div>

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
          {!loading && !error && (
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

          {/* Pagination Info and Controls */}
          {!loading && !error && (
            <div className="text-center space-y-4">
              <p className="text-wareongo-charcoal text-sm">
                Showing {warehouses.length} of {pagination.totalItems} warehouses 
                (Page {pagination.currentPage} of {pagination.totalPages})
              </p>
              
              {/* Page Size Selector */}
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
