import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import type { Prisma } from '@prisma/client';

export const auctionRoutes = new Hono();

const listQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'ENDED', 'CANCELLED']).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['endTime', 'currentPrice', 'createdAt']).default('endTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// GET /api/auctions - List with filters and pagination
auctionRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const where: Prisma.AuctionWhereInput = {};
  
  if (query.status) {
    where.status = query.status;
  }
  
  if (query.category) {
    where.category = query.category;
  }
  
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.currentPrice = {};
    if (query.minPrice !== undefined) where.currentPrice.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.currentPrice.lte = query.maxPrice;
  }
  
  const skip = (query.page - 1) * query.limit;
  
  const orderBy: Prisma.AuctionOrderByWithRelationInput = {
    [query.sortBy]: query.sortOrder,
  };
  
  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      take: query.limit,
      skip,
      orderBy,
      include: {
        _count: {
          select: { bids: true },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.auction.count({ where }),
  ]);
  
  return c.json({
    data: auctions,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

// GET /api/auctions/:id
auctionRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: { bids: true },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
  });
  
  if (!auction) {
    return c.json({ error: 'Auction not found' }, 404);
  }
  
  return c.json({ data: auction });
});

// GET /api/auctions/categories
auctionRoutes.get('/categories/all', async (c) => {
  const categories = await prisma.auction.groupBy({
    by: ['category'],
    _count: { category: true },
  });
  
  return c.json({
    data: categories.map(c => ({
      name: c.category,
      count: c._count.category,
    })),
  });
});
