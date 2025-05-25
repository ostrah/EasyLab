"use client";

import { useState } from "react";
import { useDevices } from "../context/DeviceContext";
import { useConnections } from "../context/ConnectionContext";

export default function ConnectionsView() {
  const { devices } = useDevices();
  const { connections, deleteConnection, createConnection } = useConnections();
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedSourceInterface, setSelectedSourceInterface] = useState(null);
  const [selectedTargetInterface, setSelectedTargetInterface] = useState(null);

  const handleCreateConnection = () => {
    if (selectedSource && selectedTarget && selectedSourceInterface && selectedTargetInterface && selectedSource !== selectedTarget) {
      createConnection(selectedSource, selectedTarget, selectedSourceInterface, selectedTargetInterface);
      setSelectedSource(null);
      setSelectedTarget(null);
      setSelectedSourceInterface(null);
      setSelectedTargetInterface(null);
    }
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d._id === deviceId);
    return device ? `${device.name} (${device.ip})` : deviceId;
  };

  const getDeviceInterfaces = (deviceId) => {
    const device = devices.find(d => d._id === deviceId);
    return device ? device.interfaces : [];
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Connections</h2>
      
      {/* Create new connection */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Create New Connection рппн</h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm mb-1">Source Device</label>
              <select
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={selectedSource || ""}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setSelectedSourceInterface(null);
                }}
              >
                <option value="">Select source device</option>
                {devices.map(device => (
                  <option key={device._id} value={device._id}>
                    {device.name} ({device.ip})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Source Interface</label>
              <select
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={selectedSourceInterface || ""}
                onChange={(e) => setSelectedSourceInterface(e.target.value)}
                disabled={!selectedSource}
              >
                <option value="">Select source interface</option>
                {selectedSource && getDeviceInterfaces(selectedSource).map(iface => (
                  <option key={iface.name} value={iface.name}>
                    {iface.name} ({iface.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm mb-1">Target Device</label>
              <select
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={selectedTarget || ""}
                onChange={(e) => {
                  setSelectedTarget(e.target.value);
                  setSelectedTargetInterface(null);
                }}
              >
                <option value="">Select target device</option>
                {devices.map(device => (
                  <option key={device._id} value={device._id}>
                    {device.name} ({device.ip})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Target Interface</label>
              <select
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={selectedTargetInterface || ""}
                onChange={(e) => setSelectedTargetInterface(e.target.value)}
                disabled={!selectedTarget}
              >
                <option value="">Select target interface</option>
                {selectedTarget && getDeviceInterfaces(selectedTarget).map(iface => (
                  <option key={iface.name} value={iface.name}>
                    {iface.name} ({iface.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateConnection}
            disabled={!selectedSource || !selectedTarget || !selectedSourceInterface || !selectedTargetInterface || selectedSource === selectedTarget}
            className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            Create Connection
          </button>
        </div>
      </div>

      {/* Existing connections */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Existing Connections</h3>
        <div className="space-y-2">
          {connections.map(conn => (
            <div
              key={conn.id}
              className="flex items-center justify-between bg-gray-700 p-3 rounded"
            >
              <div className="flex items-center gap-2">
                <span>{getDeviceName(conn.source)} ({conn.sourceInterface})</span>
                <span>→</span>
                <span>{getDeviceName(conn.target)} ({conn.targetInterface})</span>
              </div>
              <button
                onClick={() => deleteConnection(conn.id)}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          ))}
          {connections.length === 0 && (
            <div className="text-gray-400 text-center py-4">
              No connections created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 