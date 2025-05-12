'use client';

import { createContext, useContext, useState } from 'react';

const ConnectionContext = createContext();

export function ConnectionProvider({ children }) {
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceDevice, setSourceDevice] = useState(null);

  const startConnection = (device) => {
    setIsConnecting(true);
    setSourceDevice(device);
  };

  const completeConnection = (targetDevice) => {
    if (sourceDevice && targetDevice && sourceDevice.id !== targetDevice.id) {
      createConnection(sourceDevice.id, targetDevice.id);
    }
    setIsConnecting(false);
    setSourceDevice(null);
  };

  const createConnection = (sourceId, targetId) => {
    const newConnection = {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    };
    setConnections(prev => [...prev, newConnection]);
  };

  const deleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
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