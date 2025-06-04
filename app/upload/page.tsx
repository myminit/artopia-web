'use client';

import React, { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [caption, setCaption]       = useState<string>('');
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const router                      = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile || !caption.trim()) {
      return alert('กรุณาใส่รูปและคำบรรยายก่อนโพสต์');
    }

    // สร้าง FormData แล้ว append ทั้ง caption + file
    const formData = new FormData();
    formData.append('postText', caption.trim());
    formData.append('image', imageFile);

    try {
      const res = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (res.ok) {
        // ถ้าอัปโหลดสำเร็จ ให้กลับไปหน้า Community Feed
        router.push('/community');
      } else {
        const data = await res.json();
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('เกิดข้อผิดพลาดขณะอัปโหลด');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>
      <div className="flex pt-[70px]">
        <aside className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 text-white shadow-lg">
          <Navbar />
        </aside>
        <main className="ml-72 flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Upload post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Textarea สำหรับ caption */}
            <textarea
              className="w-full p-4 border rounded-md"
              placeholder="Write your post here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
            />

            {/* กล่อง preview ภาพ */}
            <div className="border border-gray-200 rounded-md p-12 text-center relative">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 mb-4 rounded-md object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <>
                  <PhotoIcon className="mx-auto h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-2">Add photos or drag and drop</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                Browse
              </button>
            </div>

            {/* ปุ่ม Cancel / Post */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setCaption('');
                  setImageFile(null);
                  setPreview(null);
                }}
                className="flex-1 border py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:opacity-90"
              >
                Post
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
