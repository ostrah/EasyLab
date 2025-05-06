"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// ⚙️ Адаптируем базовый URL, чтобы не менять много раз (удобно для прод/локальной отладки)
const API_BASE_URL = "http://localhost:3001/api";

const DeviceContext = createContext();

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/devices`);
      setDevices(res.data);
    } catch (err) {
      console.error("❌ Ошибка при получении устройств:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (deviceData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/devices`, deviceData);
      setDevices((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("❌ Ошибка при добавлении устройства:", err.message);
    }
  };

  const deleteDevice = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/devices/${id}`);
      setDevices((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("❌ Ошибка при удалении устройства:", err.message);
    }
  };

  const connectDevices = async (id, targetId) => {
    try {
      await axios.post(`${API_BASE_URL}/devices/${id}/connect`, { targetId });
      await fetchDevices();
    } catch (err) {
      console.error("❌ Ошибка при соединении устройств:", err.message);
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        loading,
        addDevice,
        deleteDevice,
        connectDevices,
        fetchDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  return useContext(DeviceContext);
}
