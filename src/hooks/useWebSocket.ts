import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';
import { useTaskContextSafe } from '../context/useTaskContextSafe';
import { invalidateTasksCache } from '../services/taskService';
import { toast } from 'sonner';

type EventType = 'connect' | 'disconnect' | 'task-updated' | 'data-reset' | 'error';

interface UseWebSocketProps {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onTaskUpdated?: (data: any) => void;
  onDataReset?: () => void;
  onError?: (error: any) => void;
}

const useWebSocket = ({
  autoConnect = true,
  onConnect,
  onDisconnect,
  onTaskUpdated,
  onDataReset,
  onError
}: UseWebSocketProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Use the safe version that won't throw if context is missing
  const { refreshTasks } = useTaskContextSafe();

  // Connect to WebSocket
  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  // Disable WebSocket connection
  const disableConnection = useCallback(() => {
    websocketService.disableConnection();
    setIsConnected(false);
  }, []);

  // Enable WebSocket connection
  const enableConnection = useCallback(() => {
    websocketService.enableConnection();
  }, []);

  // Send a message through WebSocket
  const send = useCallback((message: { type: string; [key: string]: any }) => {
    websocketService.send(message);
  }, []);

  // Initialize a new user session
  const initNewUserSession = useCallback(() => {
    websocketService.initNewUserSession();
  }, []);

  // Request a data reset for new users
  const requestDataReset = useCallback(async () => {
    try {
      const result = await websocketService.requestDataReset();
      if (result) {
        toast.success('Application reset for a fresh start');
      }
      return result;
    } catch (error) {
      console.error('Failed to reset data:', error);
      toast.error('Failed to reset application data');
      return false;
    }
  }, []);

  // Default event handlers
  const handleConnect = useCallback((data: any) => {
    console.log('WebSocket connected');
    setIsConnected(true);
    setConnectionError(null);
    onConnect?.();
  }, [onConnect]);

  const handleDisconnect = useCallback((data: any) => {
    console.log('WebSocket disconnected');
    setIsConnected(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const handleTaskUpdated = useCallback((data: any) => {
    console.log('Task update received:', data.action, data.task?.id);
    setLastMessage(data);
    
    // Invalidate the cache to trigger a refresh
    invalidateTasksCache();
    
    // Refresh tasks if we have access to the task context
    if (refreshTasks) {
      refreshTasks().catch(error => {
        console.error('Error refreshing tasks after update:', error);
      });
    }
    
    // Show a toast notification based on the action
    if (data.action === 'created') {
      toast.info(`New task added: ${data.task?.title || 'Unknown'}`);
    } else if (data.action === 'updated' || data.action === 'status-updated') {
      toast.info(`Task updated: ${data.task?.title || 'Unknown'}`);
    } else if (data.action === 'deleted') {
      toast.info(`Task deleted: ${data.task?.title || 'Unknown'}`);
    } else if (data.action === 'completed') {
      toast.success(`Task completed: ${data.task?.title || 'Unknown'}`);
    }
    
    onTaskUpdated?.(data);
  }, [onTaskUpdated, refreshTasks]);

  const handleDataReset = useCallback((data: any) => {
    console.log('Data reset notification received');
    
    // Invalidate cache and refresh tasks if we have access to the task context
    invalidateTasksCache();
    if (refreshTasks) {
      refreshTasks().catch(error => {
        console.error('Error refreshing tasks after data reset:', error);
      });
    }
    
    toast.info('Application data has been reset');
    
    onDataReset?.();
  }, [onDataReset, refreshTasks]);

  const handleError = useCallback((error: any) => {
    console.error('WebSocket error:', error);
    
    // Set connection error message 
    setConnectionError('WebSocket connection failed. Real-time updates are not available.');
    
    // After maxReconnectAttempts failures, disable auto-reconnect and show a message
    if (websocketService.isWebSocketConnected() === false) {
      // After 5 unsuccessful attempts, we'll stop trying to reconnect automatically
      toast.error('Unable to establish WebSocket connection. Some features may be limited.', {
        duration: 5000,
        id: 'websocket-connection-error' // Prevents duplicate toasts
      });
    }
    
    onError?.(error);
  }, [onError]);

  // Setup event listeners
  useEffect(() => {
    // Register event handlers
    websocketService.on('connect', handleConnect);
    websocketService.on('disconnect', handleDisconnect);
    websocketService.on('task-updated', handleTaskUpdated);
    websocketService.on('data-reset', handleDataReset);
    websocketService.on('error', handleError);
    
    // Connect if autoConnect is true
    if (autoConnect) {
      connect();
    }
    
    // Cleanup event listeners on unmount
    return () => {
      websocketService.off('connect', handleConnect);
      websocketService.off('disconnect', handleDisconnect);
      websocketService.off('task-updated', handleTaskUpdated);
      websocketService.off('data-reset', handleDataReset);
      websocketService.off('error', handleError);
    };
  }, [
    autoConnect,
    connect,
    handleConnect,
    handleDisconnect,
    handleTaskUpdated,
    handleDataReset,
    handleError
  ]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    connect,
    disconnect,
    disableConnection,
    enableConnection,
    send,
    initNewUserSession,
    requestDataReset
  };
};

export default useWebSocket; 