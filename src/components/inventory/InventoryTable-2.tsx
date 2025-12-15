import React from 'react';
import { InventoryItem } from './types';
import InventoryRow from './InventoryRow';

interface InventoryTableProps {
  inventory: InventoryItem[];
  loading: boolean;
  expandedRows: Set<number>;
  onToggleRow: (id: number) => void;
  onDeleteItem?: (id: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  SortIcon?: ({ field }: { field: string }) => React.ReactNode;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  loading,
  expandedRows,
  onToggleRow,
  onDeleteItem,
  sortBy,
  sortOrder,
  onSort,
  SortIcon,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-10"></th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                SKU ID
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('productCategory')}
              >
                <div className="flex items-center justify-center">
                  Product Category
                  {SortIcon && <SortIcon field="productCategory" />}
                </div>
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('itemCategory')}
              >
                <div className="flex items-center justify-center">
                  Item Category
                  {SortIcon && <SortIcon field="itemCategory" />}
                </div>
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('subCategory')}
              >
                <div className="flex items-center justify-center">
                  Sub Category
                  {SortIcon && <SortIcon field="subCategory" />}
                </div>
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('itemName')}
              >
                <div className="flex items-center justify-center">
                  Item Name
                  {SortIcon && <SortIcon field="itemName" />}
                </div>
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('brand')}
              >
                <div className="flex items-center justify-center">
                  Brand
                  {SortIcon && <SortIcon field="brand" />}
                </div>
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('vendor')}
              >
                <div className="flex items-center justify-center">
                  Vendor
                  {SortIcon && <SortIcon field="vendor" />}
                </div>
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Model Number
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                HSN Code
              </th>
              <th 
                className={`px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('currentStock')}
              >
                <div className="flex items-center justify-center">
                  Current Stock
                  {SortIcon && <SortIcon field="currentStock" />}
                </div>
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={12} className="px-3 py-6 text-center text-gray-500 text-xs">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-6 text-center text-gray-500 text-xs">
                  No inventory items found
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  isExpanded={expandedRows.has(item.id)}
                  onToggle={() => onToggleRow(item.id)}
                  onDelete={onDeleteItem ? () => onDeleteItem(item.id) : undefined}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;

