"use client";

import { useState, useEffect, useRef } from "react";
import { useDevices } from "../context/DeviceContext";

export default function MainView() {
  const { devices, deleteDevice } = useDevices();
  const [elements, setElements] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [elementMenu, setElementMenu] = useState(null);
  const containerRef = useRef(null);

  // При загрузке devices заполняем elements с начальными координатами
  useEffect(() => {
    const loaded = devices.map((d) => ({
      id: d._id,
      name: d.name,
      type: d.type,
      ip: d.ipExternal,
      telnetPort: 23, // по умолчанию
      x: 100 + Math.random() * 200, // случайные стартовые координаты
      y: 100 + Math.random() * 200,
    }));
    setElements(loaded);
  }, [devices]);

  const handleRightClick = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setElementMenu(null);
  };

  const handleElementRightClick = (e, el) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    setElementMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      element: el,
    });
    setContextMenu(null);
  };

  const onDrag = (e, id) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  const deleteElement = (id) => {
    deleteDevice(id);
    setElements((prev) => prev.filter((el) => el.id !== id));
    setElementMenu(null);
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleRightClick}
      className="w-full h-full bg-gray-900 relative overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* Elements */}
      <div className="absolute inset-0 z-10">
        {elements.map((el) => (
          <div
            key={el.id}
            onContextMenu={(e) => handleElementRightClick(e, el)}
            onDoubleClick={() => window.open(`telnet://${el.ip}`, "_blank")}
            style={{ left: el.x, top: el.y, position: "absolute" }}
            className="cursor-move px-3 py-2 bg-gray-700 rounded shadow text-white hover:bg-gray-600 select-none"
            onMouseDown={(e) => {
              const move = (e) => onDrag(e, el.id);
              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          >
            {el.type === "router" && "🛜 Router"}
            {el.type === "switch" && "🔀 Switch"}
            {el.type === "pc" && "💻 PC"}
            <br />
            {el.ip}
          </div>
        ))}
      </div>

      {/* Context menu for element */}
      {elementMenu && (
        <ul
          className="absolute bg-gray-800 text-white rounded shadow-md z-20"
          style={{ top: elementMenu.y, left: elementMenu.x }}
        >
          <li
            onClick={() => alert(`Edit element ${elementMenu.element.id}`)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            ✏️ Edit
          </li>
          <li
            onClick={() => deleteElement(elementMenu.element.id)}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-400"
          >
            ❌ Delete
          </li>
        </ul>
      )}
    </div>
  );
}
