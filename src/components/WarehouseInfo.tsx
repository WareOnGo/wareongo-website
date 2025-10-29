import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Ruler, 
  IndianRupee, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Warehouse,
  Layers
} from 'lucide-react';

interface WarehouseInfoProps {
  specifications: {
    infrastructure: {
      type: string;
      numberOfDocks: string;
      clearHeight: string;
    };
    space: {
      totalSpace: number;
      availableSpaces: number[];
      ratePerSqft: number;
    };
    location: {
      address: string;
      city: string;
      state: string;
      zone: string;
    };
    compliance: {
      fireNocAvailable: boolean | null;
      fireSafetyMeasures: string | null;
      compliances: string;
    };
    features: string[];
  };
}

const WarehouseInfo: React.FC<WarehouseInfoProps> = ({ specifications }) => {
  const { infrastructure, space, compliance, features } = specifications;

  // Helper function to format compliance status
  const getComplianceIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-600" aria-hidden="true" />;
  };

  const getComplianceText = (status: boolean | null) => {
    if (status === true) return 'Available';
    if (status === false) return 'Not Available';
    return 'Status Unknown';
  };

  const getComplianceBadgeVariant = (status: boolean | null) => {
    if (status === true) return 'default';
    if (status === false) return 'destructive';
    return 'secondary';
  };

  const getComplianceAriaLabel = (status: boolean | null, type: string) => {
    const statusText = getComplianceText(status);
    return `${type}: ${statusText}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Infrastructure Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wareongo-charcoal text-lg sm:text-xl">
            <Building2 className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
            Infrastructure Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Warehouse className="w-6 h-6 text-wareongo-blue mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-600 mb-1">Warehouse Type</p>
              <p className="font-semibold text-wareongo-charcoal text-sm break-words">{infrastructure.type}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Layers className="w-6 h-6 text-wareongo-blue mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-600 mb-1">Loading Docks</p>
              <p className="font-semibold text-wareongo-charcoal text-sm break-words">{infrastructure.numberOfDocks}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Ruler className="w-6 h-6 text-wareongo-blue mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-600 mb-1">Clear Height</p>
              <p className="font-semibold text-wareongo-charcoal text-sm break-words">{infrastructure.clearHeight}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Space Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wareongo-charcoal text-lg sm:text-xl">
            <Ruler className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
            Space & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Space and Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-700">Total Space</p>
              </div>
              <p className="text-2xl font-bold text-wareongo-blue">
                {space.totalSpace.toLocaleString()} sqft
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <IndianRupee className="w-5 h-5 text-green-600" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-700">Rate per sqft</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{space.ratePerSqft}
              </p>
            </div>
          </div>
          
          {/* Estimated Cost */}
          {space.totalSpace > 0 && space.ratePerSqft > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Estimated Monthly Cost</p>
                <p className="text-xl font-bold text-wareongo-charcoal">
                  ₹{(space.totalSpace * space.ratePerSqft).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {space.totalSpace.toLocaleString()} sqft × ₹{space.ratePerSqft}
                </p>
              </div>
            </div>
          )}
          
          {/* Additional Spaces */}
          {space.availableSpaces.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Additional Space Options</p>
              <div className="flex flex-wrap gap-2">
                {space.availableSpaces.map((spaceSize, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-3 py-1"
                    aria-label={`Additional space option: ${spaceSize.toLocaleString()} square feet`}
                  >
                    {spaceSize.toLocaleString()} sqft
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Compliance & Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wareongo-charcoal text-lg sm:text-xl">
            <Shield className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
            Compliance & Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            {/* Fire NOC - only show if not null */}
            {compliance.fireNocAvailable !== null && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getComplianceIcon(compliance.fireNocAvailable)}
                  <span className="text-sm font-medium">Fire NOC</span>
                </div>
                <Badge 
                  variant={getComplianceBadgeVariant(compliance.fireNocAvailable)}
                  aria-label={getComplianceAriaLabel(compliance.fireNocAvailable, 'Fire NOC')}
                >
                  {getComplianceText(compliance.fireNocAvailable)}
                </Badge>
              </div>
            )}
            
            {/* Fire Safety Measures */}
            {compliance.fireSafetyMeasures && (
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Fire Safety Measures</p>
                <div className="text-sm text-wareongo-charcoal bg-gray-50 p-3 rounded-lg break-words">
                  {compliance.fireSafetyMeasures}
                </div>
              </div>
            )}
            
            {/* General Compliances */}
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Regulatory Compliances</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-wareongo-charcoal break-words leading-relaxed">
                  {compliance.compliances.split(',').map((item, index) => (
                    <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-1" aria-hidden="true" />
                      <span>{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      {features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-wareongo-charcoal text-lg sm:text-xl">
              <CheckCircle className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
              Additional Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              role="list"
              aria-label="Warehouse additional features"
            >
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-wareongo-charcoal break-words">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WarehouseInfo;