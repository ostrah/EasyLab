"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useConnections } from '../context/ConnectionContext';

// Создаем реестр портов для хранения их позиций
const portRegistry = new Map();

// Функции для работы с реестром портов
export const registerPort = (deviceId, portName, element) => {
  const key = `${deviceId}-${portName}`;
  portRegistry.set(key, element);
  console.log('Port registered:', { key, element });
};

export const unregisterPort = (deviceId, portName) => {
  const key = `${deviceId}-${portName}`;
  portRegistry.delete(key);
  console.log('Port unregistered:', key);
};

export const getPortCenter = (deviceId, portName) => {
  const key = `${deviceId}-${portName}`;
  const element = portRegistry.get(key);
  if (!element) {
    console.log('Port not found:', key);
    return null;
  }
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
};

export default function ConnectionsLayer({ onConnectionRightClick }) {
  const { connections, pending } = useConnections();
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  // Обновляем размер SVG при изменении размера окна
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSvgSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Функция для получения точек соединения
  const getConnectionPoints = (connection) => {
    // Поддержка старой структуры
    if (connection.source && connection.target) {
      const sourceCenter = getPortCenter(connection.source, 'f0/0');
      const targetCenter = getPortCenter(connection.target, 'f0/0');
      return { sourceCenter, targetCenter };
    }
    
    // Поддержка новой структуры
    if (connection.devA && connection.devB) {
      const sourceCenter = getPortCenter(connection.devA, connection.ifaceA);
      const targetCenter = getPortCenter(connection.devB, connection.ifaceB);
      return { sourceCenter, targetCenter };
    }

    return { sourceCenter: null, targetCenter: null };
  };

  // Функция для отрисовки соединения
  const renderConnection = (connection) => {
    const { sourceCenter, targetCenter } = getConnectionPoints(connection);
    
    if (!sourceCenter || !targetCenter) {
      console.log('Missing port centers for connection:', connection);
      return null;
    }

    const isActive = connection.status === 'up';
    const strokeColor = isActive ? '#22c55e' : '#ef4444';
    const strokeWidth = isActive ? 2 : 1;

    return (
      <g key={connection._id}>
        <line
          x1={sourceCenter.x}
          y1={sourceCenter.y}
          x2={targetCenter.x}
          y2={targetCenter.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          onContextMenu={(e) => onConnectionRightClick?.(e, connection)}
          style={{ cursor: 'pointer' }}
        />
        <circle
          cx={sourceCenter.x}
          cy={sourceCenter.y}
          r={4}
          fill={strokeColor}
        />
        <circle
          cx={targetCenter.x}
          cy={targetCenter.y}
          r={4}
          fill={strokeColor}
        />
      </g>
    );
  };

  // Функция для отрисовки ожидающего соединения
  const renderPendingConnection = () => {
    if (!pending) return null;

    const sourceCenter = getPortCenter(pending.deviceId, pending.portName);
    if (!sourceCenter) return null;

    return (
      <g>
        <line
          x1={sourceCenter.x}
          y1={sourceCenter.y}
          x2={sourceCenter.x + 100}
          y2={sourceCenter.y}
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
        <circle
          cx={sourceCenter.x}
          cy={sourceCenter.y}
          r={4}
          fill="#22c55e"
        />
      </g>
    );
  };

  return (
    <svg
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none"
      width={svgSize.width}
      height={svgSize.height}
    >
      <g className="pointer-events-auto">
        {connections.map(renderConnection)}
        {renderPendingConnection()}
      </g>
    </svg>
  );
} 