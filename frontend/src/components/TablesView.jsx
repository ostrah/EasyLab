"use client";

import { useState } from "react";
import { useDevices } from "../context/DeviceContext";

export default function TablesView() {
  const { devices, addDevice, removeDevice } = useDevices();
  const [type, setType] = useState("Router");
  const [ip, setIp] = useState("localhost");
  const [telnetPort, setTelnetPort] = useState(5000);

  const handleAdd = () => {
    const id = Date.now();
    addDevice({ id, type, ip, telnetPort });
    setTelnetPort((p) => p + 1);
  };

  return (
    <div className="text-white">
      <h2 className="text-lg mb-2">Add Device</h2>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="text-black mb-2"
      >
        <option value="Router">Router</option>
        <option value="Switch">Switch</option>
        <option value="PC">PC</option>
      </select>
      <input
        type="text"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        placeholder="IP Address"
        className="text-black mb-2 ml-2"
      />
      <input
        type="number"
        value={telnetPort}
        onChange={(e) => setTelnetPort(Number(e.target.value))}
        placeholder="Telnet Port"
        className="text-black mb-2 ml-2"
      />
      <button
        onClick={handleAdd}
        className="bg-green-600 px-3 py-1 rounded ml-2 hover:bg-green-500"
      >
        + Add Device
      </button>

      <ul className="mt-4">
        {devices.map((d) => (
          <li key={d.id} className="flex justify-between mb-1">
            {d.type} - {d.ip}:{d.telnetPort}
            <button
              onClick={() => removeDevice(d.id)}
              className="text-red-400 hover:text-red-600"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
