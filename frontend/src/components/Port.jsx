"use client";

import { useState, useRef, useEffect } from 'react';
import { useConnections } from '../context/ConnectionContext';
import { registerPort, unregisterPort } from './ConnectionsLayer';

export default function Port({ 
  deviceId,
  label, 
  position, 
  type = 'ethernet',
  status = 'up',
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  isConnected = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  const portRef = useRef(null);
  const { pending, startConnection, completeConnection, cancelConnection } = useConnections();

  // Регистрируем порт в реестре при монтировании
  useEffect(() => {
    if (portRef.current) {
      registerPort(deviceId, label, portRef.current);
    }
    return () => unregisterPort(deviceId, label);
  }, [deviceId, label]);

  const getPortColor = () => {
    if (status === 'down') return '#666';
    switch (type) {
      case 'ethernet': return '#6c6';
      case 'serial': return '#c66';
      case 'console': return '#66c';
      default: return '#666';
    }
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (!pending) {
      startConnection(deviceId, label);
    } else if (pending.deviceId !== deviceId) {
      completeConnection(deviceId, label);
    }
  };

  const handlePointerEnter = (e) => {
    setIsHovered(true);
    onPointerEnter?.(e);
  };

  const handlePointerLeave = (e) => {
    setIsHovered(false);
    onPointerLeave?.(e);
  };

  const isPending = pending && pending.deviceId === deviceId && pending.portName === label;

  return (
    <div
      ref={portRef}
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className={`port ${isPending ? 'pending' : ''}`}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          border: `2px solid ${getPortColor()}`,
          backgroundColor: isConnected ? getPortColor() : (isHovered || isPending ? getPortColor() : '#222'),
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      />
      {isHovered && (
        <div
          className="absolute z-50 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
          style={{
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: '8px'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
} 