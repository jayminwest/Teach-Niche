import React from 'react';

const CategorySelector = ({ categories, selectedIds, onChange }) => {
  return (
    <div className="border-t border-gray-900/10 pt-8">
      <h3 className="text-base font-semibold leading-7 text-gray-900">Categories</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                value={category.id}
                checked={selectedIds.includes(category.id)}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor={`category-${category.id}`} className="text-gray-900">
                {category.name}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector; 