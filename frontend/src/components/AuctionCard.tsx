'use client';

import Link from 'next/link';
import { Auction } from '@/lib/api';
import { CountdownTimer } from './CountdownTimer';

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const isEnded = auction.status === 'ENDED';
  const isActive = auction.status === 'ACTIVE';

  return (
    <Link href={`/auction/${auction.id}`}>
      <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all p-4 border cursor-pointer h-full flex flex-col group">
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md font-medium">
            {auction.category}
          </span>
          {isEnded && (
            <span className="inline-block bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-md font-medium">
              Ended
            </span>
          )}
          {isActive && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-live">
              <span className="w-1.5 h-1.5 bg-live rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-2 flex-grow group-hover:text-primary transition-colors">
          {auction.title}
        </h3>

        {/* Description Preview */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {auction.description}
        </p>

        {/* Price Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Current Bid:</span>
            <span className="text-xl font-bold text-success">
              ${auction.currentPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground/70">Starting:</span>
            <span className="text-muted-foreground">
              ${auction.startingPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-sm">
            {isActive ? (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Ends in:</span>
                <CountdownTimer endTime={auction.endTime} />
              </div>
            ) : (
              <span className="text-muted-foreground">
                {auction._count.bids} bids
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
