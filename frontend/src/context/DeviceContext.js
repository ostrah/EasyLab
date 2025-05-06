"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DeviceContext = createContext();

export function useDevices() {
  return useContext(DeviceContext);
}

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);

  // Load devices from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("devices");
    if (saved) {
      setDevices(JSON.parse(saved));
    }
  }, []);

  // Save devices to localStorage on change
  useEffect(() => {
    localStorage.setItem("devices", JSON.stringify(devices));
  }, [devices]);

  const addDevice = (device) => {
    setDevices((prev) => [...prev, device]);
  };

  const removeDevice = (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DeviceContext.Provider value={{ devices, addDevice, removeDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}
