"use client";

// frontend/src/context/GroupContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const GroupContext = createContext();

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      console.log('GroupContext: fetchGroups called');
      const res = await axios.get("http://localhost:3001/api/groups");
      const processedGroups = res.data.map(group => ({
        ...group,
        devices: group.devices
      }));
      console.log('GroupContext: fetched groups:', processedGroups);
      setGroups(processedGroups);
    } catch (err) {
      console.error("Ошибка загрузки групп", err);
    }
  };

  const createGroup = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/groups", {
        name: `Group ${groups.length + 1}`,
      });
      console.log('Created new group:', res.data);
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

  return (
    <GroupContext.Provider
      value={{ 
        groups, 
        activeGroupId, 
        setActiveGroupId: (id) => {
          console.log('GroupContext: setActiveGroupId called with:', id);
          if (id !== activeGroupId) {
            console.log('GroupContext: updating activeGroupId');
            setActiveGroupId(id);
            fetchGroups();
          }
        }, 
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

export function useGroups() {
  return useContext(GroupContext);
}
