import { Hono } from 'hono';
import { prisma } from '../db/prisma';
import { authMiddleware } from '../middleware/auth';

export const dashboardRoutes = new Hono();

// GET /api/dashboard
dashboardRoutes.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const userId = user.id;
  
  const [
    totalBids,
    auctionsWon,
    totalSpentResult,
    activeBids,
    bidHistory,
  ] = await Promise.all([
    prisma.bid.count({ where: { userId } }),
    prisma.auction.count({
      where: {
        status: 'ENDED',
        bids: { some: { userId, isWinning: true } },
      },
    }),
    prisma.bid.aggregate({
      where: {
        userId,
        isWinning: true,
        auction: { status: 'ENDED' },
      },
      _sum: { amount: true },
    }),
    prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        bids: { some: { userId, isWinning: true } },
      },
      include: { _count: { select: { bids: true } } },
      orderBy: { endTime: 'asc' },
    }),
    prisma.bid.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        auction: {
          select: { id: true, title: true, status: true, currentPrice: true, endTime: true },
        },
      },
    }),
  ]);
  
  return c.json({
    data: {
      summary: {
        totalBids,
        auctionsWon,
        totalSpent: totalSpentResult._sum.amount || 0,
        activeAuctions: activeBids.length,
      },
      activeBids,
      recentBids: bidHistory,
    },
  });
});

// GET /api/dashboard/stats
dashboardRoutes.get('/stats', authMiddleware, async (c) => {
  const user = c.get('user');
  const userId = user.id;
  
  const [totalBids, auctionsWon, activeAuctions] = await Promise.all([
    prisma.bid.count({ where: { userId } }),
    prisma.auction.count({
      where: { status: 'ENDED', bids: { some: { userId, isWinning: true } } },
    }),
    prisma.auction.count({
      where: { status: 'ACTIVE', bids: { some: { userId, isWinning: true } } },
    }),
  ]);
  
  return c.json({ data: { totalBids, auctionsWon, activeAuctions } });
});
