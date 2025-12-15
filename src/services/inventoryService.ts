import api from '../utils/api';

export const inventoryService = {
  getAll: async (params?: {
    search?: string;
    productCategory?: string;
    itemCategory?: string;
    subCategory?: string;
    brand?: string;
    stockStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  getIncoming: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    vendor?: string;
    status?: string;
  }) => {
    const response = await api.get('/inventory/incoming', { params });
    return response.data;
  },
  getIncomingById: async (id: number) => {
    const response = await api.get(`/inventory/incoming/${id}`);
    return response.data;
  },
  getIncomingHistory: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    vendor?: string;
    sku?: string;
  }) => {
    const response = await api.get('/inventory/incoming/history', { params });
    return response.data;
  },
  addIncoming: async (data: any) => {
    const response = await api.post('/inventory/incoming', data);
    return response.data;
  },
  getOutgoingHistory: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    destination?: string;
    sku?: string;
    status?: string;
    id?: number;
  }) => {
    const response = await api.get('/inventory/outgoing/history', { params });
    return response.data;
  },
  getOutgoing: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    destination?: string;
    status?: string;
  }) => {
    const response = await api.get('/inventory/outgoing', { params });
    return response.data;
  },
  getOutgoingById: async (id: number) => {
    const response = await api.get(`/inventory/outgoing/${id}`);
    return response.data;
  },
  getOutgoingItems: async (id: number) => {
    const response = await api.get(`/inventory/outgoing/${id}`);
    return response.data;
  },
  addOutgoing: async (data: any) => {
    const response = await api.post('/inventory/outgoing', data);
    return response.data;
  },
  getIncomingItems: async (id: number) => {
    const response = await api.get(`/inventory/incoming/${id}/items`);
    return response.data;
  },
  moveReceivedToRejected: async (id: number, itemId: number, quantity?: number, inspectionDate?: string) => {
    const response = await api.post(`/inventory/incoming/${id}/move-received-to-rejected`, { itemId, quantity, inspectionDate });
    return response.data;
  },
  moveShortToRejected: async (id: number, itemId: number, quantity?: number) => {
    const response = await api.post(`/inventory/incoming/${id}/move-to-rejected`, { itemId, quantity });
    return response.data;
  },
  updateShortItem: async (id: number, data: { itemId: number; received?: number; short?: number; challanNumber?: string; challanDate?: string }) => {
    const response = await api.put(`/inventory/incoming/${id}/update-short-item`, data);
    return response.data;
  },
  updateRejectedShort: async (id: number, data: { itemId: number; rejected?: number; short?: number; invoiceNumber?: string; invoiceDate?: string }) => {
    // Use the new endpoint that supports both rejected and short
    const updateData: any = {
      itemId: data.itemId,
    };
    
    if (data.rejected !== undefined) {
      updateData.rejected = data.rejected;
    }
    
    if (data.short !== undefined) {
      updateData.short = data.short;
    }
    
    const response = await api.put(`/inventory/incoming/${id}/update-item-rejected-short`, updateData);
    return response.data;
  },
  updateRecordLevelRejectedShort: async (id: number, data: { rejected?: number; short?: number }) => {
    const response = await api.put(`/inventory/incoming/${id}/update-record-level`, data);
    return response.data;
  },
  getRejectedItems: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    vendor?: string;
    brand?: string;
    sku?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/inventory/incoming/rejected-items', { params });
    return response.data;
  },
  getPriceHistory: async (skuId: string) => {
    const response = await api.get('/inventory/incoming/price-history', {
      params: { skuId }
    });
    return response.data;
  },
  hasPriceHistory: async (skuId: string) => {
    const response = await api.get('/inventory/incoming/has-price-history', {
      params: { skuId }
    });
    return response.data;
  },
  getRejectedItemReports: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/inventory/rejected-item-reports', { params });
    return response.data;
  },
  getRejectedItemReportById: async (id: number) => {
    const response = await api.get(`/inventory/rejected-item-reports/${id}`);
    return response.data;
  },
  createRejectedItemReport: async (data: {
    incomingInventoryId: number;
    incomingInventoryItemId: number;
    skuId: number;
    itemName: string;
    quantity: number;
    inspectionDate?: string;
  }) => {
    const response = await api.post('/inventory/rejected-item-reports', data);
    return response.data;
  },
  updateRejectedItemReport: async (id: number, data: {
    sentToVendor?: number;
    receivedBack?: number;
    scrapped?: number;
    netRejected?: number;
    status?: string;
    inspectionDate?: string;
  }) => {
    const response = await api.put(`/inventory/rejected-item-reports/${id}`, data);
    return response.data;
  },
  deleteRejectedItemReport: async (id: number) => {
    const response = await api.delete(`/inventory/rejected-item-reports/${id}`);
    return response.data;
  },
  getShortItemReports: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/inventory/short-item-reports', { params });
    return response.data;
  },
};

