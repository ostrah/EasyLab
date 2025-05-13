"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ConnectionContext = createContext(null);

export function useConnections() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error("useConnections must be used inside <ConnectionProvider>");
  }
  return ctx;
}

export function ConnectionProvider({ children }) {
  const [connections, setConnections] = useState([]);
  const [socket, setSocket] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Инициализация WebSocket
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connection:created", (connection) => {
      setConnections(prev => [...prev, connection]);
    });

    newSocket.on("connection:deleted", (connectionId) => {
      setConnections(prev => prev.filter(c => c._id !== connectionId));
    });

    newSocket.on("connection:updated", (updatedConnection) => {
      setConnections(prev => 
        prev.map(c => c._id === updatedConnection._id ? updatedConnection : c)
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Загрузка соединений при изменении активной группы
  const fetchConnections = useCallback(async (groupId) => {
    if (!groupId) return;
    
    try {
      const res = await axios.get(`http://localhost:3001/api/connections?group=${groupId}`);
      setConnections(res.data);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  }, []);

  useEffect(() => {
    if (activeGroupId) {
      fetchConnections(activeGroupId);
    } else {
      setConnections([]);
    }
  }, [activeGroupId, fetchConnections]);

  const createConnection = async (groupId, devA, ifaceA, devB, ifaceB, cableType = "UTP") => {
    try {
      const res = await axios.post("http://localhost:3001/api/connections", {
        groupId,
        devA,
        ifaceA,
        devB,
        ifaceB,
        cableType
      });
      return res.data;
    } catch (err) {
      console.error("Error creating connection:", err);
      throw err;
    }
  };

  const deleteConnection = async (connectionId) => {
    try {
      await axios.delete(`http://localhost:3001/api/connections/${connectionId}`);
    } catch (err) {
      console.error("Error deleting connection:", err);
      throw err;
    }
  };

  const updateConnectionStatus = async (connectionId, status) => {
    try {
      const res = await axios.patch(`http://localhost:3001/api/connections/${connectionId}/status`, {
        status
      });
      return res.data;
    } catch (err) {
      console.error("Error updating connection status:", err);
      throw err;
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        activeGroupId,
        setActiveGroupId,
        createConnection,
        deleteConnection,
        updateConnectionStatus,
        fetchConnections
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
} 