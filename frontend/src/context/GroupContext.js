"use client";

// frontend/src/context/GroupContext.js
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";

// ⛑️ null — чтобы было понятно, что провайдера может не быть
const GroupContext = createContext(null);

export function useGroups() {
  const ctx = useContext(GroupContext);
  if (!ctx) {
    throw new Error("useGroups must be used inside <GroupProvider>");
  }
  return ctx;
}

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);        // все группы
  const [activeGroupId, setActiveGroupId] = useState(null); // id выбранной

  // Мемоизированное вычисление текущей группы
  const activeGroup = useMemo(() => 
    groups.find(g => g._id === activeGroupId) || null,
    [groups, activeGroupId]
  );

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/groups");
      const processedGroups = res.data.map(group => ({
        ...group,
        devices: group.devices
      }));
      setGroups(processedGroups);
      // Устанавливаем активную группу только если она не установлена
      if (processedGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(processedGroups[0]._id);
      }
    } catch (err) {
      console.error("Ошибка загрузки групп", err);
    }
  };

  const createGroup = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/groups", {
        name: `Group ${groups.length + 1}`,
      });
      setGroups((prev) => [...prev, { ...res.data, devices: [] }]);
    } catch (err) {
      console.error("Ошибка создания группы", err);
    }
  };

  const deleteGroup = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/groups/${id}`);
      setGroups((prev) => prev.filter((g) => g._id !== id));
      if (activeGroupId === id && groups.length > 1) {
        setActiveGroupId(groups[0]._id);
      }
    } catch (err) {
      console.error("Ошибка удаления группы", err);
    }
  };

  const addDeviceToGroup = async (groupId, deviceId) => {
    try {
      await axios.post(`http://localhost:3001/api/groups/${groupId}/add-device`, {
        deviceId
      });
      await fetchGroups();
    } catch (err) {
      console.error("Ошибка добавления устройства в группу", err);
    }
  };

  const removeDeviceFromGroup = async (groupId, deviceId) => {
    try {
      await axios.post(`http://localhost:3001/api/groups/${groupId}/remove`, {
        deviceId
      });
      await fetchGroups();
    } catch (err) {
      console.error("Ошибка удаления устройства из группы", err);
    }
  };

  // Загружаем группы при монтировании
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <GroupContext.Provider
      value={{ 
        groups, 
        activeGroupId, 
        setActiveGroupId,
        activeGroup,
        createGroup, 
        deleteGroup,
        addDeviceToGroup,
        removeDeviceFromGroup,
        fetchGroups
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}
