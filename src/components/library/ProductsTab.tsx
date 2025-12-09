import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, Upload, Download } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { formatNumber } from '../../utils/formatters';
import * as XLSX from 'xlsx';

interface Product {
  id: number;
  skuId: string;
  itemName: string;
  productCategory?: string;
  itemCategory?: string;
  subCategory?: string;
  brand?: string;
  vendor?: string;
  model?: string;
  hsnSacCode?: string;
  currentStock: number;
  minStock: number;
  ratingSize?: string;
  series?: string;
  unit?: string;
}

interface ProductsTabProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setSaving(true);
      await skuService.delete(id);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    // Create template data with empty fields for user input
    // Note: SKU ID will be auto-generated - DO NOT include it in the Excel file
    // All fields are empty except for default values where applicable
    
    // Template constants for default values
    const DEFAULT_UNIT = 'PCS';
    const DEFAULT_STATUS = 'active';
    
    // Template row with empty fields - users should fill in actual values
    const templateData = [
      {
        'Item Name': '',
        'Product Category': '',
        'Item Category': '',
        'Sub Category': '',
        'Vendor': '',
        'Brand': '',
        'Unit': DEFAULT_UNIT,
        'HSN Code': '',
        'Model': '',
        'Series': '',
        'Rating Size': '',
        'Material': '',
        'Insulation': '',
        'Input Supply': '',
        'Color': '',
        'CRI': '',
        'CCT': '',
        'Beam Angle': '',
        'LED Type': '',
        'Shape': '',
        'Weight': '',
        'Length': '',
        'Width': '',
        'Height': '',
        'currentStock': '', // Replaces 'Min Stock Level'
        'MinimumStocks': '', // Replaces 'Reorder Point'
        'Default Storage Location': '',
        'Item Details': '',
        'Vendor Item Code': '',
        'Status': DEFAULT_STATUS
      }
    ];

    // Template configuration constants
    const TEMPLATE_SHEET_NAME = 'Products Template';
    const TEMPLATE_FILENAME = 'Product_Upload_Template.xlsx';
    
    // Column width configuration
    const COLUMN_WIDTHS = [
      { wch: 25 }, // Item Name
      { wch: 20 }, // Product Category
      { wch: 20 }, // Item Category
      { wch: 20 }, // Sub Category
      { wch: 20 }, // Vendor
      { wch: 20 }, // Brand
      { wch: 10 }, // Unit
      { wch: 15 }, // HSN Code
      { wch: 15 }, // Model
      { wch: 15 }, // Series
      { wch: 15 }, // Rating/Size
      { wch: 15 }, // Material
      { wch: 15 }, // Insulation
      { wch: 15 }, // Input Supply
      { wch: 10 }, // Color
      { wch: 10 }, // CRI
      { wch: 10 }, // CCT
      { wch: 12 }, // Beam Angle
      { wch: 12 }, // LED Type
      { wch: 12 }, // Shape
      { wch: 10 }, // Weight
      { wch: 10 }, // Length
      { wch: 10 }, // Width
      { wch: 10 }, // Height
      { wch: 15 }, // currentStock
      { wch: 15 }, // MinimumStocks
      { wch: 18 }, // Storage Location
      { wch: 30 }, // Item Details
      { wch: 18 }, // Vendor Item Code
      { wch: 12 }, // Status
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    ws['!cols'] = COLUMN_WIDTHS;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, TEMPLATE_SHEET_NAME);

    // Generate Excel file and download
    XLSX.writeFile(wb, TEMPLATE_FILENAME);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    try {
      setUploading(true);
      const result = await skuService.upload(file);
      
      if (result.success) {
        const message = `Uploaded ${result.inserted} products successfully${result.errors > 0 ? `\n${result.errors} errors occurred` : ''}`;
        alert(message);
        
        if (result.errorDetails && result.errorDetails.length > 0) {
          const errorDetails = result.errorDetails.map((err: any) => `Row ${err.row}: ${err.error}`).join('\n');
          console.error('Upload errors:', errorDetails);
        }
        
        // Refresh the products list
        onRefresh();
      } else {
        alert(result.message || 'Failed to upload products');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.skuId?.toLowerCase().includes(search.toLowerCase()) ||
    p.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.model?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/sku/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New SKU
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              title="Download Excel template with required columns"
            >
              <Download className="w-5 h-5" />
              Download Template
            </button>
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload Excel'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SKU ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">HSN Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">No products found</td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.skuId}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.itemName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.productCategory || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.itemCategory || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.brand || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.vendor || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.model || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.hsnSacCode || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(product.currentStock || 0)}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => window.location.href = `/app/sku/${product.id}`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsTab;
