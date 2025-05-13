"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionContext = createContext(null);

export function useConnections() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnections must be used inside ConnectionProvider');
  }
  return ctx;
}

export function ConnectionProvider({ children }) {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Загрузка соединений при изменении активной группы
  useEffect(() => {
    if (activeGroupId) {
      fetchConnections(activeGroupId);
    } else {
      setConnections([]);
    }
  }, [activeGroupId]);

  const fetchConnections = async (groupId) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/connections?group=${groupId}`);
      setConnections(res.data);
    } catch (err) {
      console.error('Error fetching connections:', err);
    }
  };

  const startConnection = (deviceId, portName) => {
    setPending({ deviceId, portName });
  };

  const completeConnection = async (deviceId, portName) => {
    if (!pending || !activeGroupId) return;

    try {
      const res = await axios.post('http://localhost:3001/api/connections', {
        groupId: activeGroupId,
        devA: pending.deviceId,
        ifaceA: pending.portName,
        devB: deviceId,
        ifaceB: portName
      });

      setConnections(prev => [...prev, res.data]);
      setPending(null);
    } catch (err) {
      console.error('Error creating connection:', err);
      setPending(null);
    }
  };

  const cancelConnection = () => {
    setPending(null);
  };

  const removeConnection = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/connections/${id}`);
      setConnections(prev => prev.filter(conn => conn._id !== id));
    } catch (err) {
      console.error('Error deleting connection:', err);
    }
  };

  const updateConnectionStatus = async (id, status) => {
    try {
      const res = await axios.patch(`http://localhost:3001/api/connections/${id}/status`, { status });
      setConnections(prev => 
        prev.map(conn => conn._id === id ? res.data : conn)
      );
    } catch (err) {
      console.error('Error updating connection status:', err);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        pending,
        activeGroupId,
        setActiveGroupId,
        startConnection,
        completeConnection,
        cancelConnection,
        removeConnection,
        updateConnectionStatus
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
} 