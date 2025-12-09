import React from 'react';
import { ChevronDown, ChevronUp, Eye, Trash2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber, formatDate } from '../../utils/formatters';
import { InventoryItem } from './types';

interface InventoryRowProps {
  item: InventoryItem;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

const InventoryRow: React.FC<InventoryRowProps> = ({ item, isExpanded, onToggle, onDelete }) => {
  const navigate = useNavigate();

  const getStockColor = (current: number, min: number): string => {
    return 'text-green-600 font-semibold';
  };

  const getStockBadge = (current: number, min: number) => {
    if (current < min) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Low Stock</span>;
    }
    if (current === 0) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">Out of Stock</span>;
    }
    return null;
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-center">
          <button
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </td>
        <td className="px-3 py-2 text-xs font-medium text-gray-900 text-center">{item.skuId}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.productCategory}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.itemCategory}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.subCategory || '-'}</td>
        <td className="px-3 py-2 text-xs text-gray-900 text-center">{item.itemName}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.brand}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.vendor}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.model || '-'}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-center">{item.hsnSacCode || '-'}</td>
        <td className="px-3 py-2 text-xs text-center">
          <div className="flex items-center justify-center gap-2">
            <span className={`${getStockColor(item.currentStock, item.minStock)} text-sm font-bold`}>
              {formatNumber(item.currentStock)}
            </span>
            {getStockBadge(item.currentStock, item.minStock)}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/app/sku/${item.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
              disabled={!onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/app/inventory/${item.id}/history`)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={12} className="px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Item Details:</span>
                <p className="text-gray-600">{item.itemDetails || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Vendor Item Code:</span>
                <p className="text-gray-600">{item.vendorItemCode || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Rating/Size:</span>
                <p className="text-gray-600">{item.ratingSize || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Model:</span>
                <p className="text-gray-600">{item.model || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Series:</span>
                <p className="text-gray-600">{item.series || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">HSN/SAC Code:</span>
                <p className="text-gray-600">{item.hsnSacCode || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Unit:</span>
                <p className="text-gray-600">{item.unit}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Minimum Stock Level:</span>
                <p className="text-gray-600">{item.minStock || '-'}</p>
              </div>
              {(item.material || item.color || item.weight) && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Material:</span>
                    <p className="text-gray-600">{item.material || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Color:</span>
                    <p className="text-gray-600">{item.color || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Weight:</span>
                    <p className="text-gray-600">{item.weight ? `${item.weight} Kg` : '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <p className="text-gray-600">
                      {item.length && item.width && item.height
                        ? `${item.length} × ${item.width} × ${item.height} mm`
                        : '-'}
                    </p>
                  </div>
                </>
              )}
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <p className="text-gray-600">{formatDate(item.lastUpdated)}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default InventoryRow;

