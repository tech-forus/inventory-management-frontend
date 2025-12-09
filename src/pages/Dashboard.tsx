import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, TrendingDown, TrendingUp, ShoppingCart, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { skuService } from '../services/skuService';
import { inventoryService } from '../services/inventoryService';
import { libraryService } from '../services/libraryService';
import { formatNumber, formatCurrency } from '../utils/formatters';
import StockByCategoryChart from '../components/dashboard/StockByCategoryChart';

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
  const [topSellingSKUs, setTopSellingSKUs] = useState<any[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [incomingInventory, setIncomingInventory] = useState(0);
  const [outgoingInventory, setOutgoingInventory] = useState(0);
  const [stockByCategory, setStockByCategory] = useState<Array<{ name: string; value: number; color: string }>>([]);

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
        mostSellingRes,
        incomingHistoryRes,
        outgoingHistoryRes,
        productCategoriesRes,
      ] = await Promise.all([
        skuService.getAll({ limit: 1000 }),
        inventoryService.getAll(),
        skuService.getNonMovable({ period: nonMovablePeriod }),
        skuService.getSlowMoving({ period: slowSKUsPeriod, threshold: 5 }),
        skuService.getMostSelling({ period: 30, sortBy: 'units' }),
        inventoryService.getIncomingHistory(),
        inventoryService.getOutgoingHistory(),
        libraryService.getYourProductCategories(),
      ]);

      // Total SKUs
      setTotalSKUs(skusRes.total || skusRes.data?.length || 0);

      // Low SKUs (where current stock <= min stock)
      const lowStockCount = (inventoryRes.data || []).filter(
        (item: any) => item.currentStock <= item.minStock
      ).length;
      setLowSKUs(lowStockCount);

      // Non-movable SKUs
      setNonMovableSKUs(nonMovableRes.data?.length || 0);

      // Slow SKUs
      setSlowSKUs(slowMovingRes.data?.length || 0);

      // Top 10 most selling SKUs
      const top10 = (mostSellingRes.data || []).slice(0, 10);
      setTopSellingSKUs(top10);

      // Total transactions
      const incomingCount = incomingHistoryRes.data?.length || 0;
      const outgoingCount = outgoingHistoryRes.data?.length || 0;
      setTotalTransactions(incomingCount + outgoingCount);
      setIncomingInventory(incomingCount);
      setOutgoingInventory(outgoingCount);

      // Calculate stock by category
      const inventoryData = inventoryRes.data || [];
      const categories = productCategoriesRes.data || [];
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
    onClick?: () => void;
  }> = ({ title, value, icon, color, iconColor, filter, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5' : ''
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

  const TopSellingCard: React.FC = () => (
    <div 
      className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5"
      onClick={() => navigate('/app/sku/analytics/most-selling')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-blue-100 shadow-md`}>
          <div className="text-blue-700"><TrendingUp className="w-5 h-5" /></div>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Top 10 Most Selling SKUs</p>
        <div className="space-y-1.5 mt-3">
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : topSellingSKUs.length === 0 ? (
            <p className="text-gray-500 text-center py-2 text-xs">No data available</p>
          ) : (
            topSellingSKUs.slice(0, 3).map((sku, index) => (
              <div 
                key={sku.skuId || index} 
                className="flex items-center justify-between p-1.5 bg-blue-50 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/app/sku/analytics/most-selling');
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    'bg-orange-300 text-orange-900'
                  }`}>
                    {index + 1}
                  </span>
                  <p className="text-[11px] font-medium text-gray-900 truncate max-w-[90px]">{sku.skuId || sku.itemName}</p>
                </div>
                <p className="text-[11px] font-bold text-blue-600">{formatNumber(sku.unitsSold || 0)}</p>
              </div>
            ))
          )}
        </div>
        {!loading && topSellingSKUs.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/app/sku/analytics/most-selling');
            }}
            className="mt-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors w-full text-center py-1 hover:bg-blue-50 rounded"
          >
            View All →
          </button>
        )}
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

      {/* Main Content Grid - Left: Metrics, Right: Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-4">
      {/* First Row - 3 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full">
          <MetricCard
            title="Total Number of SKU's"
            value={loading ? '...' : formatNumber(totalSKUs)}
            icon={<Package className="w-5 h-5" />}
            color="bg-blue-100"
            iconColor="text-blue-700"
            onClick={() => navigate('/app/sku')}
          />
        </div>
        <div className="w-full">
          <MetricCard
            title="Low SKU (MSQ)"
            value={loading ? '...' : formatNumber(lowSKUs)}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="bg-orange-100"
            iconColor="text-orange-700"
            onClick={() => navigate('/app/sku?stockStatus=low_stock')}
          />
        </div>
        <div className="w-full">
          <MetricCard
            title="Non Movable SKUs"
            value={loading ? '...' : formatNumber(nonMovableSKUs)}
            icon={<TrendingDown className="w-5 h-5" />}
            color="bg-red-100"
            iconColor="text-red-700"
            filter={
              <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm" onClick={(e) => e.stopPropagation()}>
                {[3, 6, 9, 12].map((months) => (
                  <button
                    key={months}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNonMovablePeriod(months);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                      nonMovablePeriod === months
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {months}M
                  </button>
                ))}
              </div>
            }
            onClick={() => navigate('/app/sku/analytics/non-movable')}
          />
        </div>
      </div>

      {/* Second Row - 3 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full">
          <MetricCard
            title="Slow SKUs"
            value={loading ? '...' : formatNumber(slowSKUs)}
            icon={<TrendingDown className="w-5 h-5" />}
            color="bg-yellow-100"
            iconColor="text-yellow-700"
            filter={
              <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm" onClick={(e) => e.stopPropagation()}>
                {[3, 6, 9, 12].map((months) => (
                  <button
                    key={months}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlowSKUsPeriod(months);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                      slowSKUsPeriod === months
                        ? 'bg-yellow-600 text-white shadow-md'
                        : 'text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    {months}M
                  </button>
                ))}
              </div>
            }
            onClick={() => navigate('/app/sku/analytics/slow-moving')}
          />
        </div>
        <div className="w-full">
          <TopSellingCard />
        </div>
        <div className="w-full">
          <MetricCard
            title="Total Transactions"
            value={loading ? '...' : formatNumber(totalTransactions)}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="bg-purple-100"
            iconColor="text-purple-700"
            onClick={() => navigate('/app/inventory')}
          />
        </div>
      </div>

      {/* Third Row - 2 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <MetricCard
            title="Incoming Inventory"
            value={loading ? '...' : formatNumber(incomingInventory)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            color="bg-green-100"
            iconColor="text-green-700"
            onClick={() => navigate('/app/inventory/incoming')}
          />
        </div>
        <div className="w-full">
          <MetricCard
            title="Outgoing Inventory"
            value={loading ? '...' : formatNumber(outgoingInventory)}
            icon={<ArrowUpCircle className="w-5 h-5" />}
            color="bg-indigo-100"
            iconColor="text-indigo-700"
            onClick={() => navigate('/app/inventory/outgoing')}
          />
          </div>
          </div>
        </div>

        {/* Right Column - Stock by Category Chart */}
        <div className="lg:col-span-1">
          <StockByCategoryChart data={stockByCategory} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
