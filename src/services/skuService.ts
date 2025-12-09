import api from '../utils/api';

export const skuService = {
  getAll: async (params?: {
    search?: string;
    productCategory?: string;
    itemCategory?: string;
    subCategory?: string;
    brand?: string;
    stockStatus?: string;
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/skus', { params });
    return response.data;
  },
  getById: async (id: string | number) => {
    const response = await api.get(`/skus/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/skus', data);
    return response.data;
  },
  update: async (id: string | number, data: any) => {
    const response = await api.put(`/skus/${id}`, data);
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/skus/${id}`);
    return response.data;
  },
  getMostSelling: async (params?: { period?: number; sortBy?: string }) => {
    const response = await api.get('/skus/analytics/top-selling', { params });
    return response.data;
  },
  getSlowMoving: async (params?: { period?: number; threshold?: number }) => {
    const response = await api.get('/skus/analytics/slow-moving', { params });
    return response.data;
  },
  getNonMovable: async (params?: { period?: number }) => {
    const response = await api.get('/skus/analytics/non-movable', { params });
    return response.data;
  },
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/skus/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

