'use client';

import { useState } from 'react';
import { useAuctions } from '@/hooks/useAuctions';
import { AuctionCard } from '@/components/AuctionCard';
import { FilterBar } from '@/components/FilterBar';

export default function Home() {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAuctions({
    status: filters.status || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    page,
    limit: 20,
  });

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Auctions
        </h1>
        <p className="text-gray-600">
          Discover unique items and place your bids in real-time.
        </p>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load auctions. Please try again later.
        </div>
      )}

      {/* Auction Grid */}
      {data?.data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>

          {/* Empty State */}
          {data.data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No auctions found matching your filters.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    status: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                  })
                }
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {data.data.length} of {data.meta.total} auctions
          </div>
        </>
      )}
    </main>
  );
}
