import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auctionRoutes } from './routes/auctions'
import { bidRoutes } from './routes/bids'
import { dashboardRoutes } from './routes/dashboard'
import { authRoutes } from './routes/auth'

export const app = new Hono()

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.get('/', (c) => {
  return c.json({ message: 'QuickBid API running' })
})

app.route('/api/auth', authRoutes)
app.route('/api/auctions', auctionRoutes)
app.route('/api/bids', bidRoutes)
app.route('/api/dashboard', dashboardRoutes)