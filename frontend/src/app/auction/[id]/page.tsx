'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuction, usePlaceBid, useBidHistory } from '@/hooks/useAuctions';
import { CountdownTimer } from '@/components/CountdownTimer';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketStore, useAuctionWebSocket } from '@/stores/websocketStore';
import { useQueryClient } from '@tanstack/react-query';

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params?.id as string;
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: auctionData, isLoading: auctionLoading, error: auctionError } = useAuction(auctionId);
  const { data: bidsData, error: bidsError } = useBidHistory(auctionId);
  const placeBid = usePlaceBid();
  const ws = useAuctionWebSocket(auctionId);
  const { connect } = useWebSocketStore();

  if (auctionError || bidsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          Error loading auction. Please try again.
        </div>
        <Link href="/" className="mt-4 text-primary hover:underline inline-block">
          ← Back to auctions
        </Link>
      </div>
    );
  }

  const auction = auctionData?.data;
  const bids = bidsData?.data || [];

  useEffect(() => {
    if (auctionId && auction && !auctionError) {
      connect();
      const store = useWebSocketStore.getState();
      store.subscribeToAuction(auctionId);
      return () => {
        store.unsubscribeFromAuction(auctionId);
      };
    }
  }, [auctionId, auction, auctionError, connect]);

  useEffect(() => {
    if (ws?.lastBidUpdate && auctionId) {
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['bids', auctionId] });
    }
  }, [ws?.lastBidUpdate, auctionId, queryClient]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError('');

    const amount = Number(bidAmount);
    if (!amount || amount <= 0) {
      setBidError('Please enter a valid bid amount');
      return;
    }

    placeBid.mutate(
      { auctionId, amount },
      {
        onSuccess: () => {
          setBidAmount('');
          setBidError('');
        },
        onError: (error: any) => {
          setBidError(error.response?.data?.error || 'Failed to place bid');
        },
      }
    );
  };

  if (auctionLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          Auction not found.
        </div>
        <Link href="/" className="mt-4 text-primary hover:underline inline-block">
          ← Back to auctions
        </Link>
      </div>
    );
  }

  const isActive = auction.status === 'ACTIVE';
  const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
  const isActuallyActive = isActive && timeLeft > 0;
  const minBid = auction.currentPrice + auction.minIncrement;

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Back to auctions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Auction Details */}
        <div className="lg:col-span-2">
          {/* Category & Live Indicator */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-md font-medium">
              {auction.category}
            </span>
            {ws?.isConnected && isActuallyActive && (
              <span className="inline-flex items-center gap-1.5 bg-live/10 text-live text-sm px-3 py-1 rounded-md animate-pulse font-medium">
                <span className="w-2 h-2 bg-live rounded-full"></span>
                Live
              </span>
            )}
            {ws?.lastBidUpdate && (
              <span className="text-sm text-live font-medium animate-pulse">
                New bid just placed!
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {auction.title}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6 whitespace-pre-line">
            {auction.description}
          </p>

          {/* Bid History */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Bid History ({bids.length})
            </h2>
            
            {bids.length === 0 ? (
              <p className="text-muted-foreground italic">No bids yet. Be the first to bid!</p>
            ) : (
              <div className="space-y-3">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`flex justify-between items-center p-3 rounded-md ${
                      bid.isWinning
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-muted'
                    }`}
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {bid.user?.name || 'Anonymous'}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(bid.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-foreground">
                        ${bid.amount.toFixed(2)}
                      </span>
                      {bid.isWinning && (
                        <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded font-medium">
                          Winning
                        </span>
                      )}
                      {index === bids.length - 1 && !bid.isWinning && (
                        <span className="bg-muted-foreground/30 text-muted-foreground text-xs px-2 py-1 rounded font-medium">
                          Outbid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Bidding Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm border p-6 sticky top-20">
            {/* Current Price */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-4xl font-bold text-success">
                ${auction.currentPrice.toFixed(2)}
              </p>
            </div>

            {/* Timer */}
            <div className="text-center mb-6 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-1">
                {isActuallyActive ? 'Ends in' : 'Auction ended'}
              </p>
              <CountdownTimer
                endTime={auction.endTime}
                onEnd={() => {
                  // Optional: refresh when auction ends
                  // window.location.reload();
                }}
              />
            </div>

            {/* Starting Price */}
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted-foreground">Starting Price:</span>
              <span className="font-medium text-foreground">
                ${auction.startingPrice.toFixed(2)}
              </span>
            </div>

            {/* Min Increment */}
            <div className="flex justify-between text-sm mb-6">
              <span className="text-muted-foreground">Min Increment:</span>
              <span className="font-medium text-foreground">
                ${auction.minIncrement.toFixed(2)}
              </span>
            </div>

            {/* Bid Form or Login Prompt */}
            {isActuallyActive ? (
              isAuthenticated ? (
                <form onSubmit={handlePlaceBid}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Your Bid (min: ${minBid.toFixed(2)})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min={minBid}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={minBid.toFixed(2)}
                        className="w-full border border-input bg-background rounded-md pl-8 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                  </div>

                  {bidError && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                      {bidError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={placeBid.isPending}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {placeBid.isPending ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="text-muted-foreground mb-3">
                    Sign in to place a bid
                  </p>
                  <Link
                    href="/login"
                    className="inline-block w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
                  >
                    Sign in to Bid
                  </Link>
                </div>
              )
            ) : (
              <div className="text-center p-4 bg-muted rounded-md">
                <p className="text-muted-foreground font-medium">
                  {auction.status === 'ENDED'
                    ? 'This auction has ended'
                    : 'This auction is cancelled'}
                </p>
              </div>
            )}

            {/* Total Bids */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''} placed
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
