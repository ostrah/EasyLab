"use client";

import { useState } from "react";
import { useDevices } from "../context/DeviceContext";
import { useGroups } from "../context/GroupContext";
import { useConnections } from "../context/ConnectionContext";

export default function GroupEditor() {
  const { devices, addDevice, updateDevice, deleteDevice } = useDevices();
  const { 
    groups = [], 
    activeGroupId, 
    setActiveGroupId, 
    createGroup, 
    updateGroup, 
    deleteGroup, 
    addDeviceToGroup, 
    removeDeviceFromGroup,
    fetchGroups 
  } = useGroups();
  const { connections, createConnection, deleteConnection } = useConnections();
  
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({ name: "", type: "pc", ip: "" });

  if (!groups.length) {
    return <p className="p-4">Нет групп для отображения</p>;
  }

  const activeGroup = groups.find(g => g._id === activeGroupId);
  if (!activeGroup) {
    return <p className="p-4">Выберите группу</p>;
  }

  const groupConnections = connections.filter(conn => 
    activeGroup.devices.some(d => d._id === conn.source) && 
    activeGroup.devices.some(d => d._id === conn.target)
  );

  const handleCreateConnection = () => {
    if (selectedSource && selectedTarget && selectedSource !== selectedTarget) {
      createConnection(selectedSource, selectedTarget);
      setSelectedSource(null);
      setSelectedTarget(null);
    }
  };

  const handleAddDeviceToGroup = async (deviceId) => {
    if (!activeGroup) return;
    await addDeviceToGroup(activeGroupId, deviceId);
  };

  const handleRemoveDeviceFromGroup = async (deviceId) => {
    if (!activeGroup) return;
    await removeDeviceFromGroup(activeGroupId, deviceId);
  };

  const handleCreateDevice = async () => {
    await addDevice(newDevice);
    setNewDevice({ name: "", type: "pc", ip: "" });
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d._id === deviceId);
    return device ? `${device.name} (${device.ip})` : deviceId;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Group Editor</h2>
        <div className="flex gap-2">
          <select
            value={activeGroupId || ""}
            onChange={(e) => setActiveGroupId(e.target.value)}
            className="bg-gray-700 rounded px-3 py-2"
          >
            <option value="">Select Group</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            onClick={createGroup}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            New Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left column: Devices management */}
        <div className="space-y-6">
          {/* Create new device */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Create New Device</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Device Name"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="w-full bg-gray-700 rounded px-3 py-2"
              />
              <select
                value={newDevice.type}
                onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                className="w-full bg-gray-700 rounded px-3 py-2"
              >
                <option value="pc">PC</option>
                <option value="router">Router</option>
                <option value="switch">Switch</option>
              </select>
              <input
                type="text"
                placeholder="IP Address"
                value={newDevice.ip}
                onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                className="w-full bg-gray-700 rounded px-3 py-2"
              />
              <button
                onClick={handleCreateDevice}
                disabled={!newDevice.name || !newDevice.ip}
                className="w-full bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
              >
                Create Device
              </button>
            </div>
          </div>

          {/* Available devices */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Available Devices</h3>
            <div className="space-y-2">
              {devices.map(device => (
                <div
                  key={device._id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div>
                    <div className="font-medium">
                      {device.type === "router" && "🛜 "}
                      {device.type === "switch" && "🔀 "}
                      {device.type === "pc" && "💻 "}
                      {device.name}
                    </div>
                    <div className="text-sm text-gray-400">{device.ip}</div>
                  </div>
                  {activeGroup && (
                    <button
                      onClick={() => handleAddDeviceToGroup(device._id)}
                      disabled={activeGroup.devices.some(d => d._id === device._id)}
                      className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      Add to Group
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Group devices and connections */}
        <div className="space-y-6">
          {/* Group devices */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Group Devices</h3>
            <div className="space-y-2">
              {activeGroup?.devices.map(device => (
                <div
                  key={device._id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div>
                    <div className="font-medium">
                      {device.type === "router" && "🛜 "}
                      {device.type === "switch" && "🔀 "}
                      {device.type === "pc" && "💻 "}
                      {device.name}
                    </div>
                    <div className="text-sm text-gray-400">{device.ip}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveDeviceFromGroup(device._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(!activeGroup || activeGroup.devices.length === 0) && (
                <div className="text-gray-400 text-center py-4">
                  No devices in group
                </div>
              )}
            </div>
          </div>

          {/* Create connection */}
          {activeGroup && activeGroup.devices.length > 1 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Create Connection</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Source Device</label>
                  <select
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    value={selectedSource || ""}
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    <option value="">Select source device</option>
                    {activeGroup.devices.map(device => (
                      <option key={device._id} value={device._id}>
                        {device.name} ({device.ip})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">Target Device</label>
                  <select
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    value={selectedTarget || ""}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                  >
                    <option value="">Select target device</option>
                    {activeGroup.devices.map(device => (
                      <option key={device._id} value={device._id}>
                        {device.name} ({device.ip})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCreateConnection}
                  disabled={!selectedSource || !selectedTarget || selectedSource === selectedTarget}
                  className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
                >
                  Create Connection
                </button>
              </div>
            </div>
          )}

          {/* Existing connections */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Group Connections</h3>
            <div className="space-y-2">
              {groupConnections.map(conn => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span>{getDeviceName(conn.source)}</span>
                    <span>→</span>
                    <span>{getDeviceName(conn.target)}</span>
                  </div>
                  <button
                    onClick={() => deleteConnection(conn.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {groupConnections.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  No connections in group
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 