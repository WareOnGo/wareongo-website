
import React, { useState } from 'react';
import { MapPin, Ruler, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ContactFormDialog from "@/components/ContactFormDialog";

const warehouseData = [
  {
    id: 1,
    title: "Bidadi Warehouse",
    location: "Ramnagara, KA",
    size: "54,500 sq ft",
    ceiling: "36 ft",
    price: "25 per sq ft",
    features: ["Turbo Ventilated", "6 loading docks", "63HP Power"],
    image: "/lovable-uploads/a80e2fc8-6c6a-479a-88d0-9f01db40d62a.png"
  },
  {
    id: 2,
    title: "Dankuni Warehouse",
    location: "Kolkata, WB",
    size: "85,000 sq ft",
    ceiling: "34 ft",
    price: "24 per sq ft",
    features: ["Mezzanine Office Floor", "12 loading docks", "Sprinkler system"],
    image: "/lovable-uploads/fc79915f-546e-49ab-81a7-5649717e13d4.png"
  },
  {
    id: 3,
    title: "Bhankrota Warehouse",
    location: "Jaipur, RJ",
    size: "60,000 sq ft",
    ceiling: "36 ft",
    price: "22 per sq ft",
    features: ["3 Acre Extension Availability", "12 loading docks", "Staff Residential Quarters"],
    image: "/lovable-uploads/d24d4a73-fa36-4aa9-9357-7cf182ccbd65.png"
  }
];

const WarehouseCard = ({ warehouse }: { warehouse: typeof warehouseData[0] }) => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="h-48 rounded-md mb-4 overflow-hidden">
          <AspectRatio ratio={16/9} className="h-full">
            <img 
              src={warehouse.image} 
              alt={warehouse.title} 
              className="h-full w-full object-cover"
            />
          </AspectRatio>
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
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  return (
    <section id="listings" className="section-container bg-gray-50">
      <h2 className="section-title">Featured Warehouse Spaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {warehouseData.map(warehouse => (
          <WarehouseCard key={warehouse.id} warehouse={warehouse} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Button className="btn-primary" onClick={() => setIsContactDialogOpen(true)}>
          View All Listings
        </Button>
        
        <ContactFormDialog
          open={isContactDialogOpen}
          onOpenChange={setIsContactDialogOpen}
          title="Request Full Warehouse Listings"
          description="Share your details to get access to our complete warehouse inventory"
          successMessage="Thank you! Our team will send you the complete listings within 2 hours."
        />
      </div>
    </section>
  );
};

export default ListingsSection;
