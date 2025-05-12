// frontend/src/components/TabBar.jsx
"use client";

import { useEffect, useState } from "react";
import { useGroups } from "../context/GroupContext";

export default function TabBar() {
  const { groups, activeGroup, setActiveGroupId, createGroup, deleteGroup } = useGroups();
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!activeGroup && groups.length > 0) {
      setActiveGroupId(groups[0]._id);
    }
  }, [groups, activeGroup, setActiveGroupId]);

  const handleSetActive = (groupId) => {
    setActiveGroupId(groupId);
    setActiveId(groupId);
  };

  return (
    <div className="flex gap-2 bg-gray-800 px-4 py-2">
      {groups.map((group) => (
        <div
          key={group._id}
          className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 text-white ${
            activeGroup === group._id ? "bg-blue-600" : "bg-gray-600"
          }`}
          onClick={() => handleSetActive(group._id)}
        >
          {group.name}
          <span
            className="text-sm text-red-300 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              deleteGroup(group._id);
            }}
          >
            🗑
          </span>
        </div>
      ))}
      <button
        onClick={createGroup}
        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
      >
        +
      </button>
    </div>
  );
}
