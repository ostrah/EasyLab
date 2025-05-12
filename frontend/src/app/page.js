// app/page.js

"use client";

import { useState } from "react";
import MainView from "../components/MainView";
import TablesView from "../components/TablesView";
import GroupEditor from "../components/GroupEditor";
import SideBar from "../components/SideBar";
import TabBar from "../components/TabBar";

export default function Home() {
  const [view, setView] = useState("main");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="flex h-screen">
      <div className={`${collapsed ? "w-12" : "w-48"} bg-gray-800 p-2 transition-all duration-300 relative`}>
        <SideBar setView={setView} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1 right-1 w-5 h-5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded shadow z-20"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <TabBar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1">
          {view === "main" && <MainView />}
          {view === "table" && <TablesView />}
          {view === "connections" && <GroupEditor />}
        </div>
      </div>
    </main>
  );
}