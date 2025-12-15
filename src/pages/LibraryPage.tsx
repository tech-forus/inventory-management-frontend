import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { libraryService } from '../services/libraryService';
import VendorsTab from '../components/library/VendorsTab';
import BrandsTab from '../components/library/BrandsTab';
import CategoryMasterTab from '../components/library/CategoryMasterTab';
import TeamsTab from '../components/library/TeamsTab';
import CustomersTab from '../components/library/CustomersTab';
import ProductsTab from '../components/library/ProductsTab';
import { skuService } from '../services/skuService';

interface Vendor {
  id: number;
  name: string;
  contactPerson?: string;
  designation?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  isActive: boolean;
}

interface Brand {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt?: string;
}

interface ItemCategory {
  id: number;
  name: string;
  productCategoryId: number;
  productCategoryName?: string;
  subCategoryCount?: number;
  description?: string;
  createdAt?: string;
}

interface SubCategory {
  id: number;
  name: string;
  itemCategoryId: number;
  itemCategoryName?: string;
  description?: string;
  createdAt?: string;
}

interface Team {
  id: number;
  name: string;
  contactNumber: string;
  emailId: string;
  department: string;
  designation: string;
  isActive?: boolean;
}

interface Customer {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  isActive: boolean;
}

interface Product {
  id: number;
  skuId: string;
  itemName: string;
  productCategory?: string;
  itemCategory?: string;
  subCategory?: string;
  brand?: string;
  vendor?: string;
  model?: string;
  hsnSacCode?: string;
  currentStock: number;
  minStock: number;
  ratingSize?: string;
  series?: string;
  unit?: string;
}

type LibrarySection = 'category-master' | 'vendors' | 'customers' | 'brands' | 'teams' | 'products';

const LibraryPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<LibrarySection>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Record<LibrarySection, boolean>>({
    'category-master': false,
    'vendors': false,
    'customers': false,
    'brands': false,
    'teams': false,
    'products': false,
  });

  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const toggleSection = (section: LibrarySection) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
      // Load data when expanding
      loadData(section);
    }
    setExpandedSections(newExpanded);
  };

  const loadData = async (section: LibrarySection) => {
    // Skip if already loading or data already loaded
    if (loadingStates[section]) return;
    
    // Check if data is already loaded
    if (
      (section === 'vendors' && vendors.length > 0) ||
      (section === 'brands' && brands.length > 0) ||
      (section === 'category-master' && productCategories.length > 0) ||
      (section === 'teams' && teams.length > 0) ||
      (section === 'customers' && customers.length > 0) ||
      (section === 'products' && products.length > 0)
    ) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [section]: true }));
      
      switch (section) {
        case 'vendors':
          const vendorsRes = await libraryService.getYourVendors();
          setVendors(vendorsRes.data || []);
          break;
        case 'brands':
          const brandsRes = await libraryService.getYourBrands();
          setBrands(brandsRes.data || []);
          break;
        case 'category-master':
          // Load all category types when Category Master is expanded
          const [productCatsRes, itemCatsRes, subCatsRes] = await Promise.all([
            libraryService.getYourProductCategories(),
            libraryService.getYourItemCategories(),
            libraryService.getYourSubCategories(),
          ]);
          setProductCategories(productCatsRes.data || []);
          setItemCategories(itemCatsRes.data || []);
          setSubCategories(subCatsRes.data || []);
          break;
        case 'teams':
          const teamsRes = await libraryService.getTeams();
          setTeams(teamsRes.data || []);
          break;
        case 'customers':
          const customersRes = await libraryService.getCustomers();
          setCustomers(customersRes.data || []);
          break;
        case 'products':
          const productsRes = await skuService.getAll({ limit: 10000 });
          setProducts(productsRes.data || []);
          break;
      }
    } catch (error) {
      console.error(`Error loading ${section}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleRefresh = async (section: LibrarySection) => {
    // Clear data and reload with force flag
    switch (section) {
      case 'vendors':
        setVendors([]);
        break;
      case 'brands':
        setBrands([]);
        break;
      case 'category-master':
        setProductCategories([]);
        setItemCategories([]);
        setSubCategories([]);
        break;
      case 'teams':
        setTeams([]);
        break;
      case 'customers':
        setCustomers([]);
        break;
      case 'products':
        setProducts([]);
        break;
    }
    // Force reload by clearing loading state first
    setLoadingStates(prev => ({ ...prev, [section]: false }));
    await loadData(section);
  };

  const librarySections: { key: LibrarySection; label: string; icon?: string }[] = [
    { key: 'category-master', label: 'Category Master' },
    { key: 'vendors', label: 'Vendors' },
    { key: 'customers', label: 'Customers' },
    { key: 'brands', label: 'Brands' },
    { key: 'teams', label: 'Teams' },
    { key: 'products', label: 'Products' },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Library</h1>

        {/* Vertical Accordion Layout */}
        <div className="space-y-4">
          {librarySections.map((section) => {
            const isExpanded = expandedSections.has(section.key);
            const isLoading = loadingStates[section.key];

            return (
              <div
                key={section.key}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Section Header - Clickable */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                    <h2 className="text-base font-semibold text-gray-900">
                      {section.label}
                    </h2>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {isExpanded ? 'Click to collapse' : 'Click to expand'}
                  </span>
                </button>

                {/* Section Content - Table */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    {section.key === 'category-master' && (
                      <CategoryMasterTab
                        productCategories={productCategories}
                        itemCategories={itemCategories}
                        subCategories={subCategories}
                        loading={isLoading}
                        onRefresh={() => handleRefresh('category-master')}
                      />
                    )}
                    {section.key === 'vendors' && (
                      <VendorsTab
                        vendors={vendors}
                        loading={isLoading}
                        onRefresh={() => handleRefresh('vendors')}
                      />
                    )}
                    {section.key === 'brands' && (
                      <BrandsTab
                        brands={brands}
                        loading={isLoading}
                        onRefresh={() => handleRefresh('brands')}
                      />
                    )}
                    {section.key === 'teams' && (
                      <TeamsTab
                        teams={teams}
                        loading={isLoading}
                        onRefresh={() => handleRefresh('teams')}
                      />
                    )}
                    {section.key === 'customers' && (
                      <CustomersTab
                        customers={customers}
                        loading={isLoading}
                        onRefresh={() => handleRefresh('customers')}
                      />
                    )}
                    {section.key === 'products' && (
                      <ProductsTab
                        products={products}
                        loading={isLoading}
                        onRefresh={() => handleRefresh('products')}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
