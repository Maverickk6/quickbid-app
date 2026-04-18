'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useAuctions';

interface FilterBarProps {
  filters: {
    status: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: (filters: {
    status: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key: keyof typeof localFilters, value: string) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      status: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Category
          </label>
          <select
            value={localFilters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Min Price ($)
          </label>
          <input
            type="number"
            value={localFilters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            placeholder="0"
            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Max Price ($)
          </label>
          <input
            type="number"
            value={localFilters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="Any"
            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Apply and Clear Buttons */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleClear}
          disabled={!localFilters.status && !localFilters.category && !localFilters.minPrice && !localFilters.maxPrice}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear all filters
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
