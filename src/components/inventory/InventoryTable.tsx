import React from 'react';
import { InventoryItem } from './types';
import InventoryRow from './InventoryRow';

interface InventoryTableProps {
  inventory: InventoryItem[];
  loading: boolean;
  expandedRows: Set<number>;
  onToggleRow: (id: number) => void;
  onDeleteItem?: (id: number) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  loading,
  expandedRows,
  onToggleRow,
  onDeleteItem,
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
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product Category
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Item Category
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sub Category
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Model Number
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                HSN Code
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Current Stock
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

