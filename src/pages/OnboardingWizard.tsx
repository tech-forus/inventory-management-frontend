import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Step1ProductCategories from '../components/onboarding/Step1ProductCategories';
import Step2ItemCategories from '../components/onboarding/Step2ItemCategories';
import Step3SubCategories from '../components/onboarding/Step3SubCategories';
import Step4VendorsBrands from '../components/onboarding/Step4VendorsBrands';

interface ProductCategory {
  id?: number;
  name: string;
  description?: string;
}

interface ItemCategory {
  id?: number;
  name: string;
  description?: string;
}

interface SubCategory {
  id?: number;
  name: string;
  description?: string;
}

interface Vendor {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
}

interface Brand {
  name: string;
  description?: string;
}

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyId, setCompanyId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Product Categories
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([
    { name: 'Finished Goods' },
    { name: 'Raw Materials' },
    { name: 'Work in Progress' },
    { name: 'Components' }
  ]);

  // Step 2: Item Categories
  const [selectedProductCategory, setSelectedProductCategory] = useState<number | null>(null);
  const [productCategoriesList, setProductCategoriesList] = useState<ProductCategory[]>([]);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);

  // Step 3: Sub Categories
  const [selectedItemCategory, setSelectedItemCategory] = useState<number | null>(null);
  const [itemCategoriesList, setItemCategoriesList] = useState<ItemCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // Step 4: Vendors & Brands
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newVendor, setNewVendor] = useState<Vendor>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pin: ''
  });
  const [newBrand, setNewBrand] = useState<Brand>({ name: '' });

  useEffect(() => {
    // Get company ID from localStorage/sessionStorage
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    if (user.companyId) {
      setCompanyId(user.companyId);
      loadProductCategories(user.companyId);
    }
  }, []);

  const loadProductCategories = async (cid: string) => {
    try {
      const response = await axios.get(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/product-categories/${cid}`);
      if (response.data.success && response.data.data.length > 0) {
        setProductCategoriesList(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProductCategory(response.data.data[0].id);
          loadItemCategories(cid, response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading product categories:', error);
    }
  };

  const loadItemCategories = async (cid: string, productCategoryId: number) => {
    try {
      const response = await axios.get(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/item-categories/${cid}/${productCategoryId}`);
      if (response.data.success) {
        setItemCategoriesList(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedItemCategory(response.data.data[0].id);
        }
        // If no item categories exist, initialize with defaults for "Finished Goods"
        if (response.data.data.length === 0 && productCategoriesList.find(c => c.id === productCategoryId)?.name === 'Finished Goods') {
          setItemCategories([
            { name: 'LED Drivers' },
            { name: 'LED Lights' },
            { name: 'LED Panels' },
            { name: 'Switches' }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading item categories:', error);
      // Initialize with defaults if error
      if (productCategoriesList.find(c => c.id === productCategoryId)?.name === 'Finished Goods') {
        setItemCategories([
          { name: 'LED Drivers' },
          { name: 'LED Lights' },
          { name: 'LED Panels' },
          { name: 'Switches' }
        ]);
      }
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const hasEmpty = productCategories.some(c => !c.name.trim());
      if (hasEmpty) {
        alert('Please fill in all product category names before proceeding.');
        return false;
      }
      // Check if there are categories in either local state or saved list
      if (productCategories.length === 0 && productCategoriesList.length === 0) {
        alert('Please add at least one product category.');
        return false;
      }
    } else if (step === 2) {
      if (!selectedProductCategory) {
        alert('Please select a product category.');
        return false;
      }
      const hasEmpty = itemCategories.some(c => !c.name.trim());
      if (hasEmpty) {
        alert('Please fill in all item category names before proceeding.');
        return false;
      }
      // Check if there are categories in either local state or saved list
      if (itemCategories.length === 0 && itemCategoriesList.length === 0) {
        alert('Please add at least one item category.');
        return false;
      }
    } else if (step === 3) {
      if (!selectedItemCategory) {
        alert('Please select an item category.');
        return false;
      }
      // Sub categories are optional, but if added, they must have names
      const hasEmpty = subCategories.some(c => !c.name.trim());
      if (hasEmpty) {
        alert('Please fill in all sub category names or remove empty ones.');
        return false;
      }
    } else if (step === 4) {
      // Vendors and brands are optional, but if added, they must have names
      const hasEmptyVendor = vendors.some(v => !v.name.trim());
      const hasEmptyBrand = brands.some(b => !b.name.trim());
      if (hasEmptyVendor) {
        alert('Please fill in all vendor names or remove empty ones.');
        return false;
      }
      if (hasEmptyBrand) {
        alert('Please fill in all brand names or remove empty ones.');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 1) {
      // Save product categories
      try {
        await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/product-categories', {
          companyId,
          categories: productCategories.filter(c => c.name.trim())
        });
        await loadProductCategories(companyId);
        // Wait a bit for the data to be available
        setTimeout(async () => {
          const response = await axios.get(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/product-categories/${companyId}`);
          if (response.data.success && response.data.data.length > 0) {
            const firstCategory = response.data.data[0];
            setSelectedProductCategory(firstCategory.id);
            // Initialize item categories if Finished Goods
            if (firstCategory.name === 'Finished Goods') {
              setItemCategories([
                { name: 'LED Drivers' },
                { name: 'LED Lights' },
                { name: 'LED Panels' },
                { name: 'Switches' }
              ]);
            }
            await loadItemCategories(companyId, firstCategory.id);
          }
        }, 500);
        setCurrentStep(2);
      } catch (error) {
        console.error('Error saving product categories:', error);
        alert('Failed to save product categories. Please try again.');
      }
    } else if (currentStep === 2) {
      if (selectedProductCategory && itemCategories.length > 0) {
        // Save item categories
        try {
          await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/item-categories', {
            companyId,
            productCategoryId: selectedProductCategory,
            categories: itemCategories.filter(c => c.name.trim())
          });
          await loadItemCategories(companyId, selectedProductCategory);
          if (itemCategoriesList.length > 0) {
            setSelectedItemCategory(itemCategoriesList[0].id!);
          }
          setCurrentStep(3);
        } catch (error) {
          console.error('Error saving item categories:', error);
          alert('Failed to save item categories. Please try again.');
        }
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (selectedItemCategory && subCategories.length > 0) {
        // Save sub categories
        try {
          await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/sub-categories', {
            companyId,
            itemCategoryId: selectedItemCategory,
            categories: subCategories.filter(c => c.name.trim())
          });
        } catch (error) {
          console.error('Error saving sub categories:', error);
        }
      }
      setCurrentStep(4);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Save vendors
      if (vendors.length > 0) {
        await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/vendors', {
          companyId,
          vendors: vendors.filter(v => v.name.trim())
        });
      }

      // Save brands
      if (brands.length > 0) {
        await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/brands', {
          companyId,
          brands: brands.filter(b => b.name.trim())
        });
      }

      // Mark onboarding as complete
      await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/complete', {
        companyId
      });

      // Redirect to library
      navigate('/app/library');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1 Handlers
  const saveProductCategory = async (index: number) => {
    const category = productCategories[index];
    if (!category.name.trim()) {
      alert('Please enter a category name.');
      return;
    }

    try {
      await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/product-categories', {
        companyId,
        categories: [category]
      });
      await loadProductCategories(companyId);
      // Remove from local state after saving
      setProductCategories(productCategories.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error saving product category:', error);
      alert('Failed to save product category.');
    }
  };

  const removeProductCategory = async (index: number, categoryId?: number) => {
    if (!window.confirm('Are you sure you want to delete this product category?')) {
      return;
    }

    // If it's a saved item (has ID), delete from database
    if (categoryId) {
      try {
        await axios.delete(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/product-categories/${categoryId}`);
        await loadProductCategories(companyId);
      } catch (error) {
        console.error('Error deleting product category:', error);
        alert('Failed to delete product category');
        return;
      }
    } else {
      // Remove from local state
      setProductCategories(productCategories.filter((_, i) => i !== index));
    }
  };

  // Step 2 Handlers
  const handleProductCategoryChange = async (id: number) => {
    setSelectedProductCategory(id);
    setItemCategories([]);
    await loadItemCategories(companyId, id);
  };

  const saveItemCategory = async (index: number) => {
    const category = itemCategories[index];
    if (!category.name.trim()) {
      alert('Please enter a category name.');
      return;
    }
    if (!selectedProductCategory) {
      alert('Please select a product category first.');
      return;
    }

    try {
      await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/item-categories', {
        companyId,
        productCategoryId: selectedProductCategory,
        categories: [category]
      });
      await loadItemCategories(companyId, selectedProductCategory);
      // Remove from local state after saving
      setItemCategories(itemCategories.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error saving item category:', error);
      alert('Failed to save item category.');
    }
  };

  const removeItemCategory = async (index: number, categoryId?: number) => {
    if (!window.confirm('Are you sure you want to delete this item category?')) {
      return;
    }

    // If it's a saved item (has ID), delete from database
    if (categoryId && selectedProductCategory) {
      try {
        await axios.delete(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/item-categories/${categoryId}`);
        await loadItemCategories(companyId, selectedProductCategory);
      } catch (error) {
        console.error('Error deleting item category:', error);
        alert('Failed to delete item category');
        return;
      }
    } else {
      // Remove from local state
      setItemCategories(itemCategories.filter((_, i) => i !== index));
    }
  };

  // Step 3 Handlers
  const handleItemCategoryChange = (id: number) => {
    setSelectedItemCategory(id);
    setSubCategories([]);
    // Initialize with defaults for "LED Lights"
    if (itemCategoriesList.find(c => c.id === id)?.name === 'LED Lights') {
      setSubCategories([
        { name: 'Indoor LED' },
        { name: 'Outdoor LED' },
        { name: 'Street Lights' },
        { name: 'Panel Lights' }
      ]);
    }
  };

  const saveSubCategory = async (index: number) => {
    const category = subCategories[index];
    if (!category.name.trim()) {
      alert('Please enter a category name.');
      return;
    }
    if (!selectedItemCategory) {
      alert('Please select an item category first.');
      return;
    }

    try {
      await axios.post('inventory-management-backend-production-4101.up.railway.app/api/onboarding/sub-categories', {
        companyId,
        itemCategoryId: selectedItemCategory,
        categories: [category]
      });
      // Remove from local state after saving
      setSubCategories(subCategories.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error saving sub category:', error);
      alert('Failed to save sub category.');
    }
  };

  const removeSubCategory = async (index: number, categoryId?: number) => {
    if (!window.confirm('Are you sure you want to delete this sub category?')) {
      return;
    }

    // If it's a saved item (has ID), delete from database
    if (categoryId && selectedItemCategory) {
      try {
        await axios.delete(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/sub-categories/${categoryId}`);
        // Reload sub categories if needed
      } catch (error) {
        console.error('Error deleting sub category:', error);
        alert('Failed to delete sub category');
        return;
      }
    } else {
      // Remove from local state
      setSubCategories(subCategories.filter((_, i) => i !== index));
    }
  };

  // Step 4 Handlers
  const addVendor = () => {
    if (!newVendor.name.trim()) {
      alert('Vendor name is required.');
      return;
    }
    setVendors([...vendors, { ...newVendor }]);
    setNewVendor({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      gstNumber: '',
      address: '',
      city: '',
      state: '',
      pin: ''
    });
  };

  const removeVendor = async (index: number, vendorId?: number) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    // If it's a saved item (has ID), delete from database
    if (vendorId) {
      try {
        await axios.delete(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/vendors/${vendorId}`);
        setVendors(vendors.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor');
        return;
      }
    } else {
      // Remove from local state
      setVendors(vendors.filter((_, i) => i !== index));
    }
  };

  const addBrand = () => {
    if (newBrand.name.trim()) {
      setBrands([...brands, { ...newBrand }]);
      setNewBrand({ name: '' });
    }
  };

  const removeBrand = async (index: number, brandId?: number) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    // If it's a saved item (has ID), delete from database
    if (brandId) {
      try {
        await axios.delete(`inventory-management-backend-production-4101.up.railway.app/api/onboarding/brands/${brandId}`);
        setBrands(brands.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Failed to delete brand');
        return;
      }
    } else {
      // Remove from local state
      setBrands(brands.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ONBOARDING WIZARD - Step {currentStep} of 4
          </h1>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Components */}
        {currentStep === 1 && (
          <Step1ProductCategories
            productCategories={productCategories}
            productCategoriesList={productCategoriesList}
            onUpdate={(index, field, value) => {
              const updated = [...productCategories];
              updated[index] = { ...updated[index], [field]: value };
              setProductCategories(updated);
            }}
            onAdd={() => setProductCategories([...productCategories, { name: '' }])}
            onSave={saveProductCategory}
            onDelete={removeProductCategory}
            onNext={handleNext}
            onSkip={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2ItemCategories
            selectedProductCategory={selectedProductCategory}
            productCategoriesList={productCategoriesList}
            itemCategories={itemCategories}
            itemCategoriesList={itemCategoriesList}
            onProductCategoryChange={handleProductCategoryChange}
            onUpdate={(index, field, value) => {
              const updated = [...itemCategories];
              updated[index] = { ...updated[index], [field]: value };
              setItemCategories(updated);
            }}
            onAdd={() => setItemCategories([...itemCategories, { name: '' }])}
            onSave={saveItemCategory}
            onDelete={removeItemCategory}
            onNext={handleNext}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3SubCategories
            selectedItemCategory={selectedItemCategory}
            itemCategoriesList={itemCategoriesList}
            subCategories={subCategories}
            onItemCategoryChange={handleItemCategoryChange}
            onUpdate={(index, field, value) => {
              const updated = [...subCategories];
              updated[index] = { ...updated[index], [field]: value };
              setSubCategories(updated);
            }}
            onAdd={() => setSubCategories([...subCategories, { name: '' }])}
            onSave={saveSubCategory}
            onDelete={removeSubCategory}
            onNext={handleNext}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4VendorsBrands
            vendors={vendors}
            brands={brands}
            newVendor={newVendor}
            newBrand={newBrand}
            onVendorChange={(field, value) => setNewVendor({ ...newVendor, [field]: value })}
            onBrandChange={(field, value) => setNewBrand({ ...newBrand, [field]: value })}
            onAddVendor={addVendor}
            onAddBrand={addBrand}
            onDeleteVendor={removeVendor}
            onDeleteBrand={removeBrand}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(3)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
