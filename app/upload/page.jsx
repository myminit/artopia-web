"use client";
import { useState, useRef } from "react";

import { PhotoIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import HeadLogo from "@/components/HeadLogo";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Upload() {
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null); // ใช้ ref เพื่อเชื่อมโยงกับ input

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // logic อัปโหลดจริง
    console.log("โพสต์:", postText);
    console.log("รูป:", image);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click(); // คลิก input เมื่อคลิกปุ่ม "Browse"
  };

  return (
    <div className="min-h-screen">
      {/* HeadLogo ด้านบน */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar ด้านซ้าย */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4">
          <div className="py-2 mx-auto">
            <h1 className="text-4xl font-bold mb-6">Upload post</h1>

            {/* Profile */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                S
              </div>
              <p className="font-medium">Scarlett</p>
            </div>

            {/* Post Textarea */}
            <textarea
              className="w-full p-8 border border-gray-300 rounded-md bg-gray-100 mb-4"
              placeholder="Write your post here"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={5}
            />

            {/* Image Upload */}
            <div className="border border-gray-200 rounded-md p-12 flex flex-col items-center justify-center text-center mb-6 relative">
              {image ? (
                <div className="relative">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="max-h-64 object-contain mb-4 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition"
                    aria-label="Remove image"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <>
                  <PhotoIcon className="w-18 h-18 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-2">
                    Add photos or drag and drop
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                style={{ backgroundColor: "#29B3F1" }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:opacity-90 transition inline-flex items-center gap-2"
                onClick={handleBrowseClick}
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                Browse
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                className="w-full border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                type="button"
                onClick={() => {
                  setPostText("");
                  setImage(null);
                }}
              >
                Cancel
              </button>
              <button
                style={{ backgroundColor: "#29B3F1" }}
                className="w-full text-white py-2 rounded-md hover:opacity-90 transition"
                onClick={handleSubmit}
              >
                Post
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
