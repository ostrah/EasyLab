// app/page.js

"use client";

import { useState } from "react";
import SideBar from "../components/SideBar";
import TabBar from "../components/TabBar";
import MainView from "../components/MainView";
import TablesView from "../components/TablesView";

export default function HomePage() {
  const [view, setView] = useState("main");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabs, setTabs] = useState(["Group 1"]);
  const [activeTab, setActiveTab] = useState("Group 1");

  const addTab = () => {
    const nextNumber = tabs.length + 1;
    const newTab = `Group ${nextNumber}`;
    setTabs([...tabs, newTab]);
    setActiveTab(newTab);
  };

  const deleteTab = (tab) => {
    if (tab === "Group 1") return;
    const newTabs = tabs.filter((t) => t !== tab);
    setTabs(newTabs);
    if (activeTab === tab) setActiveTab("Group 1");
  };

  return (
    <div className="flex h-screen">
      <aside className={`${sidebarCollapsed ? "w-14" : "w-48"} bg-gray-800 p-1.5 transition-all duration-300 relative`}>
        <SideBar setView={setView} collapsed={sidebarCollapsed} />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1 right-1 w-5 h-5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded shadow z-20"
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </aside>
      <main className="flex-1 flex flex-col">
        {view === "main" && (
          <>
            <header className="bg-gray-700 px-4 py-2">
              <TabBar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                addTab={addTab}
                deleteTab={deleteTab}
              />
            </header>
            <section className="flex-1 p-4 bg-gray-900">
              <MainView />
            </section>
          </>
        )}
        {view === "table" && (
          <section className="flex-1 p-4 bg-gray-900">
            <TablesView />
          </section>
        )}
      </main>
    </div>
  );
}