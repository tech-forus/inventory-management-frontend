import React from 'react';
import { Plus } from 'lucide-react';
import { InvoiceItem } from './types';
import ItemRow from './ItemRow';

interface ItemDetailsSectionProps {
  items: InvoiceItem[];
  skus: any[];
  isAdmin: boolean;
  priceHistoryMap: { [key: string]: boolean };
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof InvoiceItem, value: any) => void;
  onPriceHistoryClick: (item: InvoiceItem) => void;
  validateTotalQuantity: (item: InvoiceItem) => boolean;
}

const ItemDetailsSection: React.FC<ItemDetailsSectionProps> = ({
  items,
  skus,
  isAdmin,
  priceHistoryMap,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onPriceHistoryClick,
  validateTotalQuantity,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Item Details <span className="text-red-500">*</span></h2>
        <button
          type="button"
          onClick={onAddItem}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            index={index}
            skus={skus}
            canRemove={items.length > 1}
            isAdmin={isAdmin}
            hasPriceHistory={priceHistoryMap[item.skuId] || false}
            onRemove={() => onRemoveItem(item.id)}
            onItemChange={(field, value) => onItemChange(item.id, field, value)}
            onPriceHistoryClick={() => onPriceHistoryClick(item)}
            validateTotalQuantity={validateTotalQuantity}
          />
        ))}

        {/* Totals Row */}
        {items.length > 0 && (
          <div className="border-2 border-blue-300 rounded-lg p-3 bg-blue-50">
            <div className="flex items-end gap-3">
              {/* Empty space for item number */}
              <div className="flex items-center gap-1.5 pb-1 min-w-[2rem]">
                <span className="text-sm font-bold text-gray-900">Total</span>
              </div>

              {/* Empty space for SKU */}
              <div className="flex-1 relative min-w-[200px]"></div>

              {/* Separator */}
              <div className="w-px h-12 bg-gray-300"></div>

              {/* Quantity Group Totals */}
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Total <span className="text-red-500">*</span>
                  </label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)}
                  </div>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Received</label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.reduce((sum, item) => sum + (item.received || 0), 0)}
                  </div>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Short</label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.reduce((sum, item) => sum + (item.short || 0), 0)}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-12 bg-gray-300"></div>

              {/* Price Group Totals */}
              <div className="flex gap-2">
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.length > 0 
                      ? (items.reduce((sum, item) => sum + (item.unitPrice || 0), 0) / items.length).toFixed(2)
                      : '0.00'}
                  </div>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Price</label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.reduce((sum, item) => sum + (item.totalValue || 0), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-12 bg-gray-300"></div>

              {/* Boxes Group Totals */}
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Boxes</label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.reduce((sum, item) => sum + (item.numberOfBoxes || 0), 0)}
                  </div>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Received</label>
                  <div className="px-2 py-1.5 text-xs border-2 border-blue-500 rounded bg-white font-bold text-gray-900">
                    {items.reduce((sum, item) => sum + (item.receivedBoxes || 0), 0)}
                  </div>
                </div>
              </div>

              {/* Empty space for validation */}
              <div className="w-12"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsSection;
