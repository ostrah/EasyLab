"use client";

import { useState, useEffect, useRef } from "react";
import { useDevices } from "../context/DeviceContext";
import { useGroups } from "../context/GroupContext";
import { useConnections } from "../context/ConnectionContext";
import DeviceIcon from './DeviceIcon';
import ConnectionsLayer from './ConnectionsLayer';

export default function MainView() {
  const { devices, deleteDevice } = useDevices();
  const { groups, activeGroupId, setActiveGroupId: setGroupsActiveGroupId, activeGroup } = useGroups();
  const { 
    connections, 
    pending, 
    startConnection, 
    completeConnection, 
    removeConnection,
    setActiveGroupId: setConnectionsGroupId,
    updateConnectionStatus 
  } = useConnections();
  const [elements, setElements] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [elementMenu, setElementMenu] = useState(null);
  const [connectionMenu, setConnectionMenu] = useState(null);
  const [showHelp, setShowHelp] = useState(true);
  const containerRef = useRef(null);

  // Update connections group ID when active group changes
  useEffect(() => {
    console.log('Setting connections group ID:', activeGroupId);
    if (setConnectionsGroupId) {
      setConnectionsGroupId(activeGroupId);
    }
  }, [activeGroupId, setConnectionsGroupId]);

  // При загрузке или смене группы — формируем элементы
  useEffect(() => {
    console.log('activeGroupId: ', activeGroupId, groups);
    
    if (!activeGroupId || !groups) return;

    const group = groups.find((g) => g._id === activeGroupId);
    console.log('group: ', group);
    
    if (!group) return;

    const prepared = group.devices.map((device) => ({
      ...device,
      position: {
        x: device.position?.x || 100 + Math.random() * 200,
        y: device.position?.y || 100 + Math.random() * 200
      }
    }));

    setElements(prepared);
  }, [devices, activeGroupId, groups]);

  const handleRightClick = (e) => {
    // TODO:...
    e.preventDefault();
    console.log('== containerRef: ', containerRef);
    
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setElementMenu(null);
    setConnectionMenu(null);
  };

  const handleGroupSelect = (groupId) => {
    setGroupsActiveGroupId(groupId);
    setContextMenu(null);
  };

  const handleConnectionRightClick = (e, connection) => {
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    setConnectionMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      connection
    });
    setContextMenu(null);
    setElementMenu(null);
  };

  const handleElementRightClick = (e, el) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    setElementMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      element: el,
    });
    setContextMenu(null);
    setConnectionMenu(null);
  };

  const handleElementClick = (el, e) => {
    console.log('Element clicked:', { element: el, event: e });
    
    if (pending) {
      console.log('Completing connection with element:', el);
      completeConnection(el._id, 'f0/0');
    }
  };

  const onPortPointerDown = (deviceId, portName, e) => {
    console.log('Port pointer down:', { deviceId, portName, event: e });
    e.stopPropagation();
    
    if (pending) {
      console.log('Completing connection with port:', { portName });
      completeConnection(pending.deviceId, portName);
    } else {
      console.log('Starting connection from port:', { portName });
      startConnection(deviceId, portName);
    }
  };

  const deleteElement = (id) => {
    deleteDevice(id);
    setElements((prev) => prev.filter((el) => el._id !== id));
    setElementMenu(null);
  };

  const deleteConnection = (connectionId) => {
    removeConnection(connectionId);
    setConnectionMenu(null);
  };

  const toggleConnectionStatus = (connectionId, currentStatus) => {
    const newStatus = currentStatus === 'up' ? 'down' : 'up';
    updateConnectionStatus(connectionId, newStatus);
    setConnectionMenu(null);
  };

  const groupDeviceIds = (activeGroup?.devices || []).map(d => d._id);
  const groupConnections = connections.filter(
    conn =>
      groupDeviceIds.includes(conn.devA?._id || conn.devA) &&
      groupDeviceIds.includes(conn.devB?._id || conn.devB)
  );
  console.log('groupConnections: ', groupConnections);

  return (
    <div
      ref={containerRef}
      onContextMenu={handleRightClick}
      className="w-full h-full bg-gray-900 relative overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* Help overlay */}
      {showHelp && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-30 max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Как работать с соединениями:</h3>
            <button 
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            <li>1. <span className="font-medium">Создание соединения:</span> Кликните на порт первого устройства, затем на порт второго</li>
            <li>2. <span className="font-medium">Управление соединением:</span> Правый клик на линии соединения</li>
            <li>3. <span className="font-medium">Управление устройством:</span> Правый клик на устройстве</li>
            <li>4. <span className="font-medium">Выбор группы:</span> Правый клик на пустом месте</li>
          </ul>
        </div>
      )}

      {/* Connections Layer */}
      <ConnectionsLayer
        connections={groupConnections}
        onConnectionRightClick={handleConnectionRightClick}
      />

      {/* Elements */}
      <div className="absolute inset-0 z-10">
        {(activeGroup?.devices || []).map(device => (
          <DeviceIcon
            key={device._id}
            device={device}
            onPortPointerDown={(e) => onPortPointerDown(device._id, 'f0/0', e)}
            onClick={(e) => handleElementClick(device, e)}
            onContextMenu={(e) => handleElementRightClick(e, device)}
          />
        ))}
      </div>

      {/* Context menus */}
      {contextMenu && (
        <div
          key="context-menu"
          className="absolute bg-gray-800 text-white rounded shadow-md z-20"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul>
            {groups.map(g => (
              <li 
                key={`group-${g._id}`} 
                onClick={() => handleGroupSelect(g._id)}
                className={`px-4 py-2 hover:bg-gray-700 cursor-pointer ${g._id === activeGroupId ? 'bg-gray-700' : ''}`}
              >
                {g.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {elementMenu && (
        <ul
          key="element-menu"
          className="absolute bg-gray-800 text-white rounded shadow-md z-20"
          style={{ top: elementMenu.y, left: elementMenu.x }}
        >
          <li
            key="edit"
            onClick={() => alert(`Edit element ${elementMenu.element._id}`)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            ✏️ Edit
          </li>
          <li
            key="connect"
            onClick={(e) => onPortPointerDown(elementMenu.element._id, 'f0/0', e)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            🔌 Connect
          </li>
          <li
            key="delete"
            onClick={() => deleteElement(elementMenu.element._id)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-400"
          >
            ❌ Delete
          </li>
        </ul>
      )}

      {connectionMenu && (
        <ul
          key="connection-menu"
          className="absolute bg-gray-800 text-white rounded shadow-md z-20"
          style={{ top: connectionMenu.y, left: connectionMenu.x }}
        >
          <li
            key="status"
            onClick={() => toggleConnectionStatus(connectionMenu.connection._id, connectionMenu.connection.status)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            {connectionMenu.connection.status === 'up' ? '🔴 Disable' : '🟢 Enable'}
          </li>
          <li
            key="delete"
            onClick={() => deleteConnection(connectionMenu.connection._id)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-400"
          >
            ❌ Delete
          </li>
        </ul>
      )}
    </div>
  );
}
