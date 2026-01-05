import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, reportId, userType) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        if (!url || !reportId || !userType) return;

        const fullUrl = `${url}?reportId=${reportId}&userType=${userType}`;
        console.log(`Connecting to WebSocket: ${fullUrl}`);

        ws.current = new WebSocket(fullUrl);

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
            console.log('WebSocket Message Received:', event.data);
            try {
                // Try parsing assuming it's JSON, though standard messages might be plain strings or JSON strings
                // Based on test-client.html, the backend might just broadcast whatever it receives or specific format.
                // Let's assume for now we might receive JSON objects or strings.
                // If the backend sends "Received: ...", we might need to parse.
                // However, usually we want structured data.
                // Let's store the raw data or parsed data.
                const data = JSON.parse(event.data);
                setMessages((prev) => [...prev, data]);
            } catch (e) {
                // If not JSON, just store the string
                setMessages((prev) => [...prev, { message: event.data, createdAt: Date.now() / 1000, sender: 'UNKNOWN' }]);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url, reportId, userType]);

    const sendMessage = useCallback((message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const payload = JSON.stringify({
                action: 'sendMessage',
                reportId: reportId,
                message: message,
                userType: userType // Added userType for sender identification
            });
            ws.current.send(payload);
        } else {
            console.warn('WebSocket is not connected');
        }
    }, [reportId, userType]);

    return { isConnected, messages, sendMessage, setMessages };
};
