"use client";

import { useRef, useEffect } from 'react';
import { useConnections } from '../context/ConnectionContext';
import { getCableColor } from '../utils/portPositions';

// Реестр для хранения ссылок на DOM-элементы портов
const portRegistry = new Map();

export function registerPort(deviceId, portName, element) {
  portRegistry.set(`${deviceId}-${portName}`, element);
}

export function unregisterPort(deviceId, portName) {
  portRegistry.delete(`${deviceId}-${portName}`);
}

export function getPortElement(deviceId, portName) {
  return portRegistry.get(`${deviceId}-${portName}`);
}

export default function ConnectionsLayer() {
  const { connections, pending } = useConnections();
  const svgRef = useRef(null);

  // Обновляем размеры SVG при изменении размера окна
  useEffect(() => {
    const updateSvgSize = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        svgRef.current.setAttribute('width', parent.offsetWidth);
        svgRef.current.setAttribute('height', parent.offsetHeight);
      }
    };

    window.addEventListener('resize', updateSvgSize);
    updateSvgSize();

    return () => window.removeEventListener('resize', updateSvgSize);
  }, []);

  const getPortCenter = (deviceId, portName) => {
    const portElement = getPortElement(deviceId, portName);
    if (!portElement) return null;

    const rect = portElement.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top + rect.height / 2 - svgRect.top
    };
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Существующие соединения */}
      {connections.map(conn => {
        const fromCenter = getPortCenter(conn.devA._id, conn.ifaceA);
        const toCenter = getPortCenter(conn.devB._id, conn.ifaceB);
        
        if (!fromCenter || !toCenter) return null;

        return (
          <g key={conn._id}>
            <line
              x1={fromCenter.x}
              y1={fromCenter.y}
              x2={toCenter.x}
              y2={toCenter.y}
              stroke={getCableColor(conn.ifaceA, conn.ifaceB)}
              strokeWidth={2}
              className="connection-line"
            />
            {/* Индикатор статуса */}
            <circle
              cx={(fromCenter.x + toCenter.x) / 2}
              cy={(fromCenter.y + toCenter.y) / 2}
              r={4}
              fill={conn.status === 'up' ? '#6c6' : '#c66'}
              className="connection-status"
            />
          </g>
        );
      })}

      {/* Промежуточное соединение при создании */}
      {pending && (() => {
        const fromCenter = getPortCenter(pending.deviceId, pending.portName);
        if (!fromCenter) return null;

        return (
          <line
            x1={fromCenter.x}
            y1={fromCenter.y}
            x2={fromCenter.x}
            y2={fromCenter.y}
            stroke="#666"
            strokeWidth={2}
            strokeDasharray="5,5"
            className="pending-connection"
          />
        );
      })()}
    </svg>
  );
} 