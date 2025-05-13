"use client";

import { useRef, useEffect, useState } from "react";
import { useConnections } from "../context/ConnectionContext";

const CABLE_COLORS = {
  UTP: "#6c6",
  CROSS: "#cc6",
  SERIAL: "#c66"
};

export default function ConnectionLines({ 
  devices, 
  devicePositions,
  isLinking,
  linkingStart,
  mousePosition,
  onConnectionClick
}) {
  const svgRef = useRef(null);
  const { connections } = useConnections();
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  // Обновляем размер SVG при изменении размера окна
  useEffect(() => {
    if (!svgRef.current) return;

    const updateSize = () => {
      const rect = svgRef.current.getBoundingClientRect();
      setSvgSize({
        width: rect.width,
        height: rect.height
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Получаем координаты центра порта
  const getPortCenter = (deviceId, portId) => {
    const device = devices.find(d => d._id === deviceId);
    if (!device) return null;

    const position = devicePositions[deviceId];
    if (!position) return null;

    // Определяем позицию порта относительно устройства
    let portX, portY;
    const deviceWidth = 80; // Ширина иконки устройства
    const deviceHeight = 80; // Высота иконки устройства

    if (portId.startsWith("Gig") || portId.startsWith("Fa")) {
      if (portId.endsWith("0")) {
        portX = position.x;
        portY = position.y + deviceHeight / 2;
      } else if (portId.endsWith("1")) {
        portX = position.x + deviceWidth;
        portY = position.y + deviceHeight / 2;
      }
    } else if (portId.startsWith("Ser")) {
      portX = position.x + deviceWidth / 2;
      portY = position.y;
    } else if (portId === "eth0") {
      portX = position.x + deviceWidth / 2;
      portY = position.y + deviceHeight;
    }

    return portX && portY ? { x: portX, y: portY } : null;
  };

  // Рисуем линию соединения
  const renderConnection = (connection) => {
    const start = getPortCenter(connection.devA, connection.ifaceA);
    const end = getPortCenter(connection.devB, connection.ifaceB);
    if (!start || !end) return null;

    const color = CABLE_COLORS[connection.cableType] || CABLE_COLORS.UTP;
    const isActive = connection.status === "up";

    return (
      <g
        key={connection._id}
        onClick={() => onConnectionClick && onConnectionClick(connection)}
        className="cursor-pointer"
      >
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={color}
          strokeWidth={isActive ? 2 : 1}
          strokeDasharray={isActive ? "none" : "5,5"}
          className="transition-all duration-200 hover:stroke-width-3"
        />
        {/* Иконка статуса в середине линии */}
        <circle
          cx={(start.x + end.x) / 2}
          cy={(start.y + end.y) / 2}
          r={4}
          fill={isActive ? "#6c6" : "#c66"}
          className="transition-colors duration-200"
        />
      </g>
    );
  };

  // Рисуем временную линию при создании соединения
  const renderLinkingLine = () => {
    if (!isLinking || !linkingStart || !mousePosition) return null;

    const start = getPortCenter(linkingStart.deviceId, linkingStart.portId);
    if (!start) return null;

    return (
      <line
        x1={start.x}
        y1={start.y}
        x2={mousePosition.x}
        y2={mousePosition.y}
        stroke="#66c"
        strokeWidth={2}
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      width={svgSize.width}
      height={svgSize.height}
    >
      {/* Существующие соединения */}
      {connections.map(renderConnection)}
      
      {/* Временная линия при создании соединения */}
      {renderLinkingLine()}
    </svg>
  );
} 