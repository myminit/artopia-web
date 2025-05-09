"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import HeadLogo from "@/components/HeadLogo";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    // 🔧 Mock data จำลองโพสต์
    const mockPosts = [
      {
        _id: "1",
        user: "Scarlett",
        caption: "My new drawing ✨",
        imageUrl: "https://placekitten.com/400/300",
        createdAt: "2024-04-25T14:00:00Z",
      },
      {
        _id: "2",
        user: "TINNY",
        caption: "about cat",
        imageUrl: "/img/cat.jpg",
        createdAt: "2024-04-26T09:00:00Z",
      },
    ];

    // 🔃 เรียงโพสต์จากใหม่ -> เก่า
    const sorted = mockPosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setPosts(sorted);
  }, []);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };


  return (
    <div className="min-h-screen">
      {/* HeadLogo */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4 bg-white">
          <h2 className="text-4xl font-bold text-black mb-6">Community</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="relative bg-white border rounded-lg shadow-md p-2 hover:shadow-lg transition"
              >
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <Image
                    src="/img/user.png"
                    alt="User"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <span className="text-black text-base font-medium">
                    {post.user}
                  </span>
                </div>

                {/* Caption */}
                <p className="text-sm font-medium mt-2 text-black">
                  {post.caption}
                </p>

                {/* Like Button */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className="text-black transition-colors"
                  >
                    {likedPosts[post._id] ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIconOutline className="w-5 h-5 hover:text-red-500" />
                    )}
                  </button>
                </div>

                {/* Image */}
                <div className="w-full h-36 bg-gray-100 rounded-md mt-2 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}