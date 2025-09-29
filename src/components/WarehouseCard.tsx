import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Ruler, Building2, IndianRupee, ImageIcon, ShieldCheck } from 'lucide-react';

interface WarehouseCardProps {
  id: number;
  image?: string | null;
  address: string;
  location: {
    city: string;
    state: string;
  };
  size: number;
  ceilingHeight: number;
  price: number;
  fireCompliance: boolean;
  features: string[];
  onClick?: () => void;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  id,
  image,
  address,
  location,
  size,
  ceilingHeight,
  price,
  fireCompliance,
  features,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);

  // Truncate address if too long
  const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

  return (
    <Card
      className="cursor-pointer hover:shadow-2xl transition-shadow duration-300 overflow-hidden group border border-gray-200 rounded-xl bg-white"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        {imageError || !image ? (
          <div className="w-full h-48 bg-gray-200 flex flex-col items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 text-center px-2">
              Images available on request
            </span>
          </div>
        ) : (
          <img
            src={image}
            alt={`Warehouse ${id}`}
            className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute top-3 right-3 bg-wareongo-blue text-white px-2 py-1 rounded text-xs font-semibold shadow">
          ID: {id}
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title & Address */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={address}>
            {truncate(address, 36)}
          </h2>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>{location.city}, {location.state}</span>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center text-gray-600 text-xs">
            <Ruler className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>{size.toLocaleString()} sqft</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <Building2 className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>{ceilingHeight}m height</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <ShieldCheck className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>Fire Compliance: {fireCompliance ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center text-wareongo-blue font-semibold text-xs">
            <IndianRupee className="w-4 h-4 mr-1" />
            <span>{price} per sqft</span>
          </div>
        </div>

        {/* Features as bullet points */}
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-800 mb-1">Key Features</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            {features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseCard;
