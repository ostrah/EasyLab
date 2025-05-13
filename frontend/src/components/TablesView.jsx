"use client";

import { useState } from "react";
import { useDevices } from "../context/DeviceContext";

export default function TablesView() {
  const { devices, addDevice, deleteDevice } = useDevices();

  const [form, setForm] = useState({
    name: "",
    type: "router",
    ip: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.ip) {
      alert("❗ Все поля должны быть заполнены");
      return;
    }
    await addDevice(form);
    setForm({ name: "", type: "router", ip: "" });
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h2 className="text-lg font-bold mb-4">Devices Table</h2>

      {/* Form to add device */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-500 bg-gray-800 p-2 mr-2 rounded text-white"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border border-gray-500 bg-gray-800 p-2 mr-2 rounded text-white"
        >
          <option value="router">Router</option>
          <option value="switch">Switch</option>
          <option value="pc">PC</option>
        </select>
        <input
          name="ip"
          placeholder="IP Address"
          value={form.ip}
          onChange={handleChange}
          className="border border-gray-500 bg-gray-800 p-2 mr-2 rounded text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          ➕ Add Device
        </button>
      </form>

      {/* Table */}
      <table className="w-full text-left border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-700 px-2 py-1">Name</th>
            <th className="border border-gray-700 px-2 py-1">Type</th>
            <th className="border border-gray-700 px-2 py-1">IP Address</th>
            <th className="border border-gray-700 px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device._id} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-2 py-1">{device.name}</td>
              <td className="border border-gray-700 px-2 py-1">{device.type}</td>
              <td className="border border-gray-700 px-2 py-1">{device.ip}</td>
              <td className="border border-gray-700 px-2 py-1">
                <button
                  onClick={() => deleteDevice(device._id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
