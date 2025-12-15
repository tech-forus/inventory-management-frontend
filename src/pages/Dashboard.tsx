import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { skuService } from '../services/skuService';
import { inventoryService } from '../services/inventoryService';
import { libraryService } from '../services/libraryService';
import { formatNumber } from '../utils/formatters';
import StockByCategoryChart from '../components/dashboard/StockByCategoryChart';
import InventoryMovementChart from '../components/dashboard/InventoryMovementChart';
import StockHealthCard from '../components/dashboard/StockHealthCard';
import TopSellingTable, { TopSellingItem } from '../components/dashboard/TopSellingTable';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Metrics data
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [lowSKUs, setLowSKUs] = useState(0);
  const [nonMovableSKUs, setNonMovableSKUs] = useState(0);
  const [nonMovablePeriod, setNonMovablePeriod] = useState(6);
  const [slowSKUs, setSlowSKUs] = useState(0);
  const [slowSKUsPeriod, setSlowSKUsPeriod] = useState(3);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [incomingInventory, setIncomingInventory] = useState(0);
  const [outgoingInventory, setOutgoingInventory] = useState(0);
  const [stockByCategory, setStockByCategory] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [inventoryMovement, setInventoryMovement] = useState<Array<{ day: string; dayLabel: string; incoming: number; outgoing: number }>>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [nonMovablePeriod, slowSKUsPeriod]);


  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all metrics in parallel
      const [
        skusRes,
        inventoryRes,
        nonMovableRes,
        slowMovingRes,
        incomingHistoryRes,
        outgoingHistoryRes,
        productCategoriesRes,
        mostSellingRes,
      ] = await Promise.all([
        skuService.getAll({ limit: 1000 }),
        inventoryService.getAll(),
        skuService.getNonMovable({ period: nonMovablePeriod }),
        skuService.getSlowMoving({ period: slowSKUsPeriod, threshold: 5 }),
        (() => {
          const dateTo = new Date().toISOString().split('T')[0];
          const dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - 6);
          return inventoryService.getIncomingHistory({ dateFrom: dateFrom.toISOString().split('T')[0], dateTo });
        })(),
        (() => {
          const dateTo = new Date().toISOString().split('T')[0];
          const dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - 6);
          return inventoryService.getOutgoingHistory({ dateFrom: dateFrom.toISOString().split('T')[0], dateTo });
        })(),
        libraryService.getYourProductCategories(),
        skuService.getMostSelling({ period: 30, sortBy: 'units' }),
      ]);

      // Total SKUs
      setTotalSKUs(skusRes.total || skusRes.data?.length || 0);

      // Inventory Data Map for quick lookup
      const inventoryData = inventoryRes.data || [];
      const inventoryMap = new Map<string, any>();
      inventoryData.forEach((item: any) => {
        if (item.sku && item.sku.skuId) {
          inventoryMap.set(item.sku.skuId, item);
        } else if (item.skuId) {
          inventoryMap.set(item.skuId, item); // Fallback if structure varies
        }
      });

      // Low SKUs (where current stock <= min stock)
      const lowStockCount = inventoryData.filter(
        (item: any) => item.currentStock <= item.minStock
      ).length;
      setLowSKUs(lowStockCount);

      // Non-movable SKUs
      setNonMovableSKUs(nonMovableRes.data?.length || 0);

      // Slow SKUs
      setSlowSKUs(slowMovingRes.data?.length || 0);

      // Top Selling Items
      const topSellingData = (mostSellingRes.data || []).slice(0, 5).map((sku: any) => {
        const invItem = inventoryMap.get(sku.skuId);
        return {
          id: sku.skuId || sku.id,
          name: sku.itemName || sku.name || 'Unknown Item',
          category: sku.category || invItem?.productCategory || 'Uncategorized',
          sold: sku.unitsSold || 0,
          stockLevel: invItem ? invItem.currentStock : (sku.currentStock || 0),
          minStock: invItem ? invItem.minStock : (sku.minStock || 10),
        };
      });
      setTopSellingItems(topSellingData);

      // Total transactions
      const incomingCount = incomingHistoryRes.data?.length || 0;
      const outgoingCount = outgoingHistoryRes.data?.length || 0;
      setTotalTransactions(incomingCount + outgoingCount);
      setIncomingInventory(incomingCount);
      setOutgoingInventory(outgoingCount);

      // Calculate stock by category
      const categoryColors = ['#F45B69', '#EC5A7D', '#673AB7', '#5C67F4', '#36D399', '#6A4C93'];

      // Group inventory by product category
      const categoryStockMap = new Map<string, number>();

      inventoryData.forEach((item: any) => {
        const categoryName = item.productCategory || 'Uncategorized';
        const currentStock = item.currentStock || 0;
        const existing = categoryStockMap.get(categoryName) || 0;
        categoryStockMap.set(categoryName, existing + currentStock);
      });

      // Convert to array and sort by value (descending)
      const categoryStockData = Array.from(categoryStockMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: categoryColors[index % categoryColors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 categories

      setStockByCategory(categoryStockData);

      // Calculate inventory movement for last 7 days (Monday to Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday

      // Get Monday of current week
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysFromMonday);
      monday.setHours(0, 0, 0, 0);

      // Get day labels - order from Monday to Sunday
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      // Create array of 7 days starting from Monday
      const movementData = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const dateStr = date.toISOString().split('T')[0];
        return {
          day: dateStr,
          dayLabel: dayLabels[index],
          incoming: 0,
          outgoing: 0,
        };
      });

      // Process incoming history
      const incomingHistory = incomingHistoryRes.data || [];
      incomingHistory.forEach((record: any) => {
        const recordDate = record.receivingDate || record.receiving_date || record.invoiceDate || record.invoice_date;
        if (recordDate) {
          const dateStr = recordDate.split('T')[0];
          const dayIndex = movementData.findIndex(d => d.day === dateStr);
          if (dayIndex !== -1) {
            const quantity = record.receivedQuantity || record.received_quantity || record.totalQuantity || record.total_quantity || 0;
            movementData[dayIndex].incoming += quantity;
          }
        }
      });

      // Process outgoing history
      const outgoingHistory = outgoingHistoryRes.data || [];
      outgoingHistory.forEach((record: any) => {
        const recordDate = record.date || record.invoiceChallanDate || record.invoice_challan_date;
        if (recordDate) {
          const dateStr = recordDate.split('T')[0];
          const dayIndex = movementData.findIndex(d => d.day === dateStr);
          if (dayIndex !== -1) {
            const quantity = record.quantity || record.outgoingQuantity || record.outgoing_quantity || 0;
            movementData[dayIndex].outgoing += quantity;
          }
        }
      });

      setInventoryMovement(movementData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    iconColor: string;
    filter?: React.ReactNode;
    badge?: React.ReactNode;
    onClick?: () => void;
  }> = ({ title, value, icon, color, iconColor, filter, badge, onClick }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5' : ''
        }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${color} shadow-md`}>
          <div className={iconColor}>{icon}</div>
        </div>
        {filter && (
          <div onClick={(e) => e.stopPropagation()}>
            {filter}
          </div>
        )}
        {badge && (
          <div onClick={(e) => e.stopPropagation()}>
            {badge}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-text-primary">
          {loading ? (
            <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 bg-bg-light min-h-screen" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      {/* Header Section */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-text-primary mb-1.5">Inventory Dashboard</h1>
          <p className="text-text-secondary text-sm">Comprehensive overview of your inventory operations and key metrics</p>
        </div>
      </div>

      {/* Top Row - 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total SKUs"
          value={loading ? '...' : formatNumber(totalSKUs)}
          icon={<Package className="w-5 h-5" />}
          color="bg-blue-100"
          iconColor="text-blue-700"
          onClick={() => navigate('/app/sku')}
        />
        <MetricCard
          title="Incoming Inventory"
          value={loading ? '...' : formatNumber(incomingInventory)}
          icon={<ArrowDownCircle className="w-5 h-5" />}
          color="bg-green-100"
          iconColor="text-green-700"
          onClick={() => navigate('/app/inventory/incoming')}
        />
        <MetricCard
          title="Outgoing Inventory"
          value={loading ? '...' : formatNumber(outgoingInventory)}
          icon={<ArrowUpCircle className="w-5 h-5" />}
          color="bg-indigo-100"
          iconColor="text-indigo-700"
          onClick={() => navigate('/app/inventory/outgoing')}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={loading ? '...' : formatNumber(lowSKUs)}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-orange-100"
          iconColor="text-orange-700"
          onClick={() => navigate('/app/sku?stockStatus=low_stock')}
        />
      </div>

      {/* Main Content Grid - 3 Columns: Inventory Movement, Stock Health, Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Column 1 - Inventory Movement Chart */}
        <div className="lg:col-span-2">
          <InventoryMovementChart data={inventoryMovement} loading={loading} />
        </div>

        {/* Column 2 - Stock Health */}
        <div className="lg:col-span-1">
          <StockHealthCard
            nonMovable={nonMovableSKUs}
            slowSKUs={slowSKUs}
            nonMovablePeriod={nonMovablePeriod}
            slowSKUsPeriod={slowSKUsPeriod}
            onNonMovablePeriodChange={setNonMovablePeriod}
            onSlowSKUsPeriodChange={setSlowSKUsPeriod}
            onNonMovableClick={() => navigate('/app/sku/analytics/non-movable')}
            onSlowSKUsClick={() => navigate('/app/sku/analytics/slow-moving')}
            loading={loading}
          />
        </div>

        {/* Column 3 - Stock by Category Chart */}
        <div className="lg:col-span-1">
          <StockByCategoryChart data={stockByCategory} loading={loading} />
        </div>
      </div>

      {/* Bottom Row - Top Selling Table */}
      <div className="w-full">
        <TopSellingTable data={topSellingItems} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
