import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Trash2, ChevronLeft, ChevronRight, Calendar, ArrowUp, ArrowDown, ChevronsDown } from 'lucide-react';
import { skuService } from '../services/skuService';
import { libraryService } from '../services/libraryService';
import { formatCurrency, formatNumber, getDateRange } from '../utils/formatters';
import { exportToExcel, formatDateRange } from '../utils/reportExporter';

interface SKU {
  id: number;
  skuId: string;
  productCategory: string;
  itemCategory: string;
  subCategory?: string;
  itemName: string;
  brand: string;
  vendor: string;
  model?: string;
  hsnSacCode?: string;
  ratingSize?: string;
  series?: string;
  unit?: string;
  currentStock: number;
  minStock: number;
  minStockLevel?: number;
  totalStocks?: number;
  bookStocks?: number;
  shortStocks?: number;
  usefulStocks?: number;
  // Optional specifications
  material?: string;
  insulation?: string;
  inputSupply?: string;
  color?: string;
  cri?: string;
  cct?: string;
  beamAngle?: string;
  ledType?: string;
  shape?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  defaultStorageLocation?: string;
  itemDetails?: string;
  vendorItemCode?: string;
}

const SKUManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Filters
  const [search, setSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  
  // Date filters
  const [datePreset, setDatePreset] = useState<string>('');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dropdown data
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSKUs();
  }, [currentPage, search, productCategory, itemCategory, subCategory, brand, stockStatus, datePreset, customDateFrom, customDateTo, sortBy, sortOrder]);

  useEffect(() => {
    if (productCategory) {
      loadItemCategories(parseInt(productCategory));
    } else {
      setItemCategories([]);
      setItemCategory('');
      setSubCategory('');
      setSubCategories([]);
    }
  }, [productCategory]);

  useEffect(() => {
    if (itemCategory) {
      loadSubCategories(parseInt(itemCategory));
    } else {
      setSubCategories([]);
      setSubCategory('');
    }
  }, [itemCategory]);

  const loadInitialData = async () => {
    try {
      const [productCats, brandsData] = await Promise.all([
        libraryService.getProductCategories(),
        libraryService.getBrands(),
      ]);
      setProductCategories(productCats.data || []);
      setBrands(brandsData.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadItemCategories = async (productCategoryId: number) => {
    try {
      const response = await libraryService.getYourItemCategories(productCategoryId);
      setItemCategories(response.data || []);
    } catch (error) {
      console.error('Error loading item categories:', error);
    }
  };

  const loadSubCategories = async (itemCategoryId: number) => {
    try {
      const response = await libraryService.getYourSubCategories(itemCategoryId);
      setSubCategories(response.data || []);
    } catch (error) {
      console.error('Error loading sub categories:', error);
    }
  };

  const loadSKUs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (search) params.search = search;
      if (productCategory) params.productCategory = productCategory;
      if (itemCategory) params.itemCategory = itemCategory;
      if (subCategory) params.subCategory = subCategory;
      if (brand) params.brand = brand;
      if (stockStatus !== 'all') params.stockStatus = stockStatus;

      // Handle date filters
      if (datePreset === 'custom') {
        if (customDateFrom) params.dateFrom = customDateFrom;
        if (customDateTo) params.dateTo = customDateTo;
      } else if (datePreset) {
        const dateRange = getDateRange(datePreset);
        if (dateRange) {
          params.dateFrom = dateRange.dateFrom;
          params.dateTo = dateRange.dateTo;
        }
      }

      // Handle sorting
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }

      const response = await skuService.getAll(params);
      let skuData = response.data || [];
      
      // Client-side sorting as fallback if backend doesn't support it
      if (sortBy && skuData.length > 0) {
        skuData = [...skuData].sort((a, b) => {
          let aValue: any;
          let bValue: any;
          
          switch (sortBy) {
            case 'itemName':
              aValue = a.itemName?.toLowerCase() || '';
              bValue = b.itemName?.toLowerCase() || '';
              break;
            case 'brand':
              aValue = a.brand?.toLowerCase() || '';
              bValue = b.brand?.toLowerCase() || '';
              break;
            case 'totalStocks':
              aValue = a.totalStocks ?? a.currentStock ?? 0;
              bValue = b.totalStocks ?? b.currentStock ?? 0;
              break;
            case 'bookStocks':
              aValue = a.bookStocks ?? 0;
              bValue = b.bookStocks ?? 0;
              break;
            case 'shortStocks':
              aValue = a.shortStocks ?? 0;
              bValue = b.shortStocks ?? 0;
              break;
            case 'usefulStocks':
              const aTotal = a.totalStocks ?? a.currentStock ?? 0;
              const aBook = a.bookStocks ?? 0;
              const bTotal = b.totalStocks ?? b.currentStock ?? 0;
              const bBook = b.bookStocks ?? 0;
              aValue = a.usefulStocks ?? (aTotal - aBook);
              bValue = b.usefulStocks ?? (bTotal - bBook);
              break;
            default:
              return 0;
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else {
            return sortOrder === 'asc' 
              ? (aValue as number) - (bValue as number)
              : (bValue as number) - (aValue as number);
          }
        });
      }
      
      setSkus(skuData);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Error loading SKUs:', error);
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setCustomDateFrom('');
      setCustomDateTo('');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this SKU?')) return;
    try {
      await skuService.delete(id);
      loadSKUs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete SKU');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} SKU(s)?`)) return;
    try {
      await Promise.all(selectedRows.map(id => skuService.delete(id)));
      setSelectedRows([]);
      loadSKUs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete SKUs');
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Fetch all SKUs for export (not just current page)
      const params: any = {
        page: 1,
        limit: 10000, // Large limit to get all SKUs
      };
      if (search) params.search = search;
      if (productCategory) params.productCategory = productCategory;
      if (itemCategory) params.itemCategory = itemCategory;
      if (subCategory) params.subCategory = subCategory;
      if (brand) params.brand = brand;
      if (stockStatus !== 'all') params.stockStatus = stockStatus;

      // Handle date filters
      if (datePreset === 'custom') {
        if (customDateFrom) params.dateFrom = customDateFrom;
        if (customDateTo) params.dateTo = customDateTo;
      } else if (datePreset) {
        const dateRange = getDateRange(datePreset);
        if (dateRange) {
          params.dateFrom = dateRange.dateFrom;
          params.dateTo = dateRange.dateTo;
        }
      }

      const response = await skuService.getAll(params);
      const allSkus = response.data || [];

      // Prepare headers
      const headers = [
        'SKU ID',
        'Item Name',
        'Model Number',
        'HSN Code',
        'Brand',
        'Product Category',
        'Item Category',
        'Sub Category',
        'Vendor',
        'Current Stock',
        'Minimum Stock',
        'Available Stocks',
        'Total Stocks',
        'Book Stocks',
        'Short Stocks',
        'Status'
      ];

      // Prepare rows
      const rows = allSkus.map((sku: SKU) => {
        const totalStocks = sku.totalStocks ?? sku.currentStock ?? 0;
        const bookStocks = sku.bookStocks ?? 0;
        const availableStocks = sku.usefulStocks ?? (totalStocks - bookStocks);
        const currentStock = sku.currentStock ?? 0;
        const minStock = sku.minStock ?? 0;
        
        let status = 'In Stock';
        if (currentStock === 0) {
          status = 'Out of Stock';
        } else if (currentStock <= minStock) {
          status = 'Low Stock';
        }

        return [
          sku.skuId || '-',
          sku.itemName || '-',
          sku.model || '-',
          sku.hsnSacCode || '-',
          sku.brand || '-',
          sku.productCategory || '-',
          sku.itemCategory || '-',
          sku.subCategory || '-',
          sku.vendor || '-',
          formatNumber(currentStock),
          formatNumber(minStock),
          formatNumber(availableStocks),
          formatNumber(totalStocks),
          formatNumber(bookStocks),
          formatNumber(sku.shortStocks ?? 0),
          status
        ];
      });

      // Prepare date range string
      let dateRangeStr = '';
      if (datePreset === 'custom' && (customDateFrom || customDateTo)) {
        dateRangeStr = formatDateRange(customDateFrom, customDateTo);
      } else if (datePreset) {
        const dateRange = getDateRange(datePreset);
        if (dateRange) {
          dateRangeStr = formatDateRange(dateRange.dateFrom, dateRange.dateTo);
        }
      }

      // Export to Excel
      await exportToExcel({
        title: 'SKU Management Report',
        headers,
        rows,
        dateRange: dateRangeStr || undefined,
      });
    } catch (error) {
      console.error('Error exporting SKUs:', error);
      alert('Failed to export SKUs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (current: number, min: number): string => {
    if (current > min) return 'text-green-600 font-semibold';
    if (current === min) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const getStockStatus = (currentStock: number, minStock: number): { label: string; color: string; bgColor: string } => {
    if (currentStock === 0) {
      return {
        label: 'Out of Stock',
        color: 'text-red-700',
        bgColor: 'bg-red-100'
      };
    } else if (currentStock <= minStock) {
      return {
        label: 'Low Stock',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100'
      };
    } else {
      return {
        label: 'In Stock',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      };
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with ascending order
      setSortBy(field);
      setSortOrder('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return (
        <span className="inline-flex flex-col ml-1 text-gray-400">
          <ArrowUp className="w-3 h-3 -mb-0.5" />
          <ArrowDown className="w-3 h-3" />
        </span>
      );
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 space-y-4" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Bar */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search SKU ID, Item Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Product Category */}
          <div className="w-full lg:w-48">
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Product Categories</option>
              {productCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Item Category */}
          <div className="w-full lg:w-48">
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              disabled={!productCategory}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Item Categories</option>
              {itemCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sub Category */}
          <div className="w-full lg:w-48">
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={!itemCategory}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Sub Categories</option>
              {subCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Brand */}
          <div className="w-full lg:w-48">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Stock Status */}
          <div className="w-full lg:w-40">
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
            </div>
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="From Date"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="To Date"
                />
                <button
                  onClick={() => {
                    setDatePreset('');
                    setCustomDateFrom('');
                    setCustomDateTo('');
                    setShowCustomDatePicker(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedRows.length} item(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SKU ID
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('itemName')}
                >
                  <div className="flex items-center justify-center">
                  Item Name
                    <SortIcon field="itemName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Model Number
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  HSN Code
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('brand')}
                >
                  <div className="flex items-center justify-center">
                  Brand
                    <SortIcon field="brand" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('usefulStocks')}
                >
                  <div className="flex items-center justify-center">
                    Available Stocks
                    <SortIcon field="usefulStocks" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : skus.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No SKUs found
                  </td>
                </tr>
              ) : (
                skus.map((sku) => {
                  // Calculate available stocks (useful stocks = total - book)
                  const totalStocks = sku.totalStocks ?? sku.currentStock ?? 0;
                  const bookStocks = sku.bookStocks ?? 0;
                  const availableStocks = sku.usefulStocks ?? (totalStocks - bookStocks);
                  const currentStock = sku.currentStock ?? 0;
                  const minStock = sku.minStock ?? 0;
                  const stockStatus = getStockStatus(currentStock, minStock);
                  const isExpanded = expandedRows.has(sku.id);
                  
                  const toggleRow = () => {
                    const newExpanded = new Set(expandedRows);
                    if (newExpanded.has(sku.id)) {
                      newExpanded.delete(sku.id);
                    } else {
                      newExpanded.add(sku.id);
                    }
                    setExpandedRows(newExpanded);
                  };
                  
                  return (
                    <React.Fragment key={sku.id}>
                      <tr className="hover:bg-gray-50">
                        <td 
                          className="px-4 py-3 text-sm font-medium text-gray-900 text-center cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={toggleRow}
                          title="Click to view details"
                        >
                          {sku.skuId}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{sku.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{sku.model || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{sku.hsnSacCode || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{sku.brand}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600 text-center">
                          {formatNumber(availableStocks)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.bgColor} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="space-y-4">
                              {/* Product Specifications */}
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {sku.ratingSize && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating/Size</span>
                                      <p className="text-sm text-gray-900 mt-1">{sku.ratingSize}</p>
                              </div>
                                  )}
                                  {sku.model && (
                              <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model</span>
                                      <p className="text-sm text-gray-900 mt-1">{sku.model}</p>
                              </div>
                                  )}
                                  {sku.series && (
                                <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Series</span>
                                      <p className="text-sm text-gray-900 mt-1">{sku.series}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Optional Specifications Dropdown */}
                              {(sku.material || sku.insulation || sku.inputSupply || sku.color || sku.cri || sku.cct ||
                                sku.beamAngle || sku.ledType || sku.shape ||
                                (sku.weight !== undefined && sku.weight !== null && sku.weight !== 0) ||
                                (sku.length !== undefined && sku.length !== null && sku.length !== 0) ||
                                (sku.width !== undefined && sku.width !== null && sku.width !== 0) ||
                                (sku.height !== undefined && sku.height !== null && sku.height !== 0)) && (
                              <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  <span>Optional Specifications</span>
                                  <ChevronsDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                    {/* Optional Specifications - Only show fields with values */}
                                    {sku.material && (
                                      <div>
                                        <span className="font-medium text-gray-700">Material:</span>
                                        <p className="text-gray-600">{sku.material}</p>
                                      </div>
                                    )}
                                    {sku.insulation && (
                                      <div>
                                        <span className="font-medium text-gray-700">Insulation:</span>
                                        <p className="text-gray-600">{sku.insulation}</p>
                                      </div>
                                    )}
                                    {sku.inputSupply && (
                                      <div>
                                        <span className="font-medium text-gray-700">Input Supply:</span>
                                        <p className="text-gray-600">{sku.inputSupply}</p>
                                      </div>
                                    )}
                                    {sku.color && (
                                      <div>
                                        <span className="font-medium text-gray-700">Color:</span>
                                        <p className="text-gray-600">{sku.color}</p>
                                      </div>
                                    )}
                                    {sku.cri && (
                                      <div>
                                        <span className="font-medium text-gray-700">CRI:</span>
                                        <p className="text-gray-600">{sku.cri}</p>
                                      </div>
                                    )}
                                    {sku.cct && (
                                      <div>
                                        <span className="font-medium text-gray-700">CCT:</span>
                                        <p className="text-gray-600">{sku.cct}</p>
                                      </div>
                                    )}
                                    {sku.beamAngle && (
                                      <div>
                                        <span className="font-medium text-gray-700">Beam Angle:</span>
                                        <p className="text-gray-600">{sku.beamAngle}</p>
                                      </div>
                                    )}
                                    {sku.ledType && (
                                      <div>
                                        <span className="font-medium text-gray-700">LED Type:</span>
                                        <p className="text-gray-600">{sku.ledType}</p>
                                      </div>
                                    )}
                                    {sku.shape && (
                                      <div>
                                        <span className="font-medium text-gray-700">Shape:</span>
                                        <p className="text-gray-600">{sku.shape}</p>
                                      </div>
                                    )}
                                    {sku.weight !== undefined && sku.weight !== null && sku.weight !== 0 && (
                                      <div>
                                        <span className="font-medium text-gray-700">Weight (Kg):</span>
                                        <p className="text-gray-600">{formatNumber(sku.weight)}</p>
                                      </div>
                                    )}
                                    {sku.length !== undefined && sku.length !== null && sku.length !== 0 && (
                                      <div>
                                        <span className="font-medium text-gray-700">Length (mm):</span>
                                        <p className="text-gray-600">{formatNumber(sku.length)}</p>
                                      </div>
                                    )}
                                    {sku.width !== undefined && sku.width !== null && sku.width !== 0 && (
                                      <div>
                                        <span className="font-medium text-gray-700">Width (mm):</span>
                                        <p className="text-gray-600">{formatNumber(sku.width)}</p>
                                      </div>
                                    )}
                                    {sku.height !== undefined && sku.height !== null && sku.height !== 0 && (
                                <div>
                                        <span className="font-medium text-gray-700">Height (mm):</span>
                                        <p className="text-gray-600">{formatNumber(sku.height)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </details>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SKUManagementPage;

