import React from 'react';
import DateFilter from './DateFilter';

interface OutgoingRecordsFiltersProps {
  destination: string;
  status: string;
  datePreset: string;
  customDateFrom: string;
  customDateTo: string;
  showCustomDatePicker: boolean;
  customers: any[];
  vendors: any[];
  onDestinationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDatePresetChange: (preset: string) => void;
  onCustomDateFromChange: (date: string) => void;
  onCustomDateToChange: (date: string) => void;
  onClearDateFilter: () => void;
}

const OutgoingRecordsFilters: React.FC<OutgoingRecordsFiltersProps> = ({
  destination,
  status,
  datePreset,
  customDateFrom,
  customDateTo,
  showCustomDatePicker,
  customers,
  vendors,
  onDestinationChange,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Search customer/vendor"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
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

export default OutgoingRecordsFilters;






