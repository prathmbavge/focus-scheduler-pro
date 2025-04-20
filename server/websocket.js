/**
 * WebSocket server for real-time updates
 */
const WebSocket = require('ws');
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
console.log('[WebSocket] Loading environment from:', envFile);
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

/**
 * Creates and configures a WebSocket server
 * @param {http.Server} server - HTTP server to attach the WebSocket server to
 * @returns {WebSocket.Server} The configured WebSocket server
 */
function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  
  // Store connected clients
  const clients = new Set();

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    clients.add(ws);

    // Handle client messages
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('[WebSocket] Received message:', parsedMessage.type);
        
        // Handle different message types
        switch (parsedMessage.type) {
          case 'INIT_SESSION':
            // Send initial data to client
            ws.send(JSON.stringify({ 
              type: 'SESSION_INITIALIZED',
              timestamp: new Date().toISOString()
            }));
            break;
            
          case 'RESET_USER_DATA':
            // Forward this message to all clients
            broadcastMessage({ 
              type: 'DATA_RESET',
              timestamp: new Date().toISOString()
            });
            break;
            
          default:
            console.log('[WebSocket] Unknown message type:', parsedMessage.type);
        }
      } catch (error) {
        console.error('[WebSocket] Error handling message:', error);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to WebSocket server',
      timestamp: new Date().toISOString()
    }));
  });

  /**
   * Broadcast a message to all connected clients
   * @param {Object} message - The message to broadcast
   */
  function broadcastMessage(message) {
    const messageString = JSON.stringify(message);
    console.log(`[WebSocket] Broadcasting to ${clients.size} clients:`, message.type);
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  // Export the broadcast function for use in other parts of the application
  wss.broadcast = broadcastMessage;
  
  console.log('[WebSocket] Server initialized');
  return wss;
}

module.exports = { setupWebSocketServer }; 