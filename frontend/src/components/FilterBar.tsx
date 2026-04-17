'use client';

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

  const handleChange = (key: keyof typeof filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
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
            value={filters.status}
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
            value={filters.category}
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
            value={filters.minPrice}
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
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="Any"
            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.status || filters.category || filters.minPrice || filters.maxPrice) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() =>
              onFilterChange({
                status: '',
                category: '',
                minPrice: '',
                maxPrice: '',
              })
            }
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
