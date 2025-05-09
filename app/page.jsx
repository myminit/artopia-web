"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import Navbar from "@/components/Navbar";
import HeadLogo from "@/components/HeadLogo";

export default function Gallery() {
  const [drawings, setDrawings] = useState([]);
  const [activePopupId, setActivePopupId] = useState(null); // id รูปที่เปิด popup
  const [editingId, setEditingId] = useState(null); // id รูปที่กำลังแก้ไขชื่อ
  const [newTitle, setNewTitle] = useState(""); // ชื่อใหม่ที่แก้

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        const mockDrawings = [
          {
            id: "1",
            title: "About Cat",
            imageUrl: "/img/cat.jpg",
            updatedAt: "2025-04-25T14:00:00Z",
          },
          {
            id: "2",
            title: "Lovely Sunset",
            imageUrl: "/img/mock-sunset.png",
            updatedAt: "2025-04-20T18:30:00Z",
          },
          {
            id: "3",
            title: "Cityscape",
            imageUrl: "/img/mock-city.png",
            updatedAt: "2025-04-18T10:15:00Z",
          },
        ];

        const sortedDrawings = mockDrawings.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setDrawings(sortedDrawings);
      } catch (error) {
        console.error("Failed to fetch drawings:", error);
      }
    };

    fetchDrawings();
  }, []);

  const togglePopup = (id) => {
    setActivePopupId((prevId) => (prevId === id ? null : id));
    setEditingId(null); // ปิดโหมดแก้ไขชื่อ ถ้าเปิด popup ใหม่
  };

  const startEditing = (id, currentTitle) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const saveTitle = (id) => {
    if (!newTitle.trim()) return; // กันชื่อว่าง
    const updatedDrawings = drawings.map((drawing) =>
      drawing.id === id ? { ...drawing, title: newTitle } : drawing
    );
    setDrawings(updatedDrawings);
    setEditingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      saveTitle(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HeadLogo */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px]">
        {/* Navbar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main */}
        <main className="ml-72 flex-1 overflow-y-auto p-6">
          {/* Banner */}
          <div className="w-full mb-8">
            <Image
              src="/img/banner.png"
              alt="Artopia Banner"
              width={1200}
              height={200}
              priority
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          {/* Gallery */}
          <div className="px-2 py-4">
            <h2 className="text-3xl font-bold text-black mb-6">My Gallery</h2>

            {drawings.length === 0 ? (
              <p className="text-gray-500 text-center">
                ยังไม่มีงานที่บันทึกไว้
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {drawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="relative bg-white border rounded-lg shadow hover:shadow-lg transition p-2"
                  >
                    {/* More options button */}
                    <div className="absolute top-2 right-2">
                      <button
                        aria-label="More options"
                        onClick={() => togglePopup(drawing.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Popup */}
                    {activePopupId === drawing.id && (
                      <div className="absolute top-10 right-2 bg-white border shadow-lg rounded-md w-48 p-3 z-50">
                        {/* ถ้าอยู่ในโหมดแก้ไขชื่อ */}
                        {editingId === drawing.id ? (
                          <input
                            type="text"
                            value={newTitle}
                            onChange={handleTitleChange}
                            onBlur={() => saveTitle(drawing.id)}
                            onKeyDown={(e) => handleKeyDown(e, drawing.id)}
                            className="rounded p-1 w-full text-sm mb-2 focus:outline-none focus:ring-2 "
                            autoFocus
                          />
                        ) : (
                          <div
                            className="flex items-center mb-2 cursor-pointer"
                            onClick={() =>
                              startEditing(drawing.id, drawing.title)
                            }
                          >
                            <span className="text-sm font-semibold text-black truncate">
                              {drawing.title}
                            </span>
                            <PencilSquareIcon className="w-4 h-4 ml-2 text-gray-600" />
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mb-2">
                          อัปเดตล่าสุด:{" "}
                          {new Date(drawing.updatedAt).toLocaleDateString()}
                        </div>

                        <button className="flex items-center w-full text-sm text-gray-700 hover:text-blue-600 mb-2">
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                          ดาวน์โหลด
                        </button>

                        <button className="flex items-center w-full text-sm text-gray-700 hover:text-red-600">
                          <TrashIcon className="w-4 h-4 mr-2" />
                          ลบ
                        </button>
                      </div>
                    )}

                    {/* Image */}
                    <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={drawing.imageUrl}
                        alt={drawing.title}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Info */}
                    <div className="mt-2">
                      <p className="text-base font-semibold text-black truncate">
                        {drawing.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        อัพเดตล่าสุด:{" "}
                        {new Date(drawing.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
