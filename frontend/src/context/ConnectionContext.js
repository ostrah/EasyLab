"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create context with default values
const ConnectionContext = createContext({
  connections: [],
  pending: null,
  activeGroupId: null,
  setActiveGroupId: () => {},
  startConnection: () => {},
  completeConnection: () => {},
  cancelConnection: () => {},
  removeConnection: () => {},
  updateConnectionStatus: () => {}
});

export const useConnections = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Load connections when active group changes
  useEffect(() => {
    const fetchConnections = async () => {
      if (!activeGroupId) {
        console.log('No active group ID, skipping connection fetch');
        setConnections([]);
        return;
      }

      try {
        console.log('Fetching connections for group:', activeGroupId);
        const response = await axios.get(`${API_BASE_URL}/connections?group=${activeGroupId}`);
        console.log('Fetched connections:', response.data);
        setConnections(response.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setConnections([]);
      }
    };

    fetchConnections();
  }, [activeGroupId]);

  const startConnection = useCallback((deviceId, portName) => {
    console.log('Starting connection:', { deviceId, portName });
    setPending({ deviceId, portName });
  }, []);

  const completeConnection = useCallback(async (deviceId, portName) => {
    console.log('Completing connection:', { 
      pending, 
      newDevice: { deviceId, portName } 
    });

    if (!pending) {
      console.log('No pending connection to complete');
      return;
    }

    if (pending.deviceId === deviceId) {
      console.log('Cannot connect device to itself');
      return;
    }

    if (!activeGroupId) {
      console.log('No active group ID, cannot create connection');
      return;
    }

    try {
      const newConnection = {
        groupId: activeGroupId,
        devA: pending.deviceId,
        ifaceA: pending.portName,
        devB: deviceId,
        ifaceB: portName,
        status: 'up'
      };

      console.log('Creating new connection:', newConnection);
      const response = await axios.post(`${API_BASE_URL}/connections`, newConnection);
      console.log('Connection created successfully:', response.data);

      setConnections(prev => [...prev, response.data]);
      setPending(null);
    } catch (error) {
      console.error('Error creating connection:', error);
      setPending(null);
    }
  }, [pending, activeGroupId]);

  const cancelConnection = useCallback(() => {
    console.log('Cancelling pending connection');
    setPending(null);
  }, []);

  const removeConnection = useCallback(async (connectionId) => {
    console.log('Removing connection:', connectionId);
    try {
      await axios.delete(`${API_BASE_URL}/connections/${connectionId}`);
      setConnections(prev => prev.filter(conn => conn._id !== connectionId));
      console.log('Connection removed successfully');
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  }, []);

  const updateConnectionStatus = useCallback(async (connectionId, status) => {
    console.log('Updating connection status:', { connectionId, status });
    try {
      const response = await axios.patch(`${API_BASE_URL}/connections/${connectionId}/status`, { status });
      setConnections(prev => prev.map(conn => 
        conn._id === connectionId ? { ...conn, status } : conn
      ));
      console.log('Connection status updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }, []);

  const value = {
    connections,
    pending,
    activeGroupId,
    setActiveGroupId,
    startConnection,
    completeConnection,
    cancelConnection,
    removeConnection,
    updateConnectionStatus
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}; 