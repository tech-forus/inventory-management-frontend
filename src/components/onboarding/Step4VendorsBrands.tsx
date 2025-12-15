import React from 'react';
import { Building2, Plus, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';

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

interface Step4VendorsBrandsProps {
  vendors: Vendor[];
  brands: Brand[];
  newVendor: Vendor;
  newBrand: Brand;
  onVendorChange: (field: string, value: string) => void;
  onBrandChange: (field: string, value: string) => void;
  onAddVendor: () => void;
  onAddBrand: () => void;
  onDeleteVendor: (index: number, vendorId?: number) => void;
  onDeleteBrand: (index: number, brandId?: number) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const Step4VendorsBrands: React.FC<Step4VendorsBrandsProps> = ({
  vendors,
  brands,
  newVendor,
  newBrand,
  onVendorChange,
  onBrandChange,
  onAddVendor,
  onAddBrand,
  onDeleteVendor,
  onDeleteBrand,
  onComplete,
  onBack,
  isSubmitting
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Setup Library (Vendors & Brands)</h2>
      </div>

      {/* Vendors Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">Add Vendors:</label>
        <div className="border border-gray-300 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Vendor Name *"
              value={newVendor.name}
              onChange={(e) => onVendorChange('name', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Contact"
              value={newVendor.contactPerson}
              onChange={(e) => onVendorChange('contactPerson', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="GST"
              value={newVendor.gstNumber}
              onChange={(e) => onVendorChange('gstNumber', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={onAddVendor}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </button>
          </div>

          {vendors.map((vendor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <span className="text-gray-700 font-medium">{vendor.name}</span>
                {vendor.contactPerson && (
                  <span className="text-sm text-gray-500 ml-2">({vendor.contactPerson})</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDeleteVendor(index, (vendor as any).id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1 transition-colors"
                title="Delete Vendor"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">Add Brands:</label>
        <div className="border border-gray-300 rounded-lg p-4 space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Brand Name *"
              value={newBrand.name}
              onChange={(e) => onBrandChange('name', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={onAddBrand}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Brand
            </button>
          </div>

          {brands.map((brand, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">{brand.name}</span>
              <button
                type="button"
                onClick={() => onDeleteBrand(index, (brand as any).id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1 transition-colors"
                title="Delete Brand"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Completing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Complete Setup
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4VendorsBrands;

