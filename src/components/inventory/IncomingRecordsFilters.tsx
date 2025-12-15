import React from 'react';
import DateFilter from './DateFilter';

interface IncomingRecordsFiltersProps {
  vendor: string;
  status: string;
  datePreset: string;
  customDateFrom: string;
  customDateTo: string;
  showCustomDatePicker: boolean;
  vendors: any[];
  onVendorChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDatePresetChange: (preset: string) => void;
  onCustomDateFromChange: (date: string) => void;
  onCustomDateToChange: (date: string) => void;
  onClearDateFilter: () => void;
}

const IncomingRecordsFilters: React.FC<IncomingRecordsFiltersProps> = ({
  vendor,
  status,
  datePreset,
  customDateFrom,
  customDateTo,
  showCustomDatePicker,
  vendors,
  onVendorChange,
  onStatusChange,
  onDatePresetChange,
  onCustomDateFromChange,
  onCustomDateToChange,
  onClearDateFilter,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
          <select
            value={vendor}
            onChange={(e) => onVendorChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <DateFilter
        datePreset={datePreset}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        showCustomDatePicker={showCustomDatePicker}
        onDatePresetChange={onDatePresetChange}
        onCustomDateFromChange={onCustomDateFromChange}
        onCustomDateToChange={onCustomDateToChange}
        onClear={onClearDateFilter}
      />
    </div>
  );
};

export default IncomingRecordsFilters;

