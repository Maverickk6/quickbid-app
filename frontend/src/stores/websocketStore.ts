import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface WebSocketMessage {
  type: string;
  auctionId?: string;
  data?: any;
  timeLeftMs?: number;
  timestamp?: string;
}

interface WebSocketState {
  ws: WebSocket | null;
  isConnected: boolean;
  subscribedAuctions: Set<string>;
  lastBidUpdate: Record<string, any>;
  lastTimerUpdate: Record<string, number | undefined>;
  connect: () => void;
  disconnect: () => void;
  subscribeToAuction: (auctionId: string) => void;
  unsubscribeFromAuction: (auctionId: string) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  ws: null,
  isConnected: false,
  subscribedAuctions: new Set(),
  lastBidUpdate: {},
  lastTimerUpdate: {},

  connect: () => {
    if (typeof window === 'undefined') return;
    
    const { ws } = get();
    if (ws?.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true, ws: socket });
      
      const { subscribedAuctions } = get();
      subscribedAuctions.forEach((auctionId) => {
        socket.send(JSON.stringify({ type: 'subscribe', auctionId }));
      });
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'bid_update':
            if (message.auctionId && message.data) {
              set((state) => ({
                lastBidUpdate: {
                  ...state.lastBidUpdate,
                  [message.auctionId!]: message.data,
                },
              }));
            }
            break;
            
          case 'timer_update':
            if (message.auctionId && message.timeLeftMs !== undefined) {
              set((state) => ({
                lastTimerUpdate: {
                  ...state.lastTimerUpdate,
                  [message.auctionId!]: message.timeLeftMs,
                },
              }));
            }
            break;
            
          case 'connected':
          case 'subscribed':
            console.log('WebSocket:', message);
            break;
            
          case 'error':
            console.error('WebSocket error:', message);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false, ws: null });
      
      setTimeout(() => {
        get().connect();
      }, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    set({ ws: socket });
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false, subscribedAuctions: new Set() });
    }
  },

  subscribeToAuction: (auctionId: string) => {
    const { ws, subscribedAuctions } = get();
    
    if (!subscribedAuctions.has(auctionId)) {
      const newSubscribed = new Set(subscribedAuctions);
      newSubscribed.add(auctionId);
      set({ subscribedAuctions: newSubscribed });
      
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'subscribe', auctionId }));
      }
    }
  },

  unsubscribeFromAuction: (auctionId: string) => {
    const { ws, subscribedAuctions } = get();
    
    if (subscribedAuctions.has(auctionId)) {
      const newSubscribed = new Set(subscribedAuctions);
      newSubscribed.delete(auctionId);
      set({ subscribedAuctions: newSubscribed });
      
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', auctionId }));
      }
    }
  },
}));

export const useAuctionWebSocket = (auctionId: string | null) => {
  const store = useWebSocketStore();
  
  if (!auctionId) return null;
  
  return {
    isConnected: store.isConnected,
    lastBidUpdate: store.lastBidUpdate[auctionId],
    lastTimerUpdate: store.lastTimerUpdate[auctionId],
    subscribe: () => store.subscribeToAuction(auctionId),
    unsubscribe: () => store.unsubscribeFromAuction(auctionId),
  };
};
