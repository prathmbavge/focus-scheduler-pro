/**
 * WebSocket Service
 * Handles real-time communication with the server
 */

// Event callbacks storage
type Callback = (data: any) => void;
type EventType = 'connect' | 'disconnect' | 'task-updated' | 'data-reset' | 'error';

// WebSocket message types
interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds delay
  private eventCallbacks: Record<string, Callback[]> = {};
  private url: string;
  private connectionDisabled = false;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // In development mode, get the WebSocket URL from environment or use default
    if (import.meta.env.DEV) {
      // Try to get server port from environment
      const serverPort = import.meta.env.VITE_SERVER_PORT || "5003";
      this.url = `${protocol}//localhost:${serverPort}`;
      console.log('WebSocket URL (development):', this.url);
    } else {
      // In production, use the same host as the app
      this.url = `${protocol}//${window.location.host}`;
      console.log('WebSocket URL (production):', this.url);
    }
  }

  /**
   * Initialize the WebSocket connection
   */
  public connect(): void {
    // Skip connection if it's disabled
    if (this.connectionDisabled) {
      console.log('WebSocket connection is disabled');
      return;
    }
    
    if (this.socket) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      console.log(`Connecting to WebSocket server at ${this.url}`);
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.triggerEvent('error', { error });
      this.scheduleReconnect();
    }
  }

  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (!this.socket) return;
    
    this.socket.close();
    this.socket = null;
    this.isConnected = false;
    this.cancelReconnect();
  }

  /**
   * Disable WebSocket connection attempts
   * Use this to prevent reconnection attempts when the server is known to be unavailable
   */
  public disableConnection(): void {
    this.connectionDisabled = true;
    this.disconnect();
    this.cancelReconnect();
  }

  /**
   * Enable WebSocket connection attempts
   */
  public enableConnection(): void {
    this.connectionDisabled = false;
    this.reconnectAttempts = 0;
    this.connect();
  }
  
  /**
   * Check if WebSocket is connected
   */
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Send a message to the WebSocket server
   */
  public send(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message, WebSocket is not connected');
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
      this.triggerEvent('error', { error });
    }
  }

  /**
   * Register a callback for WebSocket events
   */
  public on(event: EventType, callback: Callback): void {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    this.eventCallbacks[event].push(callback);
  }

  /**
   * Remove a callback for WebSocket events
   */
  public off(event: EventType, callback: Callback): void {
    if (!this.eventCallbacks[event]) return;
    
    this.eventCallbacks[event] = this.eventCallbacks[event].filter(
      cb => cb !== callback
    );
  }

  /**
   * Send an initialization message when a new user starts
   */
  public initNewUserSession(): void {
    this.send({
      type: 'INIT_SESSION',
      timestamp: new Date().toISOString()
    });
    console.log('New user session initialized');
  }

  /**
   * Request a data reset for new users
   */
  public requestDataReset(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Use the API endpoint directly for more reliable delivery
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const serverPort = import.meta.env.VITE_SERVER_PORT || "5003";
        
        // Construct the URL based on environment
        let baseUrl = "";
        if (import.meta.env.DEV) {
          baseUrl = `http://localhost:${serverPort}`;
        } else {
          baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        }
        
        fetch(`${baseUrl}/api/data-reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Data reset request sent successfully:', data);
          resolve(true);
        })
        .catch(error => {
          console.error('Error sending reset request:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error sending reset request:', error);
        reject(error);
      }
    });
  }

  // WebSocket event handlers
  private handleOpen(event: Event): void {
    console.log('WebSocket connected successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.cancelReconnect();
    this.triggerEvent('connect', { event });
    
    // Send initial message
    this.send({ 
      type: 'CLIENT_CONNECTED',
      clientInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      console.log('WebSocket message received:', message.type);
      
      switch (message.type) {
        case 'CONNECTED':
          console.log('Connection confirmed by server');
          break;
          
        case 'TASK_UPDATED':
          this.triggerEvent('task-updated', message);
          break;
          
        case 'DATA_RESET':
          console.log('Data reset notification received');
          this.triggerEvent('data-reset', message);
          break;
          
        case 'SESSION_INITIALIZED':
          console.log('Session initialized');
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, event.data);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
    this.isConnected = false;
    this.socket = null;
    this.triggerEvent('disconnect', { event });
    
    // Only attempt to reconnect on abnormal closure and if not disabled
    if (!this.connectionDisabled && event.code !== 1000 && event.code !== 1001) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.triggerEvent('error', { event });
  }

  private scheduleReconnect(): void {
    if (this.connectionDisabled || this.reconnectTimer !== null || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Maximum reconnect attempts reached, disabling WebSocket connection');
        this.disableConnection();
      }
      return;
    }

    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private triggerEvent(event: string, data: any): void {
    if (!this.eventCallbacks[event]) return;
    
    this.eventCallbacks[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService; 