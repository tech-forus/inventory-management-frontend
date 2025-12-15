import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/formatters';

export interface TopSellingItem {
    id: string | number;
    name: string;
    category: string;
    sold: number;
    stockLevel: number;
    minStock: number;
}

interface TopSellingTableProps {
    data: TopSellingItem[];
    loading?: boolean;
}

const TopSellingTable: React.FC<TopSellingTableProps> = ({ data, loading = false }) => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('This Week');

    const getStatus = (stock: number, min: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500', dot: 'bg-red-500' };
        if (stock <= min) return { label: 'Low Stock', color: 'text-orange-500', dot: 'bg-orange-500' };
        return { label: 'In Stock', color: 'text-green-500', dot: 'bg-green-500' };
    };

    const getStockBarColor = (stock: number, min: number) => {
        if (stock === 0) return 'bg-gray-200';
        if (stock <= min) return 'bg-orange-500';
        return 'bg-blue-500';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Top Selling Items</h3>
                </div>
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full font-sans">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Selling Items</h3>
                    <p className="text-sm text-gray-500">Performance for {period}</p>
                </div>
                <div className="relative">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 px-3 pr-8 rounded font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                        <option>This Week</option>
                        <option>Last Month</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left">
                            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Item Name</th>
                            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Sold</th>
                            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-8">Stock Level</th>
                            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const status = getStatus(item.stockLevel, item.minStock);
                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pr-4">
                                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                        </td>
                                        <td className="py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">{formatNumber(item.sold)}</span>
                                        </td>
                                        <td className="py-4 pl-8">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.stockLevel}</span>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${getStockBarColor(item.stockLevel, item.minStock)}`}
                                                        style={{ width: `${Math.min((item.stockLevel / (item.minStock * 3 || 100)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                                                <span className={`text-xs font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {data.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => navigate('/app/sku/analytics/top-selling')}
                        className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        View All Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default TopSellingTable;
