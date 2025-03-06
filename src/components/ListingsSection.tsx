
import React, { useState } from 'react';
import { MapPin, Ruler, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import ContactFormDialog from "@/components/ContactFormDialog";

const warehouseData = [
  {
    id: 1,
    title: "Modern Distribution Center",
    location: "Chicago, IL",
    size: "45,000 sq ft",
    ceiling: "32 ft",
    price: "$5.75 per sq ft",
    features: ["Climate controlled", "10 loading docks", "24/7 security"],
    image: "/warehouse-1.jpg"
  },
  {
    id: 2,
    title: "Flexible Warehouse Space",
    location: "Atlanta, GA",
    size: "25,000 sq ft",
    ceiling: "28 ft",
    price: "$4.25 per sq ft",
    features: ["Divisible space", "Office included", "Sprinkler system"],
    image: "/warehouse-2.jpg"
  },
  {
    id: 3,
    title: "Industrial Storage Facility",
    location: "Dallas, TX",
    size: "60,000 sq ft",
    ceiling: "36 ft",
    price: "$6.50 per sq ft",
    features: ["Rail access", "Heavy power", "Fenced yard"],
    image: "/warehouse-3.jpg"
  }
];

const WarehouseCard = ({ warehouse }: { warehouse: typeof warehouseData[0] }) => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="h-48 rounded-md mb-4 overflow-hidden">
          <div className="h-full w-full bg-cover bg-center" 
               style={{ backgroundImage: `url(${warehouse.image})` }}>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-wareongo-blue">{warehouse.title}</h3>
        <div className="flex items-center text-wareongo-slate">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{warehouse.location}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="grid grid-cols-2 gap-y-2 mb-4">
          <div className="text-sm text-wareongo-slate">Size:</div>
          <div className="text-sm font-medium">{warehouse.size}</div>
          <div className="text-sm text-wareongo-slate">Ceiling Height:</div>
          <div className="text-sm font-medium">{warehouse.ceiling}</div>
          <div className="text-sm text-wareongo-slate">Price:</div>
          <div className="text-sm font-medium">{warehouse.price}</div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Features:</h4>
          <ul className="text-sm space-y-1">
            {warehouse.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-wareongo-green mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button className="btn-secondary w-full" onClick={() => setIsContactDialogOpen(true)}>
          Raise Enquiry
        </Button>
        
        <ContactFormDialog
          open={isContactDialogOpen}
          onOpenChange={setIsContactDialogOpen}
          title="Warehouse Enquiry"
          description={`Enquire about "${warehouse.title}" in ${warehouse.location}`}
          successMessage="Your enquiry has been raised. We will reach out to you within 2 hours."
        />
      </CardFooter>
    </Card>
  );
};

const ListingsSection = () => {
  return (
    <section id="listings" className="section-container bg-gray-50">
      <h2 className="section-title">Featured Warehouse Spaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {warehouseData.map(warehouse => (
          <WarehouseCard key={warehouse.id} warehouse={warehouse} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Button className="btn-primary">View All Listings</Button>
      </div>
    </section>
  );
};

export default ListingsSection;
