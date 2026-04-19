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

# Seed database with 600 auctions
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

I made a few key technical decisions while building this project:

**Storing currentPrice on the Auction model** - Instead of calculating the highest bid every time, I store the current price directly on the auction. This makes reads much faster since we don't need to run an aggregation query. The trade-off is that I need to update it atomically whenever a bid is placed, which I handle with a database transaction.

**JWT for authentication** - I went with JWT tokens stored in localStorage. This keeps the backend stateless and makes it easier to scale with multiple backend instances. For a production app, I'd probably switch to httpOnly cookies with CSRF protection for better security against XSS attacks.

**WebSockets for real-time updates** - I chose WebSockets over Server-Sent Events because I needed bidirectional communication (both sending bids and receiving updates). It's a bit more complex to manage connections, but it gives me the flexibility I need.

**Prisma ORM** - Using Prisma made development much faster with its type safety and automatic migrations. There's a slight performance overhead compared to raw SQL, but for this scale it's not a problem.

**Traditional pagination** - I went with classic page-based pagination instead of infinite scroll. It makes URLs predictable and shareable, and caching is simpler. The downside is it's not as modern-feeling as infinite scroll, but it's more practical for this use case.

## Testing Approach

For testing, I'd focus on a few key areas:

**Unit tests** would cover the core logic like bid validation, JWT token handling, and WebSocket message formatting.

**Integration tests** would verify that database transactions work correctly when multiple people bid at the same time, that API endpoints behave as expected with a test database, and that the authentication middleware properly protects routes.

**End-to-end tests** would simulate real user flows - like registering, logging in, and placing a bid. I'd also test that real-time updates work across multiple browser windows, and that auctions end correctly with the right winner determined.

For manual testing, I'd check things like:
- Bids below the current price get rejected
- When two users bid simultaneously, only one wins
- The timer stops when an auction ends
- Dashboard stats stay accurate after multiple bids
- JWT expiry redirects users to login gracefully

## If I Had More Time

There are a few features I'd love to add if I had more time:

**Image uploads** - I'd integrate with S3 so users can upload actual photos for their auctions instead of using placeholders.

**Auto-bidding (proxy bidding)** - Users could set a maximum bid and the system would automatically increment for them when they get outbid, so they don't have to watch the auction constantly.

**Rate limiting** - I'd add Redis-based rate limiting to prevent abuse and ensure fair bidding.

**Search** - A full-text search feature using PostgreSQL's tsvector would make it easier for users to find specific items.

**Notifications** - Email notifications when you get outbid or win an auction would be a nice touch to keep users engaged.

## Project Structure

```
quickbid-app/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── server.ts         # Hono app config
│   │   ├── db/               # Database client
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts
│   │   │   ├── auctions.ts
│   │   │   ├── bids.ts
│   │   │   └── dashboard.ts
│   │   ├── utils/            # Database seeding
│   │   └── websocket/        # WebSocket server
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── prisma.config.ts
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
│   │   ├── lib/              # API client
│   │   └── stores/           # Zustand stores
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

## License

MIT
