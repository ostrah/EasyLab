"use client";

import { FaTable, FaHome } from "react-icons/fa";

export default function SideBar({ setView, collapsed }) {
  const itemStyle = "flex items-center gap-1 p-1.5 hover:bg-gray-700 rounded";
  const iconOnly = "justify-center";

  return (
    <div className={`flex flex-col gap-1 text-sm ${collapsed ? "items-center" : "items-start"}`}>
      <button onClick={() => setView("main")} className={`${itemStyle} ${collapsed ? iconOnly : ""}`}>
        <FaHome />
        {!collapsed && <span>Main</span>}
      </button>
      <button onClick={() => setView("table")} className={`${itemStyle} ${collapsed ? iconOnly : ""}`}>
        <FaTable />
        {!collapsed && <span>Table</span>}
      </button>
    </div>
  );
}
