"use client";

import Image from "next/image";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import HeadLogo from "../components/HeadLogo";

export default function Home() {
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
        <main className="ml-72 flex-1 overflow-y-auto p-6 bg-white">
          {/* Banner */}
          <div className="w-full">
            <Image
              src="/img/banner.png"
              alt="Artopia Banner"
              width={1100}
              height={100}
              priority
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Gallery Section */}
          <div className="px-6 py-10">
            <h2 className="text-2xl font-bold text-black mb-4">Gallery</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="relative bg-white border rounded-lg shadow-md p-2 hover:shadow-lg transition"
                >
                  {/* Three Dots Button */}
                  <div className="absolute top-2 right-2">
                    <button
                      aria-label="More options"
                      className="text-black hover:text-gray-700"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Placeholder */}
                  <div className="w-full h-36 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-400">Artwork</span>
                  </div>

                  {/* Info */}
                  <p className="text-sm font-medium mt-2 text-black">
                    about cat
                  </p>
                  <p className="text-xs text-gray-500">
                    Last update 24 Jun 2025
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
