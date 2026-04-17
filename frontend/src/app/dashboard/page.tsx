'use client';

import Link from 'next/link';
import { useDashboard } from '@/hooks/useAuctions';
import { CountdownTimer } from '@/components/CountdownTimer';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Sign in to view your bidding activity and manage your auctions.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load dashboard. Please try again later.
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return null;

  const { summary, activeBids, recentBids } = dashboard;

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Dashboard
        </h1>
        <p className="text-gray-600">
          Track your bidding activity and manage your auctions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total Bids</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalBids}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Auctions Won</p>
          <p className="text-3xl font-bold text-green-600">{summary.auctionsWon}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-blue-600">
            ${summary.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Active Bids</p>
          <p className="text-3xl font-bold text-orange-600">
            {summary.activeAuctions}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Bids Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Active Bids ({activeBids.length})
          </h2>
          
          {activeBids.length === 0 ? (
            <p className="text-gray-500 italic">
              You don&apos;t have any active bids.{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                Browse auctions
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {activeBids.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auction/${auction.id}`}
                  className="block border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {auction.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        auction.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {auction.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Current:{' '}
                      <span className="font-semibold text-green-600">
                        ${auction.currentPrice.toFixed(2)}
                      </span>
                    </span>
                    <CountdownTimer endTime={auction.endTime} />
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {auction._count.bids} bids
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bids Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bid History</h2>
          
          {recentBids.length === 0 ? (
            <p className="text-gray-500 italic">
              No bid history yet.{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                Start bidding
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {recentBids.map((bid) => (
                <Link
                  key={bid.id}
                  href={`/auction/${bid.auction?.id}`}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {bid.auction?.title || 'Unknown Auction'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${bid.amount.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs ${
                        bid.isWinning
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {bid.isWinning
                        ? bid.auction?.status === 'ENDED'
                          ? 'Won'
                          : 'Winning'
                        : 'Outbid'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
