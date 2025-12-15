import React from 'react';
import { formatNumber } from '../../utils/formatters';

interface StockHealthCardProps {
  nonMovable: number;
  slowSKUs: number;
  nonMovablePeriod: number;
  slowSKUsPeriod: number;
  onNonMovablePeriodChange: (period: number) => void;
  onSlowSKUsPeriodChange: (period: number) => void;
  onNonMovableClick?: () => void;
  onSlowSKUsClick?: () => void;
  loading?: boolean;
}

const StockHealthCard: React.FC<StockHealthCardProps> = ({
  nonMovable,
  slowSKUs,
  nonMovablePeriod,
  slowSKUsPeriod,
  onNonMovablePeriodChange,
  onSlowSKUsPeriodChange,
  onNonMovableClick,
  onSlowSKUsClick,
  loading = false,
}) => {
  const periods = [3, 6, 12];

  const MetricRow: React.FC<{
    label: string;
    value: number;
    period: number;
    onPeriodChange: (period: number) => void;
    dotColor: string;
    onClick?: () => void;
  }> = ({ label, value, period, onPeriodChange, dotColor, onClick }) => (
    <div
      className={`flex-1 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
        }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${period === p
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {p}M
            </button>
          ))}
        </div>
      </div>
      <div className="ml-4">
        <span className="text-lg font-bold text-gray-900">
          {loading ? (
            <span className="inline-block w-8 h-5 bg-gray-200 rounded animate-pulse"></span>
          ) : (
            formatNumber(value)
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Stock Health</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <MetricRow
          label="Slow SKUs"
          value={slowSKUs}
          period={slowSKUsPeriod}
          onPeriodChange={onSlowSKUsPeriodChange}
          dotColor="bg-yellow-500"
          onClick={onSlowSKUsClick}
        />
        <MetricRow
          label="Non Movable"
          value={nonMovable}
          period={nonMovablePeriod}
          onPeriodChange={onNonMovablePeriodChange}
          dotColor="bg-red-500"
          onClick={onNonMovableClick}
        />
      </div>
    </div>
  );
};

export default StockHealthCard;

