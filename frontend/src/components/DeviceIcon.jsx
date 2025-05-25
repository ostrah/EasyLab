"use client";

import { useRef } from 'react';
import Port from './Port';
import { calculatePortPosition } from '../utils/portPositions';
import { useDevices } from '../context/DeviceContext';

export default function DeviceIcon({ 
  device, 
  onPortPointerDown,
  onPortPointerEnter,
  onPortPointerLeave,
  isDragging,
  connections = []
}) {
  const iconRef = useRef(null);
  const { updateDevicePosition } = useDevices();

  const getDeviceIcon = () => {
    switch (device.type) {
      case 'router':
        return (
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛜</span>
            </div>
          </div>
        );
      case 'switch':
        return (
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔀</span>
            </div>
          </div>
        );
      case 'pc':
        return (
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Добавляем обработчики для перетаскивания
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Только для левой кнопки мыши
      e.currentTarget.style.cursor = 'grabbing';
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    if (iconRef.current) {
      const rect = iconRef.current.parentElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      iconRef.current.style.left = `${x}px`;
      iconRef.current.style.top = `${y}px`;
    }
  };

  const handleMouseUp = () => {
    if (iconRef.current) {
      const rect = iconRef.current.parentElement.getBoundingClientRect();
      const x = parseInt(iconRef.current.style.left);
      const y = parseInt(iconRef.current.style.top);
      updateDevicePosition(device._id, x, y);
      iconRef.current.style.cursor = 'grab';
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  };

  // Генерируем интерфейсы, если их нет
  const interfaces = device.interfaces || (() => {
    const ifaces = [];
    switch (device.type) {
      case 'router':
        for (let i = 0; i < 4; i++) {
          ifaces.push({ name: `f0/${i}`, type: 'ethernet', status: 'up' });
        }
        for (let i = 0; i < 2; i++) {
          ifaces.push({ name: `s0/${i}`, type: 'serial', status: 'up' });
        }
        ifaces.push({ name: 'console', type: 'console', status: 'up' });
        break;
      case 'switch':
        for (let i = 0; i < 8; i++) {
          ifaces.push({ name: `f0/${i}`, type: 'ethernet', status: 'up' });
        }
        ifaces.push({ name: 'console', type: 'console', status: 'up' });
        break;
      case 'pc':
        ifaces.push({ name: 'eth0', type: 'ethernet', status: 'up' });
        break;
    }
    return ifaces;
  })();

  return (
    <div 
      ref={iconRef}
      className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        position: 'absolute',
        left: device.position?.x || 100,
        top: device.position?.y || 100,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseDown={handleMouseDown}
    >
      {getDeviceIcon()}
      <div className="absolute inset-0">
        {interfaces.map((iface) => {
          const isConnected = connections.some(
            conn =>
              ((conn.devA?._id || conn.devA) === device._id && conn.ifaceA === iface.name) ||
              ((conn.devB?._id || conn.devB) === device._id && conn.ifaceB === iface.name)
          );
          return (
            <Port
              key={iface.name}
              deviceId={device._id}
              label={iface.name}
              position={calculatePortPosition(iface.name, device.type)}
              type={iface.type}
              status={iface.status}
              isConnected={isConnected}
              onPointerDown={(e) => onPortPointerDown?.(device._id, iface.name, e)}
              onPointerEnter={(e) => onPortPointerEnter?.(e, device._id, iface.name)}
              onPointerLeave={(e) => onPortPointerLeave?.(e, device._id, iface.name)}
            />
          );
        })}
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm font-medium">{device.name}</div>
        <div className="text-xs text-gray-400">{device.ip}</div>
      </div>
    </div>
  );
} 