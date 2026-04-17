import { Hono } from 'hono'
import { prisma } from '../db/prisma'

export const auctionRoutes = new Hono()

auctionRoutes.get('/', async (c) => {
  const auctions = await prisma.auction.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  return c.json(auctions)
})