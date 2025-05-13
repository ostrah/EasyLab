"use client";

import { useRef, useState, useEffect } from "react";
import { useConnections } from "../context/ConnectionContext";

// Конфигурация портов для разных типов устройств
const PORT_CONFIGS = {
  pc: [
    { id: "eth0", label: "Ethernet", position: "bottom" }
  ],
  router: [
    { id: "Gig0/0", label: "GigabitEthernet 0/0", position: "left" },
    { id: "Gig0/1", label: "GigabitEthernet 0/1", position: "right" },
    { id: "Ser0/0", label: "Serial 0/0", position: "top" }
  ],
  switch: [
    { id: "Fa0/1", label: "FastEthernet 0/1", position: "left" },
    { id: "Fa0/2", label: "FastEthernet 0/2", position: "right" },
    { id: "Fa0/3", label: "FastEthernet 0/3", position: "top" },
    { id: "Fa0/4", label: "FastEthernet 0/4", position: "bottom" }
  ]
};

export default function DeviceIcon({ 
  device, 
  position, 
  onDrag, 
  onRightClick,
  isLinking,
  onPortClick,
  onPortHover
}) {
  const iconRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [portPositions, setPortPositions] = useState({});
  const { connections } = useConnections();

  // Вычисляем позиции портов при монтировании и изменении размера
  useEffect(() => {
    if (!iconRef.current) return;

    const updatePortPositions = () => {
      const rect = iconRef.current.getBoundingClientRect();
      const ports = PORT_CONFIGS[device.type] || [];
      const positions = {};

      ports.forEach(port => {
        let x, y;
        switch (port.position) {
          case "left":
            x = 0;
            y = rect.height / 2;
            break;
          case "right":
            x = rect.width;
            y = rect.height / 2;
            break;
          case "top":
            x = rect.width / 2;
            y = 0;
            break;
          case "bottom":
            x = rect.width / 2;
            y = rect.height;
            break;
        }
        positions[port.id] = { x, y };
      });

      setPortPositions(positions);
    };

    updatePortPositions();
    window.addEventListener("resize", updatePortPositions);
    return () => window.removeEventListener("resize", updatePortPositions);
  }, [device.type]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Только левая кнопка мыши
    const rect = iconRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    onDrag({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(e);
  };

  const getPortStyle = (port) => {
    const pos = portPositions[port.id];
    if (!pos) return {};

    const baseStyle = {
      position: "absolute",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      border: "2px solid #555",
      backgroundColor: "#222",
      cursor: "pointer",
      transform: "translate(-50%, -50%)",
      zIndex: 10
    };

    // Проверяем, используется ли порт
    const isPortInUse = connections.some(conn => 
      (conn.devA === device._id && conn.ifaceA === port.id) ||
      (conn.devB === device._id && conn.ifaceB === port.id)
    );

    if (isPortInUse) {
      baseStyle.borderColor = "#6c6";
      baseStyle.backgroundColor = "#2a2";
    }

    if (isLinking) {
      baseStyle.cursor = "crosshair";
      baseStyle.borderColor = "#66c";
      baseStyle.backgroundColor = "#22a";
    }

    return {
      ...baseStyle,
      left: `${pos.x}px`,
      top: `${pos.y}px`
    };
  };

  const getDeviceIcon = () => {
    switch (device.type) {
      case "pc":
        return "💻";
      case "router":
        return "🛜";
      case "switch":
        return "🔀";
      default:
        return "❓";
    }
  };

  return (
    <div
      ref={iconRef}
      className={`absolute select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: position.x,
        top: position.y,
        width: "80px",
        height: "80px",
        backgroundColor: "#333",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <div className="text-2xl mb-1">{getDeviceIcon()}</div>
      <div className="text-xs text-center px-1 truncate w-full">
        {device.name}
      </div>
      <div className="text-xs text-gray-400">
        {device.ip}
      </div>

      {/* Порты */}
      {(PORT_CONFIGS[device.type] || []).map(port => (
        <div
          key={port.id}
          className="port"
          style={getPortStyle(port)}
          onClick={() => onPortClick && onPortClick(device._id, port.id)}
          onMouseEnter={() => onPortHover && onPortHover(device._id, port.id, true)}
          onMouseLeave={() => onPortHover && onPortHover(device._id, port.id, false)}
          title={`${port.label} (${port.id})`}
        />
      ))}
    </div>
  );
} 