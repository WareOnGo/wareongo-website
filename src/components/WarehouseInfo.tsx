import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
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
  const { infrastructure, compliance, features } = specifications;

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
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Warehouse className="w-4 h-4 text-wareongo-blue inline mr-2" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Warehouse Type: </span>
                <span className="text-sm font-semibold text-wareongo-charcoal">{infrastructure.type}</span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <Layers className="w-4 h-4 text-wareongo-blue inline mr-2" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Number of Docks: </span>
                <span className="text-sm font-semibold text-wareongo-charcoal">{infrastructure.numberOfDocks}</span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <Building2 className="w-4 h-4 text-wareongo-blue inline mr-2" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Clear Height: </span>
                <span className="text-sm font-semibold text-wareongo-charcoal">{infrastructure.clearHeight}</span>
              </div>
            </div>
          </div>
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