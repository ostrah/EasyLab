"use client";

import { useState, useEffect, useRef } from "react";
import { useDevices } from "../context/DeviceContext";
import { useGroups } from "../context/GroupContext";
import { useConnections } from "../context/ConnectionContext";
import DeviceIcon from './DeviceIcon';
import ConnectionsLayer from './ConnectionsLayer';

export default function MainView() {
  const { devices, deleteDevice } = useDevices();
  const { groups, activeGroupId, setActiveGroupId: setGroupsActiveGroupId } = useGroups();
  const { 
    connections, 
    pending, 
    startConnection, 
    completeConnection, 
    removeConnection,
    setActiveGroupId,
    updateConnectionStatus 
  } = useConnections();
  const [elements, setElements] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [elementMenu, setElementMenu] = useState(null);
  const [connectionMenu, setConnectionMenu] = useState(null);
  const containerRef = useRef(null);

  // Update connections group ID when active group changes
  useEffect(() => {
    console.log('Setting connections group ID:', activeGroupId);
    if (setActiveGroupId) {
      setActiveGroupId(activeGroupId);
    }
  }, [activeGroupId, setActiveGroupId]);

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

  const onPortPointerDown = (element, portName, e) => {
    console.log('Port pointer down:', { element, portName, event: e });
    e.stopPropagation();
    
    if (pending) {
      console.log('Completing connection with port:', { element, portName });
      completeConnection(element._id, portName);
    } else {
      console.log('Starting connection from port:', { element, portName });
      startConnection(element._id, portName);
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

  return (
    <div
      ref={containerRef}
      onContextMenu={handleRightClick}
      className="w-full h-full bg-gray-900 relative overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* Connections Layer */}
      <ConnectionsLayer onConnectionRightClick={handleConnectionRightClick} />

      {/* Elements */}
      <div className="absolute inset-0 z-10">
        {devices.map(device => (
          <DeviceIcon
            key={device._id}
            device={device}
            onPortPointerDown={(portName, e) => onPortPointerDown(device, portName, e)}
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
              <li key={`group-${g._id}`} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
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
            onClick={() => startConnection(elementMenu.element._id, 'f0/0')}
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
