import api from '../utils/api';

export const libraryService = {
  // Vendors
  getVendors: async () => {
    const response = await api.get('/library/vendors');
    return response.data;
  },
  createVendor: async (data: any) => {
    const response = await api.post('/library/vendors', data);
    return response.data;
  },
  updateVendor: async (id: number, data: any) => {
    const response = await api.put(`/library/vendors/${id}`, data);
    return response.data;
  },
  deleteVendor: async (id: number) => {
    const response = await api.delete(`/library/vendors/${id}`);
    return response.data;
  },
  // Brands
  getBrands: async () => {
    const response = await api.get('/library/brands');
    return response.data;
  },
  createBrand: async (data: any) => {
    const response = await api.post('/library/brands', data);
    return response.data;
  },
  updateBrand: async (id: number, data: any) => {
    const response = await api.put(`/library/brands/${id}`, data);
    return response.data;
  },
  deleteBrand: async (id: number) => {
    const response = await api.delete(`/library/brands/${id}`);
    return response.data;
  },
  // Product Categories
  getProductCategories: async () => {
    const response = await api.get('/categories/product');
    return response.data;
  },
  createProductCategory: async (data: any) => {
    const response = await api.post('/categories/product', data);
    return response.data;
  },
  updateProductCategory: async (id: number, data: any) => {
    const response = await api.put(`/categories/product/${id}`, data);
    return response.data;
  },
  deleteProductCategory: async (id: number) => {
    const response = await api.delete(`/categories/product/${id}`);
    return response.data;
  },
  // Item Categories
  getItemCategories: async (productCategoryId?: number) => {
    const params = productCategoryId ? { productCategoryId } : {};
    const response = await api.get('/categories/item', { params });
    return response.data;
  },
  createItemCategory: async (data: any) => {
    const response = await api.post('/categories/item', data);
    return response.data;
  },
  updateItemCategory: async (id: number, data: any) => {
    const response = await api.put(`/categories/item/${id}`, data);
    return response.data;
  },
  deleteItemCategory: async (id: number) => {
    const response = await api.delete(`/categories/item/${id}`);
    return response.data;
  },
  // Sub Categories
  getSubCategories: async (itemCategoryId?: number) => {
    const params = itemCategoryId ? { itemCategoryId } : {};
    const response = await api.get('/categories/sub', { params });
    return response.data;
  },
  createSubCategory: async (data: any) => {
    const response = await api.post('/categories/sub', data);
    return response.data;
  },
  updateSubCategory: async (id: number, data: any) => {
    const response = await api.put(`/categories/sub/${id}`, data);
    return response.data;
  },
  deleteSubCategory: async (id: number) => {
    const response = await api.delete(`/categories/sub/${id}`);
    return response.data;
  },
  // Excel Upload Methods
  uploadVendors: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Get companyId from user object
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.companyId) {
        formData.append('companyId', user.companyId);
      }
    }
    const response = await api.post('/library/vendors/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadBrands: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.companyId) {
        formData.append('companyId', user.companyId);
      }
    }
    const response = await api.post('/library/brands/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadProductCategories: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.companyId) {
        formData.append('companyId', user.companyId);
      }
    }
    const response = await api.post('/categories/product/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadItemCategories: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.companyId) {
        formData.append('companyId', user.companyId);
      }
    }
    const response = await api.post('/categories/item/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadSubCategories: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.companyId) {
        formData.append('companyId', user.companyId);
      }
    }
    const response = await api.post('/categories/sub/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // New "your" prefixed routes
  getYourVendors: async () => {
    const response = await api.get('/yourvendors');
    return response.data;
  },
  createYourVendor: async (data: any) => {
    const response = await api.post('/yourvendors', data);
    return response.data;
  },
  updateYourVendor: async (id: number, data: any) => {
    const response = await api.put(`/yourvendors/${id}`, data);
    return response.data;
  },
  getYourBrands: async () => {
    const response = await api.get('/yourbrands');
    return response.data;
  },
  createYourBrand: async (data: any) => {
    const response = await api.post('/yourbrands', data);
    return response.data;
  },
  updateYourBrand: async (id: number, data: any) => {
    const response = await api.put(`/yourbrands/${id}`, data);
    return response.data;
  },
  getYourProductCategories: async () => {
    const response = await api.get('/yourproductcategories');
    return response.data;
  },
  createYourProductCategory: async (data: any) => {
    const response = await api.post('/yourproductcategories', data);
    return response.data;
  },
  getYourItemCategories: async (productCategoryId?: number) => {
    const params = productCategoryId ? { productCategoryId } : {};
    const response = await api.get('/youritemcategories', { params });
    return response.data;
  },
  createYourItemCategory: async (data: any) => {
    const response = await api.post('/youritemcategories', data);
    return response.data;
  },
  getYourSubCategories: async (itemCategoryId?: number) => {
    const params = itemCategoryId ? { itemCategoryId } : {};
    const response = await api.get('/yoursubcategories', { params });
    return response.data;
  },
  createYourSubCategory: async (data: any) => {
    const response = await api.post('/yoursubcategories', data);
    return response.data;
  },
  updateYourProductCategory: async (id: number, data: any) => {
    const response = await api.put(`/yourproductcategories/${id}`, data);
    return response.data;
  },
  updateYourItemCategory: async (id: number, data: any) => {
    const response = await api.put(`/youritemcategories/${id}`, data);
    return response.data;
  },
  updateYourSubCategory: async (id: number, data: any) => {
    const response = await api.put(`/yoursubcategories/${id}`, data);
    return response.data;
  },
  deleteYourVendor: async (id: number) => {
    const response = await api.delete(`/yourvendors/${id}`);
    return response.data;
  },
  deleteYourBrand: async (id: number) => {
    const response = await api.delete(`/yourbrands/${id}`);
    return response.data;
  },
  deleteYourProductCategory: async (id: number) => {
    const response = await api.delete(`/yourproductcategories/${id}`);
    return response.data;
  },
  deleteYourItemCategory: async (id: number) => {
    const response = await api.delete(`/youritemcategories/${id}`);
    return response.data;
  },
  deleteYourSubCategory: async (id: number) => {
    const response = await api.delete(`/yoursubcategories/${id}`);
    return response.data;
  },
  // Teams
  getTeams: async () => {
    const response = await api.get('/library/teams');
    return response.data;
  },
  createTeam: async (data: any) => {
    const response = await api.post('/library/teams', data);
    return response.data;
  },
  updateTeam: async (id: number, data: any) => {
    const response = await api.put(`/library/teams/${id}`, data);
    return response.data;
  },
  deleteTeam: async (id: number) => {
    const response = await api.delete(`/library/teams/${id}`);
    return response.data;
  },
  // Customers
  getCustomers: async () => {
    const response = await api.get('/library/customers');
    return response.data;
  },
  createCustomer: async (data: any) => {
    const response = await api.post('/library/customers', data);
    return response.data;
  },
  updateCustomer: async (id: number, data: any) => {
    const response = await api.put(`/library/customers/${id}`, data);
    return response.data;
  },
  deleteCustomer: async (id: number) => {
    const response = await api.delete(`/library/customers/${id}`);
    return response.data;
  },
};

