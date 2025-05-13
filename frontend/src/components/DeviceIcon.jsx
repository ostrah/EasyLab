"use client";

import { useRef } from 'react';
import Port from './Port';
import { calculatePortPosition } from '../utils/portPositions';

export default function DeviceIcon({ 
  device, 
  onPortPointerDown,
  onPortPointerEnter,
  onPortPointerLeave,
  isDragging
}) {
  const iconRef = useRef(null);

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

  return (
    <div 
      ref={iconRef}
      className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        position: 'absolute',
        left: device.position.x,
        top: device.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {getDeviceIcon()}
      <div className="absolute inset-0">
        {device.interfaces.map((iface, index) => (
          <Port
            key={iface.name}
            label={iface.name}
            position={calculatePortPosition(index, device.interfaces.length, device.type)}
            type={iface.type}
            status={iface.status}
            onPointerDown={(e) => onPortPointerDown?.(e, device._id, iface.name)}
            onPointerEnter={(e) => onPortPointerEnter?.(e, device._id, iface.name)}
            onPointerLeave={(e) => onPortPointerLeave?.(e, device._id, iface.name)}
          />
        ))}
      </div>
    </div>
  );
} 