import { useEffect, useRef, useCallback, useState } from 'react';

const useNotificationWebSocket = (onNotification) => {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(true);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !shouldConnect) return;

    // Get WebSocket URL based on current API URL
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + `/api/notifications/ws?token=${token}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send('ping');
          }
        }, 30000);

        // Store interval ID to clear later
        ws.current.pingInterval = pingInterval;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === 'notification') {
            // New notification received
            onNotification?.(data);
          } else if (data.type === 'pong') {
            // Keepalive response, connection is alive
            console.log('WebSocket connection alive');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);

        // Clear ping interval
        if (ws.current?.pingInterval) {
          clearInterval(ws.current.pingInterval);
        }

        // Attempt to reconnect after 3 seconds if connection should be maintained
        if (shouldConnect) {
          reconnectTimeout.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      // Retry connection after 3 seconds
      if (shouldConnect) {
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    }
  }, [onNotification, shouldConnect]);

  const disconnect = useCallback(() => {
    setShouldConnect(false);

    // Clear reconnect timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // Clear ping interval
    if (ws.current?.pingInterval) {
      clearInterval(ws.current.pingInterval);
    }

    // Close WebSocket
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Only connect if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected, disconnect };
};

export default useNotificationWebSocket;
