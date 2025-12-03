import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private eventCallbacks: { [event: string]: Set<(data: any) => void> } = {};
  private isConnecting = false;
  private isInitialized = false;
  private intervals: NodeJS.Timeout[] = [];
  private onDisconnectCallback: (() => void) | null = null;

  connect(token: string) {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.isConnecting = true;
    console.log('Socket กำลังทำงานอยู่...');

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    this.socket = io(`${wsUrl}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      if (!this.isInitialized) {
        this.initializeEvents();
        this.isInitialized = true;
      }
      console.log('[WebSocket] Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from WebSocket server');
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      if (error === 'Invalid token') {
        console.error('[WebSocket] Invalid token. Please login again.');
        this.handleDisconnect();
      }
    });
  }

  private initializeEvents() {
    if (!this.socket || !this.socket.connected) return;

    const events = ['emergency', 'status-update', 'notification', 'hospital-created', 'stats-updated'];
    events.forEach((event) => {
      if (this.eventCallbacks[event]) {
        this.eventCallbacks[event].forEach((callback) => {
          if (this.socket) {
            this.socket.on(event, callback);
          }
        });
      }
    });
  }

  private async handleReconnect() {
    if (this.isConnecting) return;

    this.reconnectAttempts++;
    console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('[WebSocket] No token available. Please login again.');
      this.handleDisconnect();
      return;
    }

    try {
      // Use POST method for verify-token as required by backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        this.connect(token);
      } else {
        console.error('[WebSocket] Invalid token. Please login again.');
        this.handleDisconnect();
      }
    } catch (err) {
      console.error('[WebSocket] Error verifying token:', err);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.handleDisconnect();
      } else {
        setTimeout(() => this.handleReconnect(), this.reconnectInterval);
      }
    }
  }

  private handleDisconnect() {
    console.error('[WebSocket] Max reconnect attempts reached. Please refresh the page or login again.');
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
    this.disconnect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.isInitialized = false;
    this.reconnectAttempts = 0;

    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    Object.keys(this.eventCallbacks).forEach((event) => {
      this.eventCallbacks[event].forEach((callback) => {
        if (this.socket) this.socket.off(event, callback);
      });
      this.eventCallbacks[event].clear();
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = new Set();
    }

    if (!this.eventCallbacks[event].has(callback)) {
      this.eventCallbacks[event].add(callback);

      if (this.socket && this.socket.connected) {
        this.socket.on(event, callback);
      } else {
        const checkConnection = () => {
          if (this.socket && this.socket.connected) {
            this.socket.on(event, callback);
            clearInterval(interval);
            this.intervals = this.intervals.filter((i) => i !== interval);
          }
        };
        const interval = setInterval(checkConnection, 500);
        this.intervals.push(interval);
      }
    }
  }

  off(event: string, callback: (data: any) => void) {
    if (this.eventCallbacks[event] && this.eventCallbacks[event].has(callback)) {
      this.eventCallbacks[event].delete(callback);
      if (this.socket && this.socket.connected) {
        this.socket.off(event, callback);
      }
      if (this.eventCallbacks[event].size === 0) {
        delete this.eventCallbacks[event];
      }
    }
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  offDisconnect(callback: () => void) {
    if (this.onDisconnectCallback === callback) {
      this.onDisconnectCallback = null;
    }
  }

  onEmergency(callback: (data: any) => void) {
    this.on('emergency', callback);
  }

  offEmergency(callback: (data: any) => void) {
    this.off('emergency', callback);
  }

  onStatusUpdate(callback: (data: any) => void) {
    this.on('status-update', callback);
  }

  offStatusUpdate(callback: (data: any) => void) {
    this.off('status-update', callback);
  }

  onHospitalCreated(callback: (data: any) => void) {
    this.on('hospital-created', callback);
  }

  offHospitalCreated(callback: (data: any) => void) {
    this.off('hospital-created', callback);
  }

  onStatsUpdated(callback: (data: any) => void) {
    this.on('stats-updated', callback);
  }

  offStatsUpdated(callback: (data: any) => void) {
    this.off('stats-updated', callback);
  }
}

export const webSocketClient = new WebSocketClient();