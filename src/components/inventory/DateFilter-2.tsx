import React from 'react';
import { Calendar } from 'lucide-react';
import { getDateRange } from '../../utils/formatters';

interface DateFilterProps {
  datePreset: string;
  customDateFrom: string;
  customDateTo: string;
  showCustomDatePicker: boolean;
  onDatePresetChange: (preset: string) => void;
  onCustomDateFromChange: (date: string) => void;
  onCustomDateToChange: (date: string) => void;
  onClear: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  datePreset,
  customDateFrom,
  customDateTo,
  showCustomDatePicker,
  onDatePresetChange,
  onCustomDateFromChange,
  onCustomDateToChange,
  onClear,
}) => {
  const handlePresetChange = (preset: string) => {
    onDatePresetChange(preset);
    if (preset === 'custom') {
      // Custom date picker will be shown
    } else {
      onClear();
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
        </div>
        <select
          value={datePreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Dates</option>
          <option value="1month">1 Month</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="1year">1 Year</option>
          <option value="thisFinancialYear">This Financial Year</option>
          <option value="previousFinancialYear">Previous Financial Year</option>
          <option value="custom">Custom Date Range</option>
        </select>
        
        {showCustomDatePicker && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => onCustomDateFromChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="From Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => onCustomDateToChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="To Date"
            />
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;

