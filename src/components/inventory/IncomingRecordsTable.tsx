import React, { useMemo } from 'react';
import { IncomingInventoryRecord, IncomingInventoryItem } from './types';
import IncomingRecordRow from './IncomingRecordRow';

interface IncomingRecordsTableProps {
  records: IncomingInventoryRecord[];
  loading: boolean;
  expandedRows: Set<string>;
  recordItems: Record<number, IncomingInventoryItem[]>;
  onToggleRow: (itemKey: string) => void;
  onEditRejectedShort: (record: IncomingInventoryRecord, item: IncomingInventoryItem) => void;
  onItemsUpdate: (recordId?: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  SortIcon?: ({ field }: { field: string }) => React.ReactNode;
}

interface FlattenedItem {
  record: IncomingInventoryRecord;
  item: IncomingInventoryItem;
  itemKey: string;
}

const IncomingRecordsTable: React.FC<IncomingRecordsTableProps> = ({
  records,
  loading,
  expandedRows,
  recordItems,
  onToggleRow,
  onEditRejectedShort,
  onItemsUpdate,
  sortBy,
  sortOrder,
  onSort,
  SortIcon,
}) => {
  // Flatten records and items into individual rows
  const flattenedItems = useMemo(() => {
    const items: FlattenedItem[] = [];
    
    records.forEach((record) => {
      const itemsForRecord = recordItems[record.id] || [];
      
      if (itemsForRecord.length > 0) {
        // If items are loaded, create a row for each item
        itemsForRecord.forEach((item) => {
          const itemId = item.itemId || item.item_id || item.id || 0;
          items.push({
            record,
            item,
            itemKey: `${record.id}-${itemId}`,
          });
        });
      } else {
        // If no items loaded yet, create a placeholder row with record data
        // This will be replaced once items are loaded
        items.push({
          record,
          item: {
            id: 0,
            itemName: 'Loading...',
            received: record.received || 0,
            short: record.short || 0,
            rejected: record.rejected || 0,
            totalQuantity: record.totalQuantity || 0,
          },
          itemKey: `${record.id}-0`,
        });
      }
    });
    
    // Apply sorting if sortBy is provided
    if (sortBy && sortOrder && items.length > 0) {
      items.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortBy) {
          case 'invoiceDate':
            aValue = new Date(a.record.invoiceDate || a.record.invoice_date || 0).getTime();
            bValue = new Date(b.record.invoiceDate || b.record.invoice_date || 0).getTime();
            break;
          case 'receivingDate':
            aValue = new Date(a.record.receivingDate || a.record.receiving_date || 0).getTime();
            bValue = new Date(b.record.receivingDate || b.record.receiving_date || 0).getTime();
            break;
          case 'itemName':
            aValue = (a.item.itemName || a.item.item_name || '').toLowerCase();
            bValue = (b.item.itemName || b.item.item_name || '').toLowerCase();
            break;
          case 'vendor':
            aValue = (a.record.vendorName || a.record.vendor_name || '').toLowerCase();
            bValue = (b.record.vendorName || b.record.vendor_name || '').toLowerCase();
            break;
          case 'totalQuantity':
            aValue = a.item.totalQuantity || a.item.total_quantity || 0;
            bValue = b.item.totalQuantity || b.item.total_quantity || 0;
            break;
          case 'available':
            const aReceived = a.item.received || 0;
            const aRejected = a.item.rejected || 0;
            const aTotalQty = a.item.totalQuantity || a.item.total_quantity || 0;
            const aInitialShort = aTotalQty - aReceived;
            const aArrivedShort = Math.max(0, aInitialShort - (a.item.short || 0));
            aValue = aRejected > 0 ? aReceived - aRejected + aArrivedShort : aReceived + aArrivedShort;
            
            const bReceived = b.item.received || 0;
            const bRejected = b.item.rejected || 0;
            const bTotalQty = b.item.totalQuantity || b.item.total_quantity || 0;
            const bInitialShort = bTotalQty - bReceived;
            const bArrivedShort = Math.max(0, bInitialShort - (b.item.short || 0));
            bValue = bRejected > 0 ? bReceived - bRejected + bArrivedShort : bReceived + bArrivedShort;
            break;
          case 'rejected':
            aValue = a.item.rejected || 0;
            bValue = b.item.rejected || 0;
            break;
          case 'short':
            aValue = a.item.short || 0;
            bValue = b.item.short || 0;
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
    
    return items;
  }, [records, recordItems, sortBy, sortOrder]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Invoice Number
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('invoiceDate')}
              >
                <div className="flex items-center justify-center">
                  Invoice Date
                  {SortIcon && <SortIcon field="invoiceDate" />}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('receivingDate')}
              >
                <div className="flex items-center justify-center">
                  Receiving Date
                  {SortIcon && <SortIcon field="receivingDate" />}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('itemName')}
              >
                <div className="flex items-center justify-center">
                  Item Name
                  {SortIcon && <SortIcon field="itemName" />}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                SKU ID
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('vendor')}
              >
                <div className="flex items-center justify-center">
                  Vendor
                  {SortIcon && <SortIcon field="vendor" />}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('totalQuantity')}
              >
                <div className="flex items-center justify-center">
                  Total Quantity
                  {SortIcon && <SortIcon field="totalQuantity" />}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('available')}
              >
                <div className="flex items-center justify-center">
                  Available | Rejected
                  {SortIcon && <SortIcon field="available" />}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort && onSort('short')}
              >
                <div className="flex items-center justify-center">
                  Short
                  {SortIcon && <SortIcon field="short" />}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : flattenedItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  No incoming inventory records found
                </td>
              </tr>
            ) : (
              flattenedItems.map((flattenedItem) => (
                <IncomingRecordRow
                  key={flattenedItem.itemKey}
                  record={flattenedItem.record}
                  item={flattenedItem.item}
                  itemKey={flattenedItem.itemKey}
                  isExpanded={expandedRows.has(flattenedItem.itemKey)}
                  onToggle={() => onToggleRow(flattenedItem.itemKey)}
                  onEditRejectedShort={onEditRejectedShort}
                  onItemsUpdate={onItemsUpdate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomingRecordsTable;

