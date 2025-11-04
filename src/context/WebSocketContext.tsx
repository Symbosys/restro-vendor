import React, { createContext, useContext, useEffect, useState } from "react";
import { wsService } from "../services/websocket.service";
import { useAuth } from "./AuthContext"; // if you have auth

interface WebSocketContextValue {
    send: (data: any) => void;
    connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({
    send: () => { },
    connected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const { vendorId, token } = useAuth();

    useEffect(() => {
        if (vendorId && token) {
            const url = `ws://192.168.1.7:4000/ws?role=vendor&vendorId=${vendorId}&token=${token}`;
            wsService.connect(url);

            wsService.on("system", (msg) => {
                if (msg.type === "connected") setConnected(true);
                if (msg.type === "disconnected") setConnected(false);
            });

            return () => wsService.close();
        }
    }, [vendorId, token]);

    return (
        <WebSocketContext.Provider value={{ send: wsService.send.bind(wsService), connected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
