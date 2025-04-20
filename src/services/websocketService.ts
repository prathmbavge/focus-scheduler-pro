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
  private isWebSocketSupported: boolean;

  constructor() {
    // Check if WebSocket is supported
    this.isWebSocketSupported = typeof WebSocket !== 'undefined';
    if (!this.isWebSocketSupported) {
      console.warn('WebSockets are not supported in this browser');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // In development mode, get the WebSocket URL from environment or use default
    if (import.meta.env.DEV) {
      // Try to get server port from environment
      const serverPort = import.meta.env.VITE_SERVER_PORT || "5003";
      this.url = `${protocol}//localhost:${serverPort}`;
      console.log('WebSocket URL (development):', this.url);
    } else {
      // In production, use the API URL from environment but convert to WebSocket protocol
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      // Extract the host from the API URL
      let wsHost = '';
      try {
        if (apiUrl) {
          // Parse the API URL to get just the host portion
          const apiUrlObj = new URL(apiUrl);
          wsHost = apiUrlObj.host;
        } else {
          // Fallback to current host if API URL is not set
          wsHost = window.location.host;
        }
      } catch (e) {
        console.warn('Error parsing API URL, falling back to current host:', e);
        // Fallback to current host if API URL is invalid
        wsHost = window.location.host;
      }
      
      // Create the full WebSocket URL
      this.url = `${protocol}//${wsHost}`;
      console.log('WebSocket URL (production):', this.url);
    }
  }

  /**
   * Initialize the WebSocket connection
   */
  public connect(): void {
    // Skip if WebSocket is not supported
    if (!this.isWebSocketSupported) {
      console.warn('WebSockets are not supported, connection attempt skipped');
      return;
    }
    
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
    
    try {
      this.socket.close();
    } catch (e) {
      console.error('Error closing WebSocket connection:', e);
    }
    
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
    console.log('WebSocket connections have been disabled');
  }

  /**
   * Enable WebSocket connection attempts
   */
  public enableConnection(): void {
    this.connectionDisabled = false;
    this.reconnectAttempts = 0;
    console.log('WebSocket connections have been enabled, attempting to connect');
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
   * Returns true if message was sent successfully, false otherwise
   */
  public send(message: WebSocketMessage): boolean {
    if (!this.isWebSocketSupported) {
      console.warn('WebSockets are not supported, message not sent');
      return false;
    }
    
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message, WebSocket is not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      this.triggerEvent('error', { error });
      return false;
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
          baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
        }
        
        console.log('Sending data reset request to:', `${baseUrl}/api/data-reset`);
        
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