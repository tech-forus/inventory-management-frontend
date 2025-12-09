import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { skuService } from '../services/skuService';
import { inventoryService } from '../services/inventoryService';
import { exportToPDF, exportToExcel, formatDateRange, getDateRangeFromMonths } from '../utils/reportExporter';
import { formatNumber, formatCurrency, formatDate } from '../utils/formatters';

type ReportType = 'total-skus' | 'in-out-inventory' | 'dead-inventory' | 'most-selling' | 'rejected-item';
type PeriodOption = 1 | 3 | 6 | 12 | 'custom';

interface ReportData {
  headers: string[];
  rows: any[][];
  title: string;
  dateRange?: string;
}

const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('total-skus');
  const [period, setPeriod] = useState<PeriodOption>(6);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Set default date range when period changes
    if (period !== 'custom') {
      const range = getDateRangeFromMonths(period as number);
      setDateFrom(range.dateFrom);
      setDateTo(range.dateTo);
    }
  }, [period]);

  const getReportData = async (): Promise<ReportData | null> => {
    try {
      setLoading(true);
      let dateRange = '';
      let apiDateFrom = dateFrom;
      let apiDateTo = dateTo;
      
      if (period === 'custom') {
        dateRange = formatDateRange(dateFrom, dateTo);
      } else {
        const range = getDateRangeFromMonths(period as number);
        apiDateFrom = range.dateFrom;
        apiDateTo = range.dateTo;
        dateRange = formatDateRange(range.dateFrom, range.dateTo);
      }

      switch (selectedReport) {
        case 'total-skus':
          return await getTotalSKUsReport(dateRange);
        case 'in-out-inventory':
          return await getInOutInventoryReport(dateRange, apiDateFrom, apiDateTo);
        case 'dead-inventory':
          return await getDeadInventoryReport(dateRange);
        case 'most-selling':
          return await getMostSellingReport(dateRange);
        case 'rejected-item':
          return await getRejectedItemReport(dateRange, apiDateFrom, apiDateTo);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTotalSKUsReport = async (dateRange: string): Promise<ReportData> => {
    const response = await skuService.getAll({ limit: 10000 });
    const skus = response.data || [];
    
    const headers = ['SKU ID', 'Item Name', 'Brand', 'Category', 'Current Stock', 'Min Stock', 'Available Stock', 'Unit Price', 'Total Value'];
    const rows = skus.map((sku: any) => [
      sku.skuId || '-',
      sku.itemName || '-',
      sku.brand || '-',
      sku.productCategory || '-',
      formatNumber(sku.currentStock || 0),
      formatNumber(sku.minStock || 0),
      formatNumber(sku.usefulStocks || (sku.currentStock || 0) - (sku.bookStocks || 0)),
      formatCurrency(sku.unitPrice || 0),
      formatCurrency((sku.currentStock || 0) * (sku.unitPrice || 0)),
    ]);

    return {
      headers,
      rows,
      title: 'Total SKUs Report',
      dateRange,
    };
  };

  const getInOutInventoryReport = async (dateRange: string, apiDateFrom: string, apiDateTo: string): Promise<ReportData> => {
    const [incomingRes, outgoingRes] = await Promise.all([
      inventoryService.getIncomingHistory({ dateFrom: apiDateFrom, dateTo: apiDateTo }),
      inventoryService.getOutgoingHistory({ dateFrom: apiDateFrom, dateTo: apiDateTo }),
    ]);

    const incoming = incomingRes.data || [];
    const outgoing = outgoingRes.data || [];
    
    const headers = ['Type', 'Invoice Number', 'Date', 'Vendor', 'Brand', 'Total Items', 'Total Value', 'Status'];
    const rows: any[][] = [];

    incoming.forEach((item: any) => {
      rows.push([
        'INCOMING',
        item.invoiceNumber || '-',
        formatDate(item.invoiceDate || item.receivingDate),
        item.vendorName || '-',
        item.brandName || '-',
        formatNumber(item.totalItems || 0),
        formatCurrency(item.totalValue || 0),
        item.status || '-',
      ]);
    });

    outgoing.forEach((item: any) => {
      rows.push([
        'OUTGOING',
        item.invoiceNumber || item.docketNumber || '-',
        formatDate(item.date),
        item.destination || '-',
        '-',
        formatNumber(item.totalItems || 0),
        formatCurrency(item.totalValue || 0),
        item.status || '-',
      ]);
    });

    return {
      headers,
      rows,
      title: 'IN/OUT Inventory Report',
      dateRange,
    };
  };

  const getDeadInventoryReport = async (dateRange: string): Promise<ReportData> => {
    const periodMonths = period === 'custom' ? 6 : (period as number);
    const response = await skuService.getNonMovable({ period: periodMonths });
    const skus = response.data || [];
    
    const headers = ['SKU ID', 'Item Name', 'Brand', 'Category', 'Current Stock', 'Unit Price', 'Inventory Value', 'Last Sale Date', 'Aging (Days)'];
    const rows = skus.map((sku: any) => [
      sku.skuId || '-',
      sku.itemName || '-',
      sku.brand || '-',
      sku.category || '-',
      formatNumber(sku.currentStock || 0),
      formatCurrency(sku.unitPrice || 0),
      formatCurrency(sku.inventoryValue || 0),
      sku.lastSaleDate ? formatDate(sku.lastSaleDate) : 'Never',
      formatNumber(sku.aging || 0),
    ]);

    return {
      headers,
      rows,
      title: 'Dead Inventory (Non-Movable SKUs) Report',
      dateRange,
    };
  };

  const getMostSellingReport = async (dateRange: string): Promise<ReportData> => {
    const periodDays = period === 'custom' ? 30 : (period as number) * 30;
    const response = await skuService.getMostSelling({ period: periodDays, sortBy: 'units' });
    const skus = response.data || [];
    
    const headers = ['Rank', 'SKU ID', 'Item Name', 'Category', 'Units Sold', 'Revenue', 'Last Sale Date'];
    const rows = skus.map((sku: any, index: number) => [
      index + 1,
      sku.skuId || '-',
      sku.itemName || '-',
      sku.category || '-',
      formatNumber(sku.unitsSold || 0),
      formatCurrency(sku.revenue || 0),
      sku.lastSaleDate ? formatDate(sku.lastSaleDate) : '-',
    ]);

    return {
      headers,
      rows,
      title: 'Most Selling SKUs Report',
      dateRange,
    };
  };

  const getRejectedItemReport = async (dateRange: string, apiDateFrom: string, apiDateTo: string): Promise<ReportData> => {
    const response = await inventoryService.getRejectedItemReports({ dateFrom: apiDateFrom, dateTo: apiDateTo });
    const reports = response.data || [];
    
    const headers = ['Report No.', 'Inspection Date', 'SKU ID', 'Item Name', 'Quantity', 'Status', 'Original Invoice'];
    const rows = reports.map((report: any) => [
      report.reportNumber || '-',
      formatDate(report.inspectionDate),
      report.skuCode || `SKU-${report.skuId}`,
      report.itemName || '-',
      formatNumber(report.quantity || 0),
      report.status || 'Pending',
      report.originalInvoiceNumber || '-',
    ]);

    return {
      headers,
      rows,
      title: 'Rejected Item Report',
      dateRange,
    };
  };

  const handleExportPDF = async () => {
    const data = await getReportData();
    if (data) {
      await exportToPDF(data);
    }
  };

  const handleExportExcel = async () => {
    const data = await getReportData();
    if (data) {
      await exportToExcel(data);
    }
  };

  const reportTypes = [
    { id: 'total-skus' as ReportType, label: 'Total SKUs' },
    { id: 'in-out-inventory' as ReportType, label: 'IN/OUT Inventory' },
    { id: 'dead-inventory' as ReportType, label: 'Dead Inventory' },
    { id: 'most-selling' as ReportType, label: 'Most Selling SKUs' },
    { id: 'rejected-item' as ReportType, label: 'Rejected Item' },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Generate and download reports in PDF or Excel format</p>
        </div>

        {/* Report Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Select Report Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  selectedReport === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Range
            </h2>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              {showDatePicker ? 'Hide' : 'Show'} Custom Dates
            </button>
          </div>

          {/* Period Selection */}
          <div className="flex flex-wrap gap-3 mb-4">
            {([1, 3, 6, 12] as const).map((months) => (
              <button
                key={months}
                onClick={() => setPeriod(months)}
                className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                  period === months
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {months} Month{months > 1 ? 's' : ''}
              </button>
            ))}
            <button
              onClick={() => setPeriod('custom')}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                period === 'custom'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Date Picker */}
          {showDatePicker && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Export Options</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FileText className="w-5 h-5" />
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FileSpreadsheet className="w-5 h-5" />
              {loading ? 'Generating...' : 'Download Excel'}
            </button>
          </div>
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading report data...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

