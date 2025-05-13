"use client";

import { useState, useEffect, useRef } from "react";
import { useDevices } from "../context/DeviceContext";
import { useGroups } from "../context/GroupContext";
import { useConnections } from "../context/ConnectionContext";

export default function MainView() {
  const { devices, deleteDevice } = useDevices();
  const { groups, activeGroupId, setActiveGroupId, createGroup, deleteGroup } = useGroups();
  const { connections, isConnecting, sourceDevice, startConnection, completeConnection, deleteConnection } = useConnections();
  const [elements, setElements] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [elementMenu, setElementMenu] = useState(null);
  const containerRef = useRef(null);

  // При загрузке или смене группы — формируем элементы
  useEffect(() => {
    console.log('activeGroupId: ', activeGroupId, groups);
    
    if (!activeGroupId || !groups) return;

    const group = groups.find((g) => g._id === activeGroupId);
    console.log('group: ', group);
    
    if (!group) return;

    const prepared = group.devices.map((device) => ({
      id: device._id,
      name: device.name,
      type: device.type,
      ip: device.ip,
      telnetPort: 23,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    }));

    setElements(prepared);
  }, [devices, activeGroupId, groups]);

  const handleRightClick = (e) => {
    e.preventDefault();
    console.log('== containerRef: ', containerRef);
    
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setElementMenu(null);
  };

  const handleElementRightClick = (e, el) => {
    e.preventDefault();
    e.stopPropagation();
    // Очищаем обработчики перетаскивания
    if (currentDragElement) {
      currentDragElement.style.cursor = 'default';
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      setCurrentDragElement(null);
      setCurrentDragId(null);
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    setElementMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      element: el,
    });
    setContextMenu(null);
  };

  const handleElementClick = (el) => {
    if (isConnecting) {
      completeConnection(el);
    }
  };

  const onDrag = (e, id) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  // Добавляем состояние для отслеживания текущего перетаскиваемого элемента
  const [currentDragElement, setCurrentDragElement] = useState(null);
  const [currentDragId, setCurrentDragId] = useState(null);

  // Функции для обработки перетаскивания
  const move = (e) => {
    if (currentDragId) {
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onDrag(e, currentDragId);
    }
  };

  const up = () => {
    if (currentDragElement) {
      currentDragElement.style.cursor = 'grab';
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      setCurrentDragElement(null);
      setCurrentDragId(null);
    }
  };

  const deleteElement = (id) => {
    deleteDevice(id);
    setElements((prev) => prev.filter((el) => el.id !== id));
    setElementMenu(null);
  };

  const getConnectionPath = (source, target) => {
    const sourceEl = elements.find(el => el.id === source);
    const targetEl = elements.find(el => el.id === target);
    if (!sourceEl || !targetEl) return null;

    const sourceX = sourceEl.x + 50; // Assuming element width is 100px
    const sourceY = sourceEl.y + 25; // Assuming element height is 50px
    const targetX = targetEl.x + 50;
    const targetY = targetEl.y + 25;

    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleRightClick}
      className="w-full h-full bg-gray-900 relative overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* Connections */}
      <svg className="absolute inset-0 z-5 pointer-events-none" style={{height: '100%', width: '100%'}}>
        {connections.map(conn => {
          const path = getConnectionPath(conn.source, conn.target);
          if (!path) return null;
          return (
            <g key={`connection-${conn.id}`}>
              <path
                key={`path-${conn.id}`}
                d={path}
                stroke={isConnecting ? "#4CAF50" : "#666"}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>

      {/* Elements */}
      <div className="absolute inset-0 z-10">
        {elements.map((el) => (
          <div
            key={`element-${el.id}`}
            onClick={() => handleElementClick(el)}
            onContextMenu={(e) => handleElementRightClick(e, el)}
            onDoubleClick={() => window.open(`telnet://${el.ip}`, "_blank")}
            style={{ left: el.x, top: el.y, position: "absolute" }}
            className={`px-3 py-2 bg-gray-700 rounded shadow text-white hover:bg-gray-600 select-none ${
              isConnecting ? "ring-2 ring-green-500" : ""
            } ${sourceDevice?.id === el.id ? "ring-2 ring-blue-500" : ""}`}
            onMouseDown={(e) => {
              if (e.button === 0) { // Только для левой кнопки мыши
                e.currentTarget.style.cursor = 'grabbing';
                setCurrentDragElement(e.currentTarget);
                setCurrentDragId(el.id);
                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
              }
            }}
            onMouseEnter={(e) => {
              if (!isConnecting && !currentDragElement) {
                e.currentTarget.style.cursor = 'grab';
              }
            }}
            onMouseLeave={(e) => {
              if (!currentDragElement) {
                e.currentTarget.style.cursor = 'default';
              }
            }}
          >
            {el.type === "router" && "🛜 Router"}
            {el.type === "switch" && "🔀 Switch"}
            {el.type === "pc" && "💻 PC"}
            <br />
            {el.ip}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          key="context-menu"
          className="absolute bg-gray-800 text-white rounded shadow-md z-20"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul>
            {groups.map(g => (
              <li key={`group-${g._id}`} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                {g.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Context menu for element */}
      {elementMenu && (
        <ul
          key="element-menu"
          className="absolute bg-gray-800 text-white rounded shadow-md z-20"
          style={{ top: elementMenu.y, left: elementMenu.x }}
        >
          <li
            key="edit"
            onClick={() => alert(`Edit element ${elementMenu.element.id}`)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            ✏️ Edit
          </li>
          <li
            key="connect"
            onClick={() => startConnection(elementMenu.element)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            🔌 Connect
          </li>
          <li
            key="delete"
            onClick={() => deleteElement(elementMenu.element.id)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-400"
          >
            ❌ Delete
          </li>
        </ul>
      )}
    </div>
  );
}
