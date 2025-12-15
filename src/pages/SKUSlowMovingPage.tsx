import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, Tag } from 'lucide-react';
import { skuService } from '../services/skuService';
import { formatNumber, formatDate } from '../utils/formatters';

interface SlowMovingSKU {
  skuId: string;
  itemName: string;
  category: string;
  currentStock: number;
  unitsSold: number;
  lastSaleDate: string;
  daysSinceLastSale: number;
}

const SKUSlowMovingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skus, setSkus] = useState<SlowMovingSKU[]>([]);
  const [period, setPeriod] = useState(3);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    loadData();
  }, [period, threshold]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await skuService.getSlowMoving({ period, threshold });
      setSkus(response.data || []);
    } catch (error) {
      console.error('Error loading slow moving SKUs:', error);
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/sku')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Slow Moving SKUs</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={0}>Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Movement Threshold (Less than X units sold)
            </label>
            <input
              type="number"
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-32"
              placeholder="5"
            />
          </div>
          <div className="flex-1"></div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SKU ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Units Sold in Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Sale Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Days Since Last Sale
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : skus.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No slow moving SKUs found
                  </td>
                </tr>
              ) : (
                skus.map((sku) => (
                  <tr key={sku.skuId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sku.skuId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{sku.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sku.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      {formatNumber(sku.currentStock)}
                    </td>
                    <td className="px-4 py-3 text-sm text-orange-600 font-semibold">
                      {formatNumber(sku.unitsSold)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(sku.lastSaleDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        {sku.daysSinceLastSale} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Mark for Review
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex items-center gap-1"
                        >
                          <Tag className="w-4 h-4" />
                          Apply Discount
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SKUSlowMovingPage;

