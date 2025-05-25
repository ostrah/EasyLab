'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useGroups } from '../context/GroupContext';

const ConnectionContext = createContext();

export function ConnectionProvider({ children }) {
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceDevice, setSourceDevice] = useState(null);
  const { activeGroupId } = useGroups();

  // Загружаем соединения из базы при смене группы
  useEffect(() => {
    const fetchConnections = async () => {
      if (!activeGroupId) {
        setConnections([]);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/api/connections?group=${activeGroupId}`);
        setConnections(response.data);
      } catch (error) {
        setConnections([]);
      }
    };
    fetchConnections();
  }, [activeGroupId]);

  const startConnection = (device) => {
    setIsConnecting(true);
    setSourceDevice(device);
  };

  const completeConnection = (targetDevice) => {
    if (sourceDevice && targetDevice && sourceDevice.id !== targetDevice.id) {
      createConnection(sourceDevice.id, targetDevice.id, sourceDevice.interface, targetDevice.interface);
    }
    setIsConnecting(false);
    setSourceDevice(null);
  };

  const createConnection = async (sourceId, targetId, sourceInterface, targetInterface) => {
    if (!activeGroupId) {
      console.error('Нет activeGroupId для создания соединения');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/connections', {
        groupId: activeGroupId,
        devA: sourceId,
        ifaceA: sourceInterface,
        devB: targetId,
        ifaceB: targetInterface
      });
      setConnections(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Ошибка при создании соединения:', err);
    }
  };

  const deleteConnection = async (connectionId) => {
    try {
      await axios.delete(`http://localhost:3001/api/connections/${connectionId}`);
      setConnections(prev => prev.filter(conn => (conn._id || conn.id) !== connectionId));
    } catch (err) {
      console.error('Ошибка при удалении соединения:', err);
    }
  };

  return (
    <ConnectionContext.Provider value={{
      connections,
      isConnecting,
      sourceDevice,
      startConnection,
      completeConnection,
      createConnection,
      deleteConnection,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
} 