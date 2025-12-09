import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { InvoiceItem } from './types';
import SKUSearchInput from './SKUSearchInput';

interface ItemRowProps {
  item: InvoiceItem;
  index: number;
  skus: any[];
  canRemove: boolean;
  isAdmin: boolean;
  hasPriceHistory: boolean;
  onRemove: () => void;
  onItemChange: (field: keyof InvoiceItem, value: any) => void;
  onPriceHistoryClick: () => void;
  validateTotalQuantity: (item: InvoiceItem) => boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  index,
  skus,
  canRemove,
  isAdmin,
  hasPriceHistory,
  onRemove,
  onItemChange,
  onPriceHistoryClick,
  validateTotalQuantity,
}) => {
  const isValid = validateTotalQuantity(item);

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex items-end gap-3">
        {/* Item Number & Remove */}
        <div className="flex items-center gap-1.5 pb-1">
          <span className="text-sm font-semibold text-gray-700 min-w-[2rem]">#{index + 1}</span>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-red-600 hover:text-red-800"
              title="Remove Item"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* SKU Field */}
        <SKUSearchInput
          itemId={item.id}
          skuId={item.skuId}
          skus={skus}
          onSkuChange={(skuId) => {
            const sku = skus.find((s) => s.id.toString() === skuId);
            onItemChange('skuId', skuId);
            onItemChange('itemName', sku?.itemName || '');
          }}
          onClear={() => {
            onItemChange('skuId', '');
            onItemChange('itemName', '');
          }}
        />

        {/* Separator */}
        <div className="w-px h-12 bg-gray-300"></div>

        {/* Quantity Group: Total | Received | Short */}
        <div className="flex gap-2">
          <div className="w-20">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Total <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={item.totalQuantity}
                onChange={(e) => {
                  const totalQty = parseInt(e.target.value) || 0;
                  onItemChange('totalQuantity', totalQty);
                  // Auto-calculate short
                  const short = Math.max(0, totalQty - (item.received || 0));
                  onItemChange('short', short);
                  onItemChange('total', totalQty);
                  onItemChange('totalValue', totalQty * item.unitPrice);
                }}
                className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 pr-6 ${
                  item.totalQuantity > 0 && !isValid
                    ? 'border-red-500 bg-red-50'
                    : item.totalQuantity > 0 && isValid
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="0"
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                {item.totalQuantity > 0 && !isValid && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
                {item.totalQuantity > 0 && isValid && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
              </div>
            </div>
          </div>
          <div className="w-20">
            <label className="block text-xs font-medium text-gray-700 mb-1">Received <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              value={item.received}
              onChange={(e) => {
                const received = parseInt(e.target.value) || 0;
                onItemChange('received', received);
                // Auto-calculate short
                const short = Math.max(0, (item.totalQuantity || 0) - received);
                onItemChange('short', short);
                onItemChange('totalValue', (item.totalQuantity || 0) * item.unitPrice);
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>
          <div className="w-20">
            <label className="block text-xs font-medium text-gray-700 mb-1">Short <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={item.short}
              readOnly
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-gray-50"
              required
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-12 bg-gray-300"></div>

        {/* Price Group: Unit Price | Total Price */}
        <div className="flex gap-2">
          <div className="w-24">
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              Unit Price <span className="text-red-500">*</span>
              {isAdmin && item.skuId && hasPriceHistory && (
                <button
                  type="button"
                  onClick={onPriceHistoryClick}
                  className="text-blue-600 hover:text-blue-800"
                  title="View price history"
                >
                  <Info className="w-3 h-3" />
                </button>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={item.unitPrice}
              onChange={(e) => {
                const unitPrice = parseFloat(e.target.value) || 0;
                onItemChange('unitPrice', unitPrice);
                onItemChange('totalValue', (item.totalQuantity || 0) * unitPrice);
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-700 mb-1">Total Price <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={item.totalValue.toFixed(2)}
              readOnly
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-gray-50"
              required
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-12 bg-gray-300"></div>

        {/* Boxes Group: Total Boxes | Received Boxes */}
        <div className="flex gap-2">
          <div className="w-20">
            <label className="block text-xs font-medium text-gray-700 mb-1">Boxes</label>
            <input
              type="number"
              min="0"
              value={item.numberOfBoxes}
              onChange={(e) => onItemChange('numberOfBoxes', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div className="w-20">
            <label className="block text-xs font-medium text-gray-700 mb-1">Received</label>
            <input
              type="number"
              min="0"
              value={item.receivedBoxes}
              onChange={(e) => onItemChange('receivedBoxes', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Validation Checkmark */}
        <div className="w-12 flex items-center justify-center pb-1">
          {item.totalQuantity > 0 && !isValid && (
            <div className="flex flex-col items-center gap-0.5" title="Total Quantity must equal sum">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-[10px]">Invalid</span>
            </div>
          )}
          {item.totalQuantity > 0 && isValid && (
            <div className="flex flex-col items-center gap-0.5" title="Validation passed">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 text-[10px]">Valid</span>
            </div>
          )}
          {item.totalQuantity === 0 && (
            <span className="text-xs text-gray-400">Exp: {(item.received || 0) + (item.short || 0)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemRow;
