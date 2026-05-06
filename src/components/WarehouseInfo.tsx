import React from 'react';
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

  const getComplianceIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="w-4 h-4 text-wareongo-blue" aria-hidden="true" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />;
    return <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />;
  };

  const getComplianceText = (status: boolean | null) => {
    if (status === true) return 'Available';
    if (status === false) return 'Not available';
    return 'Status unknown';
  };

  const getComplianceBadgeStyle = (status: boolean | null) => {
    if (status === true) return 'border-wareongo-blue/30 bg-wareongo-blue/5 text-wareongo-blue';
    if (status === false) return 'border-red-200 bg-red-50 text-red-600';
    return 'border-amber-200 bg-amber-50 text-amber-700';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Infrastructure Details */}
      <section className="border border-wareongo-blue rounded-2xl p-6 sm:p-8 bg-transparent">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-wareongo-blue" aria-hidden="true" />
          <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium text-wareongo-slate">
            Infrastructure
          </h3>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-wareongo-blue/20 rounded-xl p-4">
            <Warehouse className="w-4 h-4 text-wareongo-blue/70 mb-2" aria-hidden="true" />
            <dt className="text-xs text-wareongo-slate mb-1">Type</dt>
            <dd className="text-sm font-semibold text-wareongo-blue">{infrastructure.type}</dd>
          </div>
          <div className="border border-wareongo-blue/20 rounded-xl p-4">
            <Layers className="w-4 h-4 text-wareongo-blue/70 mb-2" aria-hidden="true" />
            <dt className="text-xs text-wareongo-slate mb-1">Docks</dt>
            <dd className="text-sm font-semibold text-wareongo-blue">{infrastructure.numberOfDocks}</dd>
          </div>
          <div className="border border-wareongo-blue/20 rounded-xl p-4">
            <Building2 className="w-4 h-4 text-wareongo-blue/70 mb-2" aria-hidden="true" />
            <dt className="text-xs text-wareongo-slate mb-1">Clear height</dt>
            <dd className="text-sm font-semibold text-wareongo-blue">{infrastructure.clearHeight}</dd>
          </div>
        </dl>
      </section>

      {/* Compliance & Safety */}
      <section className="border border-wareongo-blue rounded-2xl p-6 sm:p-8 bg-transparent">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-wareongo-blue" aria-hidden="true" />
          <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium text-wareongo-slate">
            Compliance & Safety
          </h3>
        </div>
        <div className="space-y-4">
          {compliance.fireNocAvailable !== null && (
            <div className="flex items-center justify-between gap-2 border border-wareongo-blue/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                {getComplianceIcon(compliance.fireNocAvailable)}
                <span className="text-sm font-medium text-wareongo-blue">Fire NOC</span>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getComplianceBadgeStyle(compliance.fireNocAvailable)}`}
                aria-label={`Fire NOC: ${getComplianceText(compliance.fireNocAvailable)}`}
              >
                {getComplianceText(compliance.fireNocAvailable)}
              </span>
            </div>
          )}

          {compliance.fireSafetyMeasures && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-wareongo-slate mb-2 font-medium">Fire safety measures</p>
              <div className="text-sm text-wareongo-blue border border-wareongo-blue/20 rounded-xl p-4 break-words leading-relaxed">
                {compliance.fireSafetyMeasures}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-wareongo-slate mb-2 font-medium">Regulatory compliances</p>
            <div className="border border-wareongo-blue/20 rounded-xl p-4">
              <ul className="space-y-1.5 text-sm text-wareongo-blue break-words leading-relaxed">
                {compliance.compliances.split(',').map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-wareongo-blue/70 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      {features.length > 0 && (
        <section className="border border-wareongo-blue rounded-2xl p-6 sm:p-8 bg-transparent">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="w-4 h-4 text-wareongo-blue" aria-hidden="true" />
            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium text-wareongo-slate">
              Additional features
            </h3>
          </div>
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            role="list"
            aria-label="Warehouse additional features"
          >
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 border border-wareongo-blue/20 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-wareongo-blue/70 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-wareongo-blue break-words">{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default WarehouseInfo;