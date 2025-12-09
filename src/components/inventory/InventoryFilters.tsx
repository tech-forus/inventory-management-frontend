import React from 'react';
import { Download, ChevronDown } from 'lucide-react';
import DateFilter from './DateFilter';

interface InventoryFiltersProps {
  search: string;
  productCategory: string;
  itemCategory: string;
  subCategory: string;
  brand: string;
  stockStatus: string;
  datePreset: string;
  customDateFrom: string;
  customDateTo: string;
  showCustomDatePicker: boolean;
  productCategories: any[];
  itemCategories: any[];
  subCategories: any[];
  brands: any[];
  onSearchChange: (value: string) => void;
  onProductCategoryChange: (value: string) => void;
  onItemCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onDatePresetChange: (preset: string) => void;
  onCustomDateFromChange: (date: string) => void;
  onCustomDateToChange: (date: string) => void;
  onClearDateFilter: () => void;
  showExportDropdown?: boolean;
  onExportDropdownToggle?: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
  exportDropdownRef?: React.RefObject<HTMLDivElement>;
  loading?: boolean;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search,
  productCategory,
  itemCategory,
  subCategory,
  brand,
  stockStatus,
  datePreset,
  customDateFrom,
  customDateTo,
  showCustomDatePicker,
  productCategories,
  itemCategories,
  subCategories,
  brands,
  onSearchChange,
  onProductCategoryChange,
  onItemCategoryChange,
  onSubCategoryChange,
  onBrandChange,
  onStockStatusChange,
  onDatePresetChange,
  onCustomDateFromChange,
  onCustomDateToChange,
  onClearDateFilter,
  showExportDropdown = false,
  onExportDropdownToggle,
  onExportPDF,
  onExportExcel,
  onExportCSV,
  exportDropdownRef,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search SKU ID, Item Name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="w-full sm:w-auto lg:w-48">
          <select
            value={productCategory}
            onChange={(e) => onProductCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Product Categories</option>
            {productCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto lg:w-48">
          <select
            value={itemCategory}
            onChange={(e) => onItemCategoryChange(e.target.value)}
            disabled={!productCategory}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm"
          >
            <option value="">All Item Categories</option>
            {itemCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto lg:w-40">
          <select
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto lg:w-40">
          <select
            value={stockStatus}
            onChange={(e) => onStockStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        {onExportDropdownToggle && (
          <div className="relative w-full sm:w-auto" ref={exportDropdownRef}>
            <button
              onClick={onExportDropdownToggle}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={onExportPDF}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg disabled:opacity-50"
                >
                  PDF
                </button>
                <button
                  onClick={onExportExcel}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  XLSX
                </button>
                <button
                  onClick={onExportCSV}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg disabled:opacity-50"
                >
                  CSV
                </button>
              </div>
            )}
          </div>
        )}
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

export default InventoryFilters;

