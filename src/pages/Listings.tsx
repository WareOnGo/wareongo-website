import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import ContactFormDialog from '@/components/ContactFormDialog';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';

// Fallback sample data (kept as backup when API is unavailable)
const sampleWarehouses = [
  {
    id: 1001,
    image: "https://picsum.photos/400/300?random=1001",
    address: "Plot 12, Industrial Area, Andheri East",
    location: { city: "Mumbai", state: "Maharashtra" },
    size: 25000,
    ceilingHeight: 12,
    price: 45,
    fireCompliance: true,
    features: [
      "24/7 security and fire suppression system",
      "Loading docks and modern facility",
      "Excellent connectivity to highways and port facilities"
    ]
  },
  {
    id: 1002,
    image: "https://picsum.photos/400/300?random=1002",
    address: "A-45, Airport Road, Mahipalpur",
    location: { city: "Delhi", state: "Delhi" },
    size: 18000,
    ceilingHeight: 10,
    price: 52,
    fireCompliance: false,
    features: [
      "Climate-controlled environment",
      "Advanced inventory management systems",
      "Near airport and national highways"
    ]
  },
  {
    id: 1003,
    image: "https://picsum.photos/400/300?random=1003",
    address: "#88, Whitefield Industrial Park",
    location: { city: "Bangalore", state: "Karnataka" },
    size: 32000,
    ceilingHeight: 15,
    price: 38,
    fireCompliance: true,
    features: [
      "Automated storage and solar power backup",
      "Dedicated IT infrastructure",
      "Ideal for e-commerce and tech companies"
    ]
  },
  {
    id: 1004,
    image: "https://picsum.photos/400/300?random=1004",
    address: "Dock 7, Ennore Port Road",
    location: { city: "Chennai", state: "Tamil Nadu" },
    size: 22000,
    ceilingHeight: 11,
    price: 42,
    fireCompliance: true,
    features: [
      "Direct access to shipping lanes",
      "Temperature-controlled zones",
      "Specialized handling for fragile goods"
    ]
  },
  {
    id: 1005,
    image: "https://picsum.photos/400/300?random=1005",
    address: "Plot 21, Pimpri Industrial Estate",
    location: { city: "Pune", state: "Maharashtra" },
    size: 28000,
    ceilingHeight: 13,
    price: 40,
    fireCompliance: false,
    features: [
      "Multi-level storage with conveyor systems",
      "Automated sorting facility",
      "Located in industrial hub with rail/road connectivity"
    ]
  },
  {
    id: 1006,
    image: "https://picsum.photos/400/300?random=1006",
    address: "Logistics Park, Shamshabad",
    location: { city: "Hyderabad", state: "Telangana" },
    size: 35000,
    ceilingHeight: 14,
    price: 36,
    fireCompliance: true,
    features: [
      "Cross-docking capabilities",
      "RFID tracking and biometric security",
      "Dedicated parking for heavy vehicles"
    ]
  },
  {
    id: 1007,
    image: "https://picsum.photos/400/300?random=1007",
    address: "Old Mill Compound, Howrah",
    location: { city: "Kolkata", state: "West Bengal" },
    size: 20000,
    ceilingHeight: 9,
    price: 35,
    fireCompliance: false,
    features: [
      "Modern upgrades in heritage area",
      "Ideal for manufacturing",
      "Easy access to river port and railway"
    ]
  },
  {
    id: 1008,
    image: "https://picsum.photos/400/300?random=1008",
    address: "GIDC Estate, Vatva",
    location: { city: "Ahmedabad", state: "Gujarat" },
    size: 26000,
    ceilingHeight: 12,
    price: 39,
    fireCompliance: true,
    features: [
      "Chemical-grade facility",
      "Specialized ventilation and safety systems",
      "Compliant with international standards"
    ]
  },
  {
    id: 1009,
    image: "https://picsum.photos/400/300?random=1009",
    address: "Textile Park, Sitapura",
    location: { city: "Jaipur", state: "Rajasthan" },
    size: 15000,
    ceilingHeight: 8,
    price: 30,
    fireCompliance: false,
    features: [
      "Cost-effective storage solution",
      "Basic amenities included",
      "Good connectivity to Delhi-Mumbai corridor"
    ]
  }
];

const Listings = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
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
      
      // Fallback to sample data if API fails
      setWarehouses(sampleWarehouses);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
    fetchWarehouses(1, newPageSize);
  };

  const handleWarehouseClick = (warehouseId: number) => {
    // Open contact dialog instead of logging
    console.log(`Clicked warehouse ${warehouseId}`);
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
        source="warehouse_card_click"
      />
    </div>
  );
};

export default Listings;
