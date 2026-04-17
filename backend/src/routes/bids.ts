import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { authMiddleware } from '../middleware/auth';
import { broadcastToAuction } from '../websocket/websocket';

export const bidRoutes = new Hono();

const placeBidSchema = z.object({
  auctionId: z.string().uuid(),
  amount: z.number().positive(),
});

// POST /api/bids - Place a bid (requires authentication)
bidRoutes.post('/', authMiddleware, zValidator('json', placeBidSchema), async (c) => {
  const { auctionId, amount } = c.req.valid('json');
  const user = c.get('user');
  const userId = user.id;
  
  try {
    const bid = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });
      
      if (!auction) {
        throw new Error('Auction not found');
      }
      
      if (auction.status !== 'ACTIVE') {
        throw new Error('Auction is not active');
      }
      
      if (new Date() > auction.endTime) {
        throw new Error('Auction has ended');
      }
      
      const minBid = auction.currentPrice + auction.minIncrement;
      if (amount < minBid) {
        throw new Error(`Bid must be at least ${minBid.toFixed(2)}`);
      }
      
      await tx.bid.updateMany({
        where: {
          auctionId,
          isWinning: true,
        },
        data: {
          isWinning: false,
        },
      });
      
      const newBid = await tx.bid.create({
        data: {
          amount,
          userId,
          auctionId,
          isWinning: true,
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
          auction: {
            select: { id: true, title: true, status: true, currentPrice: true, endTime: true },
          },
        },
      });
      
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: amount,
        },
      });
      
      return newBid;
    }, {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000,
    });
    
    broadcastToAuction(auctionId, {
      bidId: bid.id,
      amount: bid.amount,
      user: bid.user,
      currentPrice: bid.amount,
      totalBids: await prisma.bid.count({ where: { auctionId } }),
    });
    
    return c.json({ data: bid }, 201);
  } catch (error: any) {
    if (error.message === 'Auction not found') {
      return c.json({ error: 'Auction not found' }, 404);
    }
    if (error.message.includes('Auction is not active')) {
      return c.json({ error: 'Auction is not active' }, 400);
    }
    if (error.message.includes('Auction has ended')) {
      return c.json({ error: 'Auction has ended' }, 400);
    }
    if (error.message.includes('Bid must be at least')) {
      return c.json({ error: error.message }, 400);
    }
    
    if (error.code === 'P2034') {
      return c.json({ 
        error: 'Another bid was placed. Please check the current price and try again.' 
      }, 409);
    }
    
    console.error('Bid error:', error);
    return c.json({ error: 'Failed to place bid' }, 500);
  }
});

// GET /api/bids/:auctionId - Get bid history for an auction
bidRoutes.get('/:auctionId', async (c) => {
  const auctionId = c.req.param('auctionId');
  
  const bids = await prisma.bid.findMany({
    where: { auctionId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
  
  return c.json({ data: bids });
});
