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
      <div className="flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to view your bidding activity and manage your auctions.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          Failed to load dashboard. Please try again later.
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return null;

  const { summary, activeBids, recentBids } = dashboard;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your bidding activity and manage your auctions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Bids</p>
          <p className="text-3xl font-bold text-foreground">{summary.totalBids}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <p className="text-sm text-muted-foreground mb-1">Auctions Won</p>
          <p className="text-3xl font-bold text-success">{summary.auctionsWon}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-primary">
            ${summary.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <p className="text-sm text-muted-foreground mb-1">Active Bids</p>
          <p className="text-3xl font-bold text-warning">
            {summary.activeAuctions}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Bids Section */}
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Active Bids ({activeBids.length})
          </h2>
          
          {activeBids.length === 0 ? (
            <p className="text-muted-foreground italic">
              You don&apos;t have any active bids.{' '}
              <Link href="/" className="text-primary hover:underline">
                Browse auctions
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {activeBids.map((auction) => {
                const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
                const isActuallyActive = auction.status === 'ACTIVE' && timeLeft > 0;
                const displayStatus = isActuallyActive ? 'ACTIVE' : auction.status;

                return (
                <Link
                  key={auction.id}
                  href={`/auction/${auction.id}`}
                  className="block border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-foreground line-clamp-1">
                      {auction.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${
                        isActuallyActive
                          ? 'bg-live/10 text-live'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Current:{' '}
                      <span className="font-semibold text-success">
                        ${auction.currentPrice.toFixed(2)}
                      </span>
                    </span>
                    <CountdownTimer endTime={auction.endTime} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {auction._count.bids} bids
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bids Section */}
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bid History</h2>
          
          {recentBids.length === 0 ? (
            <p className="text-muted-foreground italic">
              No bid history yet.{' '}
              <Link href="/" className="text-primary hover:underline">
                Start bidding
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {recentBids.map((bid) => (
                <Link
                  key={bid.id}
                  href={bid.auction?.id ? `/auction/${bid.auction.id}` : '#'}
                  className="flex justify-between items-center p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground line-clamp-1">
                      {bid.auction?.title || 'Unknown Auction'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${bid.amount.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        bid.isWinning
                          ? 'text-success'
                          : 'text-muted-foreground'
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
    </div>
  );
}
