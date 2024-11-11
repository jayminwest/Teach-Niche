import React from 'react';
import { PRICE_OPTIONS } from '../constants';

const PriceSelector = ({ cost, onCostChange, customPrice, setCustomPrice }) => {
  return (
    <div className="pt-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Set your price
        </label>
        <div className="relative group">
          <div className="cursor-help text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            Suggested pricing: $1 for every 2 minutes of video content
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>
      <div className="mt-1 flex gap-3">
        <select
          id="cost"
          name="cost"
          className="block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={customPrice ? "custom" : cost.toString()}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setCustomPrice(true);
              onCostChange("");
            } else {
              setCustomPrice(false);
              onCostChange(e.target.value);
            }
          }}
          required
        >
          {PRICE_OPTIONS.map((price) => (
            <option key={price} value={price.toString()}>
              ${price}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        {customPrice && (
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={cost}
              onChange={(e) => onCostChange(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceSelector; 