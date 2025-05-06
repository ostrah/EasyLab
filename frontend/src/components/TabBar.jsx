"use client";

export default function TabBar({ tabs, activeTab, setActiveTab, addTab, deleteTab }) {
  return (
    <div className="flex gap-2 items-center">
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`flex items-center gap-1 px-4 py-2 rounded cursor-pointer ${
            tab === activeTab ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
          {tab !== "Group 1" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                deleteTab(tab);
              }}
              className="ml-2 text-red-300 hover:text-red-500 cursor-pointer"
            >
              🗑
            </span>
          )}
        </div>
      ))}
      <button
        onClick={addTab}
        className="px-3 py-2 bg-green-600 rounded hover:bg-green-500"
      >
        +
      </button>
    </div>
  );
}