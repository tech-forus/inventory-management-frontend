import React from 'react';
import { ChevronDown, ChevronUp, Eye, Download } from 'lucide-react';
import { formatNumber, formatDate, formatCurrency } from '../../utils/formatters';
import { OutgoingInventoryRecord, OutgoingInventoryItem } from './types';

interface OutgoingRecordRowProps {
  record: OutgoingInventoryRecord;
  item: OutgoingInventoryItem;
  itemKey: string;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetails?: () => void;
  onDownloadInvoice?: () => void;
  downloading?: boolean;
}

const OutgoingRecordRow: React.FC<OutgoingRecordRowProps> = ({
  record,
  item,
  itemKey,
  isExpanded,
  onToggle,
  onViewDetails,
  onDownloadInvoice,
  downloading = false,
}) => {
  const itemName = item.itemName || item.item_name || 'N/A';
  const skuCode = item.skuCode || item.sku_code || String(item.skuId || item.sku_id || '-');
  const outgoingQty = item.outgoingQuantity || item.outgoing_quantity || 0;
  const rejectedQty = item.rejectedQuantity || item.rejected_quantity || 0;
  const unitPrice = item.unitPrice || item.unit_price || 0;
  const totalValue = item.totalValue || item.total_value || 0;

  const getDocumentTypeLabel = () => {
    let label = '';
    if (record.documentType === 'sales_invoice') {
      label = 'Sales Invoice';
      if (record.documentSubType === 'to_customer') label += ' - To Customer';
      if (record.documentSubType === 'to_vendor') {
        label += ' - To Vendor';
        if (record.vendorSubType === 'replacement') label += ' (Replacement)';
        if (record.vendorSubType === 'rejected') label += ' (Rejected)';
      }
    } else if (record.documentType === 'delivery_challan') {
      label = 'Delivery Challan';
      if (record.documentSubType === 'sample') label += ' - Sample';
      if (record.documentSubType === 'replacement') {
        label += ' - Replacement';
        if (record.deliveryChallanSubType === 'to_customer') label += ' (To Customer)';
        if (record.deliveryChallanSubType === 'to_vendor') label += ' (To Vendor)';
      }
    } else if (record.documentType === 'transfer_note') {
      label = 'Transfer Note';
    } else {
      label = record.documentType?.replace(/_/g, ' ') || '-';
    }
    return label;
  };

  const getStatusBadge = () => {
    const status = record.status || 'draft';
    if (status === 'completed') {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Completed</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">Draft</span>;
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm text-center">
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center">
          {record.invoiceChallanNumber || record.docketNumber || '-'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 text-center">
          {record.invoiceChallanDate ? formatDate(record.invoiceChallanDate) : '-'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 capitalize text-center">
          {getDocumentTypeLabel()}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 text-center">
          {itemName}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 text-center">
          {skuCode}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 text-center">
          {record.destinationName || '-'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center">
          {formatNumber(outgoingQty)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-center">
          {formatCurrency(totalValue)}
        </td>
        <td className="px-4 py-3 text-sm text-center">
          {getStatusBadge()}
        </td>
        <td className="px-4 py-3 text-sm text-center">
          <div className="flex items-center justify-center gap-2">
          <button
              onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            title="View Details"
              disabled={!onViewDetails}
          >
            <Eye className="w-4 h-4" />
          </button>
            <button
              onClick={onDownloadInvoice}
              className="text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download Invoice"
              disabled={!onDownloadInvoice || downloading}
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={11} className="px-4 py-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Docket Number:</span>
                <p className="text-gray-900">{record.docketNumber || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Transportor:</span>
                <p className="text-gray-900">{record.transportorName || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Dispatched By:</span>
                <p className="text-gray-900">{record.dispatchedByName || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Unit Price:</span>
                <p className="text-gray-900">{formatCurrency(unitPrice)}</p>
              </div>
              {rejectedQty > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Rejected Quantity:</span>
                  <p className="text-red-600 font-semibold">{formatNumber(rejectedQty)}</p>
                </div>
              )}
              {record.remarks && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Remarks:</span>
                  <p className="text-gray-900">{record.remarks}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default OutgoingRecordRow;

