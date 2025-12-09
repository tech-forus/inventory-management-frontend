import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { skuService } from '../services/skuService';
import { libraryService } from '../services/libraryService';
import { validateRequired } from '../utils/validators';

interface FormData {
  skuId: string;
  autoGenerateSKU: boolean;
  productCategoryId: string;
  itemCategoryId: string;
  subCategoryId: string;
  itemName: string;
  itemDetails: string;
  vendorId: string;
  vendorItemCode: string;
  brandId: string;
  hsnSacCode: string;
  ratingSize: string;
  model: string;
  series: string;
  unit: string;
  material: string;
  insulation: string;
  inputSupply: string;
  color: string;
  cri: string;
  cct: string;
  beamAngle: string;
  ledType: string;
  shape: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  currentStock: string;
  minStockLevel: string;
  defaultStorageLocation: string;
}

const SKUCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOptionalSpecs, setShowOptionalSpecs] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    skuId: '',
    autoGenerateSKU: true,
    productCategoryId: '',
    itemCategoryId: '',
    subCategoryId: '',
    itemName: '',
    itemDetails: '',
    vendorId: '',
    vendorItemCode: '',
    brandId: '',
    hsnSacCode: '',
    ratingSize: '',
    model: '',
    series: '',
    unit: 'Pieces',
    material: '',
    insulation: '',
    inputSupply: '',
    color: '',
    cri: '',
    cct: '',
    beamAngle: '',
    ledType: '',
    shape: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    currentStock: '',
    minStockLevel: '',
    defaultStorageLocation: '',
  });

  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.productCategoryId) {
      loadItemCategories(parseInt(formData.productCategoryId));
    } else {
      setItemCategories([]);
      setFormData((prev) => ({ ...prev, itemCategoryId: '', subCategoryId: '' }));
    }
  }, [formData.productCategoryId]);

  useEffect(() => {
    if (formData.itemCategoryId) {
      loadSubCategories(parseInt(formData.itemCategoryId));
    } else {
      setSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategoryId: '' }));
    }
  }, [formData.itemCategoryId]);

  const loadInitialData = async () => {
    try {
      const [productCats, vendorsData, brandsData] = await Promise.all([
        libraryService.getProductCategories(),
        libraryService.getVendors(),
        libraryService.getBrands(),
      ]);
      setProductCategories(productCats.data || []);
      setVendors(vendorsData.data || []);
      setBrands(brandsData.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadItemCategories = async (productCategoryId: number) => {
    try {
      const response = await libraryService.getItemCategories(productCategoryId);
      setItemCategories(response.data || []);
    } catch (error) {
      console.error('Error loading item categories:', error);
    }
  };

  const loadSubCategories = async (itemCategoryId: number) => {
    try {
      const response = await libraryService.getSubCategories(itemCategoryId);
      setSubCategories(response.data || []);
    } catch (error) {
      console.error('Error loading sub categories:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.autoGenerateSKU && !validateRequired(formData.skuId)) {
      newErrors.skuId = 'SKU ID is required';
    }
    if (!validateRequired(formData.productCategoryId)) {
      newErrors.productCategoryId = 'Product Category is required';
    }
    if (!validateRequired(formData.itemCategoryId)) {
      newErrors.itemCategoryId = 'Item Category is required';
    }
    if (!validateRequired(formData.itemName)) {
      newErrors.itemName = 'Item Name is required';
    }
    if (!validateRequired(formData.vendorId)) {
      newErrors.vendorId = 'Vendor is required';
    }
    if (!validateRequired(formData.brandId)) {
      newErrors.brandId = 'Brand is required';
    }
    if (!validateRequired(formData.unit)) {
      newErrors.unit = 'Unit is required';
    }
    if (!validateRequired(formData.currentStock)) {
      newErrors.currentStock = 'Current Stock is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    if (!saveAsDraft && !validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        productCategoryId: parseInt(formData.productCategoryId),
        itemCategoryId: parseInt(formData.itemCategoryId),
        subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
        vendorId: parseInt(formData.vendorId),
        brandId: parseInt(formData.brandId),
        currentStock: parseInt(formData.currentStock) || 0,
        minStockLevel: parseInt(formData.minStockLevel),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        status: saveAsDraft ? 'draft' : 'active',
      };

      await skuService.create(payload);
      navigate('/app/sku');
    } catch (error: any) {
      console.error('Error creating SKU:', error);
      alert(error.response?.data?.error || 'Failed to create SKU');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/sku')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New SKU</h1>
      </div>

      <form className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.autoGenerateSKU}
                  onChange={(e) => {
                    handleChange('autoGenerateSKU', e.target.checked);
                    if (e.target.checked) {
                      handleChange('skuId', '');
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Auto-generate SKU ID</span>
              </label>
            </div>
            {!formData.autoGenerateSKU && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.skuId}
                  onChange={(e) => handleChange('skuId', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.skuId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter SKU ID"
                />
                {errors.skuId && <p className="text-red-500 text-xs mt-1">{errors.skuId}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.productCategoryId}
                onChange={(e) => handleChange('productCategoryId', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.productCategoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Product Category</option>
                {productCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.productCategoryId && (
                <p className="text-red-500 text-xs mt-1">{errors.productCategoryId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.itemCategoryId}
                onChange={(e) => handleChange('itemCategoryId', e.target.value)}
                disabled={!formData.productCategoryId}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                  errors.itemCategoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Item Category</option>
                {itemCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.itemCategoryId && (
                <p className="text-red-500 text-xs mt-1">{errors.itemCategoryId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <select
                value={formData.subCategoryId}
                onChange={(e) => handleChange('subCategoryId', e.target.value)}
                disabled={!formData.itemCategoryId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Sub Category (Optional)</option>
                {subCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.itemName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Details as per Vendor
              </label>
              <textarea
                value={formData.itemDetails}
                onChange={(e) => handleChange('itemDetails', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item details"
              />
            </div>
          </div>
        </div>

        {/* Vendor & Brand Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor & Brand Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.vendorId}
                  onChange={(e) => handleChange('vendorId', e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.vendorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => navigate('/app/library?tab=vendors')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {errors.vendorId && (
                <p className="text-red-500 text-xs mt-1">{errors.vendorId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Item Code
              </label>
              <input
                type="text"
                value={formData.vendorItemCode}
                onChange={(e) => handleChange('vendorItemCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vendor item code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.brandId}
                  onChange={(e) => handleChange('brandId', e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.brandId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => navigate('/app/library?tab=brands')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HSN/SAC Code
              </label>
              <input
                type="text"
                value={formData.hsnSacCode}
                onChange={(e) => handleChange('hsnSacCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HSN/SAC code"
              />
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating/Size
              </label>
              <input
                type="text"
                value={formData.ratingSize}
                onChange={(e) => handleChange('ratingSize', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10W, 12V"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter model"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
              <input
                type="text"
                value={formData.series}
                onChange={(e) => handleChange('series', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter series"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.unit ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Pieces">Pieces</option>
                <option value="Kg">Kg</option>
                <option value="Liters">Liters</option>
                <option value="Meters">Meters</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>
          </div>
        </div>

        {/* Optional Specifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <button
            type="button"
            onClick={() => setShowOptionalSpecs(!showOptionalSpecs)}
            className="flex items-center justify-between w-full text-xl font-semibold text-gray-900 mb-4"
          >
            <span>Optional Specifications</span>
            {showOptionalSpecs ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {showOptionalSpecs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => handleChange('material', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insulation</label>
                <input
                  type="text"
                  value={formData.insulation}
                  onChange={(e) => handleChange('insulation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Input Supply</label>
                <input
                  type="text"
                  value={formData.inputSupply}
                  onChange={(e) => handleChange('inputSupply', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CRI</label>
                <input
                  type="text"
                  value={formData.cri}
                  onChange={(e) => handleChange('cri', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CCT</label>
                <input
                  type="text"
                  value={formData.cct}
                  onChange={(e) => handleChange('cct', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beam Angle</label>
                <input
                  type="text"
                  value={formData.beamAngle}
                  onChange={(e) => handleChange('beamAngle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LED Type</label>
                <input
                  type="text"
                  value={formData.ledType}
                  onChange={(e) => handleChange('ledType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                <input
                  type="text"
                  value={formData.shape}
                  onChange={(e) => handleChange('shape', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.length}
                  onChange={(e) => handleChange('length', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => handleChange('currentStock', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.currentStock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.currentStock && (
                <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => handleChange('minStockLevel', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Storage Location
              </label>
              <input
                type="text"
                value={formData.defaultStorageLocation}
                onChange={(e) => handleChange('defaultStorageLocation', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Warehouse A, Shelf 3"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/app/sku')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create SKU
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SKUCreatePage;

