# QuickBid - Live Auction Platform

A full-stack real-time auction platform where users can browse active auctions, place bids in real-time, and watch prices update live.

## Features

- **Browse Auctions**: Paginated, filterable auction list with live countdown timers
- **Auction Details**: View bid history, place bids, and watch real-time price updates
- **Authentication**: JWT-based auth - anyone can browse, but must sign in to bid
- **Dashboard**: Track your bidding activity (total bids, auctions won, total spent)
- **Real-time**: WebSocket connection for instant bid updates (optional polling fallback)

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Hono (lightweight HTTP framework)
- Prisma ORM + PostgreSQL
- JWT Authentication
- WebSocket (ws library)

**Frontend:**
- Next.js 15 + TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Axios

**Infrastructure:**
- Docker + Docker Compose

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### Run with Docker

```bash
# Clone the repository
git clone https://www.github.com/maverickk6/quickbid-app
cd quickbid-app

# Start all services
docker compose up --build

# Wait for services to start, then visit:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Manual Development Setup

**Backend:**
```bash
cd backend
npm install

# Set up PostgreSQL (via Docker or local)
docker run -d --name quickbid-postgres \
  -e POSTGRES_USER=quickbid \
  -e POSTGRES_PASSWORD=quickbid \
  -e POSTGRES_DB=quickbid \
  -p 5432:5432 postgres:16-alpine

# Run migrations
npx prisma migrate dev

# Seed database with 500 auctions
npm run seed

# Start dev server
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Sketch

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login, receive JWT
GET    /api/auctions               # List with filters (public)
GET    /api/auctions/:id            # Get auction + bid history
POST   /api/bids                   # Place bid (auth required)
GET    /api/dashboard              # User stats (auth required)
```

Query params: `?status=ACTIVE&category=Electronics&minPrice=100&page=1&limit=20`

## Decisions & Trade-offs

### 1. Denormalized currentPrice on Auction
**Decision:** Store `currentPrice` on the Auction model instead of computing via MAX query.

**Trade-off:** 
- **Pro:** Fast reads (no aggregation query)
- **Con:** Must update atomically with bid (handled via transaction)

**Alternative:** Database view with window function - rejected for read performance.

### 2. JWT vs Session Cookies
**Decision:** JWT stored in localStorage.

**Trade-off:**
- **Pro:** Stateless, works with multiple backend instances
- **Con:** XSS vulnerability (mitigated by short expiry)

**Production path:** httpOnly cookies with CSRF protection.

### 3. WebSocket vs Server-Sent Events
**Decision:** WebSockets for bidirectional communication.

**Trade-off:**
- **Pro:** Bidirectional (bid placement + updates)
- **Con:** More complex connection management

### 4. Prisma vs Raw SQL
**Decision:** Prisma ORM with raw SQL for complex aggregations.

**Trade-off:**
- **Pro:** Type-safe, fast development, automatic migrations
- **Con:** Slight performance overhead (acceptable for this scale)

### 5. Pagination vs Infinite Scroll
**Decision:** Traditional pagination (page + limit).

**Trade-off:**
- **Pro:** Predictable URLs, easier caching, shareable links
- **Con:** Less modern UX feel

## Testing Approach

### Unit Tests
- Bid validation logic
- JWT token generation/verification
- WebSocket message formatting

### Integration Tests
- Database transaction behavior (concurrent bidding)
- API endpoints with test database
- Authentication middleware

### E2E Tests
- User registration → login → bid flow
- Real-time updates across multiple browsers
- Auction ending and winner determination

### Manual Testing Checklist
- [ ] Place bid below current price (rejected)
- [ ] Two users bid simultaneously (only one wins)
- [ ] Auction ends while user watching (timer stops)
- [ ] Dashboard numbers accurate after multiple bids
- [ ] JWT expiry handles gracefully (redirect to login)

## If I Had More Time

1. **Image Uploads**: S3 integration for auction images
2. **Auto-bid (Proxy Bidding)**: Users set max bid, system auto-increments
3. **Rate Limiting**: Redis-based rate limiting for bid placement
4. **Search**: Full-text search with PostgreSQL tsvector
5. **Notifications**: Email notifications for outbid/won auctions

## Project Structure

```
quickbid-app/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── server.ts         # Hono app config
│   │   ├── db/prisma.ts      # Database client
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts
│   │   │   ├── auctions.ts
│   │   │   ├── bids.ts
│   │   │   └── dashboard.ts
│   │   └── utils/seed.ts     # Database seeding
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app router
│   │   │   ├── page.tsx      # Auction list
│   │   │   ├── auction/[id]/ # Auction detail
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Register page
│   │   ├── components/       # React components
│   │   ├── contexts/         # Auth context
│   │   ├── hooks/            # TanStack Query hooks
│   │   └── lib/              # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## License

MIT
