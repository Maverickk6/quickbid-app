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
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 cursor-pointer h-full flex flex-col">
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {auction.category}
          </span>
          {isEnded && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              Ended
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 flex-grow">
          {auction.title}
        </h3>

        {/* Description Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {auction.description}
        </p>

        {/* Price Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Current Bid:</span>
            <span className="text-xl font-bold text-green-600">
              ${auction.currentPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Starting:</span>
            <span className="text-gray-500">
              ${auction.startingPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-sm">
            {isActive ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Ends in:</span>
                <CountdownTimer endTime={auction.endTime} />
              </div>
            ) : (
              <span className="text-gray-500">
                {auction._count.bids} bids
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
