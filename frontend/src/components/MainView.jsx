"use client";

import { useState, useRef, useEffect } from "react";
import { useDevices } from "../context/DeviceContext";
import { useGroups } from "../context/GroupContext";
import { useConnections } from "../context/ConnectionContext";
import DeviceIcon from "./DeviceIcon";
import ConnectionLines from "./ConnectionLines";

export default function MainView() {
  const { devices, updateDevice } = useDevices();
  const { activeGroup } = useGroups();
  const { createConnection, deleteConnection, updateConnectionStatus } = useConnections();
  
  const [devicePositions, setDevicePositions] = useState({});
  const [isLinking, setIsLinking] = useState(false);
  const [linkingStart, setLinkingStart] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const canvasRef = useRef(null);

  // Инициализация позиций устройств
  useEffect(() => {
    const positions = {};
    devices.forEach(device => {
      if (!devicePositions[device._id]) {
        positions[device._id] = {
          x: Math.random() * (window.innerWidth - 200) + 100,
          y: Math.random() * (window.innerHeight - 200) + 100
        };
      } else {
        positions[device._id] = devicePositions[device._id];
      }
    });
    setDevicePositions(prev => ({
      ...prev,
      ...positions
    }));
  }, [devices]);

  // Обработка движения мыши для режима кабеля
  useEffect(() => {
    if (!isLinking) return;

    const handleMouseMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLinking(false);
        setLinkingStart(null);
        setMousePosition(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLinking]);

  const handleDeviceDrag = (deviceId, position) => {
    setDevicePositions(prev => ({
      ...prev,
      [deviceId]: position
    }));
  };

  const handleDeviceRightClick = (e, device) => {
    e.preventDefault();
    // Здесь можно добавить контекстное меню для устройства
  };

  const handlePortClick = async (deviceId, portId) => {
    if (!isLinking) {
      // Начинаем создание соединения
      setIsLinking(true);
      setLinkingStart({ deviceId, portId });
    } else {
      // Завершаем создание соединения
      if (linkingStart.deviceId === deviceId) {
        // Нельзя соединить порт с самим собой
        setIsLinking(false);
        setLinkingStart(null);
        setMousePosition(null);
        return;
      }

      try {
        await createConnection(
          activeGroup._id,
          linkingStart.deviceId,
          linkingStart.portId,
          deviceId,
          portId
        );
      } catch (err) {
        console.error("Error creating connection:", err);
        // Здесь можно добавить уведомление об ошибке
      }

      setIsLinking(false);
      setLinkingStart(null);
      setMousePosition(null);
    }
  };

  const handlePortHover = (deviceId, portId, isHovered) => {
    if (isLinking && isHovered) {
      // Можно добавить визуальную обратную связь при наведении на порт
    }
  };

  const handleConnectionClick = (connection) => {
    setSelectedConnection(connection);
  };

  const handleCanvasClick = (e) => {
    // Если кликнули по канвасу, а не по устройству или соединению
    if (e.target === canvasRef.current) {
      setSelectedConnection(null);
      if (isLinking) {
        setIsLinking(false);
        setLinkingStart(null);
        setMousePosition(null);
      }
    }
  };

  const handleDeleteConnection = async () => {
    if (!selectedConnection) return;
    try {
      await deleteConnection(selectedConnection._id);
      setSelectedConnection(null);
    } catch (err) {
      console.error("Error deleting connection:", err);
    }
  };

  const handleToggleConnectionStatus = async () => {
    if (!selectedConnection) return;
    try {
      const newStatus = selectedConnection.status === "up" ? "down" : "up";
      await updateConnectionStatus(selectedConnection._id, newStatus);
      setSelectedConnection(null);
    } catch (err) {
      console.error("Error updating connection status:", err);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-gray-900 overflow-hidden"
      onClick={handleCanvasClick}
    >
      {/* Линии соединений */}
      <ConnectionLines
        devices={devices}
        devicePositions={devicePositions}
        isLinking={isLinking}
        linkingStart={linkingStart}
        mousePosition={mousePosition}
        onConnectionClick={handleConnectionClick}
      />

      {/* Устройства */}
      {devices.map(device => {
        // Проверяем наличие позиции и устанавливаем значение по умолчанию
        const position = devicePositions[device._id] || {
          x: Math.random() * (window.innerWidth - 200) + 100,
          y: Math.random() * (window.innerHeight - 200) + 100
        };

        return (
          <DeviceIcon
            key={device._id}
            device={device}
            position={position}
            onDrag={(pos) => handleDeviceDrag(device._id, pos)}
            onRightClick={(e) => handleDeviceRightClick(e, device)}
            isLinking={isLinking}
            onPortClick={handlePortClick}
            onPortHover={handlePortHover}
          />
        );
      })}

      {/* Панель управления выбранным соединением */}
      {selectedConnection && (
        <div 
          className="absolute bg-gray-800 p-4 rounded-lg shadow-lg"
          style={{
            left: mousePosition?.x || 0,
            top: mousePosition?.y || 0,
            transform: "translate(-50%, -100%)"
          }}
        >
          <div className="text-sm mb-2">
            {selectedConnection.devA.name} ({selectedConnection.ifaceA}) →{" "}
            {selectedConnection.devB.name} ({selectedConnection.ifaceB})
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleConnectionStatus}
              className="px-2 py-1 bg-blue-600 rounded text-sm"
            >
              {selectedConnection.status === "up" ? "Disable" : "Enable"}
            </button>
            <button
              onClick={handleDeleteConnection}
              className="px-2 py-1 bg-red-600 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Индикатор режима кабеля */}
      {isLinking && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Cable Mode Active (ESC to cancel)
        </div>
      )}
    </div>
  );
}
