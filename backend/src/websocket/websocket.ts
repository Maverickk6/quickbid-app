import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const auctionClients = new Map<string, Set<WebSocket>>();

export function startWebSocketServer(port: number = 3002) {
  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let currentAuctionId: string | null = null;

    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const message = Buffer.isBuffer(data) ? data.toString() : String(data);
        const parsed = JSON.parse(message);
        
        if (parsed.type === 'subscribe' && parsed.auctionId) {
          if (currentAuctionId) {
            const prevClients = auctionClients.get(currentAuctionId);
            prevClients?.delete(ws);
          }
          
          currentAuctionId = parsed.auctionId;
          if (!currentAuctionId) return;
          if (!auctionClients.has(currentAuctionId)) {
            auctionClients.set(currentAuctionId, new Set());
          }
          auctionClients.get(currentAuctionId)!.add(ws);
          
          ws.send(JSON.stringify({ type: 'subscribed', auctionId: currentAuctionId }));
        }
        
        if (parsed.type === 'unsubscribe') {
          if (currentAuctionId) {
            const clients = auctionClients.get(currentAuctionId);
            clients?.delete(ws);
            currentAuctionId = null;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (currentAuctionId) {
        const clients = auctionClients.get(currentAuctionId);
        clients?.delete(ws);
      }
    });

    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
  });

  server.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
  });

  return { wss, broadcastToAuction };
}

export function broadcastToAuction(auctionId: string, data: any) {
  const clients = auctionClients.get(auctionId);
  if (!clients) return;

  const message = JSON.stringify({
    type: 'bid_update',
    auctionId,
    data,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastTimerUpdate(auctionId: string, timeLeftMs: number) {
  const clients = auctionClients.get(auctionId);
  if (!clients) return;

  const message = JSON.stringify({
    type: 'timer_update',
    auctionId,
    timeLeftMs,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
