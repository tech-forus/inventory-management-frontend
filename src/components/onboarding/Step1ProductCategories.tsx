import React from 'react';
import { Package, Plus, Save, Trash2, ArrowRight } from 'lucide-react';

interface ProductCategory {
  id?: number;
  name: string;
  description?: string;
}

interface Step1ProductCategoriesProps {
  productCategories: ProductCategory[];
  productCategoriesList: ProductCategory[];
  onUpdate: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onSave: (index: number) => void;
  onDelete: (index: number, categoryId?: number) => void;
  onNext: () => void;
  onSkip: () => void;
}

const Step1ProductCategories: React.FC<Step1ProductCategoriesProps> = ({
  productCategories,
  productCategoriesList,
  onUpdate,
  onAdd,
  onSave,
  onDelete,
  onNext,
  onSkip
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Setup Product Categories</h2>
      </div>
      <p className="text-gray-600 mb-6">"Let's organize your inventory structure"</p>

      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Categories (Main Groups):
        </label>
        <div className="border border-gray-300 rounded-lg p-4 space-y-3">
          {productCategories.map((category, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 flex-1">• {category.name || 'New Category'}</span>
              <input
                type="text"
                value={category.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Category name"
                required
              />
              <div className="flex items-center gap-2">
                {!category.id && (
                  <button
                    type="button"
                    onClick={() => onSave(index)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 transition-colors"
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(index, category.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          ))}
          {productCategoriesList.map((category) => (
            <div key={`saved-${category.id}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-gray-700 flex-1">• {category.name}</span>
              <span className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded">Saved</span>
              <button
                type="button"
                onClick={() => onDelete(-1, category.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Product Category
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onSkip}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Step1ProductCategories;

