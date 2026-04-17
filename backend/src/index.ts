import { serve } from '@hono/node-server'
import { app } from './server'
import { startWebSocketServer } from './websocket/websocket'

// Start HTTP REST API server
serve({
  fetch: app.fetch,
  port: 3001,
})

console.log('HTTP server running on port 3001')

// Start WebSocket server for real-time updates
startWebSocketServer(3002)