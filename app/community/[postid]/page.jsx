// File: app/community/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headlogo";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
  FlagIcon as FlagIconOutline,
  EllipsisVerticalIcon,
  ChatBubbleBottomCenterTextIcon as CommentIconOutline,
  UsersIcon,
  MagnifyingGlassIcon, // เพิ่มการ import MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function CommunityFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTermParam =
    searchParams.get("search")?.trim().toLowerCase() || "";

  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [user, setUser] = useState(null);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  // ฟังก์ชันจับเมนู "…" ของแต่ละโพสต์
  const toggleMenu = (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId((prevId) => (prevId === postId ? null : postId));
  };

  useEffect(() => {
    // 1) ตรวจสอบ user (guest หรือ logged-in)
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));

    // 2) ดึงโพสต์ทั้งหมด
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/community/list", {
          credentials: "include",
        });
        const data = await res.json();
        setPosts(data);

        // กำหนดสถานะ likedPosts เริ่มต้น (ยังไม่ได้กดไลก์)
        const initLikes = {};
        data.forEach((p) => {
          initLikes[p._id] = false;
        });
        setLikedPosts(initLikes);
      } catch (err) {
        console.error("Fetch community failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ฟังก์ชันเช็ก guest user ก่อนทำ action
  const checkGuestUser = () => {
    if (!user) {
      setShowGuestAlert(true);
      return true;
    }
    return false;
  };

  // ฟังก์ชันกดไลก์โพสต์
  const toggleLike = async (e, postId) => {
    e.preventDefault();
    if (checkGuestUser()) return;

    try {
      await fetch(`/api/community/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: likedPosts[postId]
                  ? p.likes.filter((uid) => uid !== "")
                  : [...p.likes, ""],
              }
            : p
        )
      );
    } catch (err) {
      console.error("Toggle like failed:", err);
    }
  };

  // ฟังก์ชันเปิด modal Report
  const openReport = (e, postId) => {
    e.preventDefault();
    if (checkGuestUser()) return;
    setReportPostId(postId);
    setShowReportModal(true);
  };

  // ส่งข้อมูล Report ไปยัง API
  const submitReport = async () => {
    if (!reportReason) {
      alert("กรุณาเลือกเหตุผลก่อน");
      return;
    }
    try {
      await fetch(`/api/community/${reportPostId}/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          detail: reportDetail,
        }),
      });
      setShowReportModal(false);
      setReportReason("");
      setReportDetail("");
      alert("Report ส่งเรียบร้อยแล้ว");
    } catch (err) {
      console.error("Submit report failed:", err);
      alert("เกิดข้อผิดพลาดในการรายงาน");
    }
  };

  // กรองโพสต์ตาม searchTermParam (ชื่อคนโพสต์ หรือ caption)
  const filteredPosts = posts.filter((p) => {
    if (!searchTermParam) return true;
    const nameMatch = p.userName.toLowerCase().includes(searchTermParam);
    const captionMatch = p.caption.toLowerCase().includes(searchTermParam);
    return nameMatch || captionMatch;
  });

  return (
    <div className="min-h-screen">
      {/* Header (fixed สูง 70px) */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Sidebar (fixed) */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-56 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content - ปรับ padding และใช้ max-width */}
        <main className="ml-56 flex-1 min-h-screen px-8 py-6 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Header Section - ใช้ Grid Layout เพื่อให้พื้นที่คงที่ */}
            <div className="h-32 mb-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl shadow-sm border border-sky-100">
              <div className="grid grid-cols-2 gap-6 h-full items-center">
                {/* Community Title - Column 1 */}
                <div className="flex items-center gap-3">
                  {/* ใช้ UsersIcon จาก Heroicons */}
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <UsersIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                      Community
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Discover amazing artworks from our community
                    </p>
                  </div>
                </div>

                {/* Search Bar - Column 2 */}
                <div className="flex justify-end">
                  <div className="w-96">
                    <form
                      className="w-full"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const value = e.target.search?.value?.trim() || "";
                        router.push(
                          value
                            ? `/community?search=${encodeURIComponent(value)}`
                            : "/community"
                        );
                      }}
                    >
                      <div className="relative flex items-center bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400">
                        <div className="pl-4 pr-2 flex-shrink-0">
                          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="search"
                          defaultValue={searchTermParam}
                          placeholder="ค้นหาโพสต์หรือชื่อผู้ใช้..."
                          className="flex-1 py-3 px-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 min-w-0"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Grid - เรียงโพสต์แถวละ 4 และมีระยะห่างเหมาะสม */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-12 justify-items-center">
              {loading
                ? // Loading Skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-72 bg-white rounded-lg shadow-sm animate-pulse"
                    >
                      <div className="bg-gray-200 h-10 rounded-t-lg"></div>
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="px-4 pb-4 flex space-x-6">
                        <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))
                : filteredPosts.map((post) => (
                    <Link
                      key={post._id}
                      href={`/community/${post._id}`}
                      passHref
                    >
                      <div className="relative bg-white rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer w-72">
                        <div className="bg-[#00AEEF] text-white flex items-center justify-between px-4 py-2 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.userAvatar || "/img/default-avatar.png"}
                              alt={post.userName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-sm">
                              {post.userName}
                            </span>
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => toggleMenu(e, post._id)}
                              className="hover:opacity-80"
                            >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                            {menuOpenId === post._id && (
                              <div
                                className="absolute right-0 mt-2 w-28 bg-white text-black rounded-md shadow-lg z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => openReport(e, post._id)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                >
                                  <FlagIconOutline className="w-4 h-4 mr-2" />
                                  Report
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* เพิ่มความสูงเป็น h-48 เพื่อให้สัดส่วนดีขึ้น */}
                        <div className="w-full h-48 bg-gray-100 overflow-hidden">
                          <img
                            src={post.thumbnailUrl}
                            alt={post.caption}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div className="p-4">
                          <p className="text-gray-800 text-sm line-clamp-2">
                            {post.caption}
                          </p>
                        </div>

                        <div className="px-4 pb-4 flex items-center space-x-6 text-gray-600">
                          <button
                            onClick={(e) => toggleLike(e, post._id)}
                            className="flex items-center space-x-1 text-black"
                          >
                            {likedPosts[post._id] ? (
                              <HeartIconSolid className="w-5 h-5 fill-current" />
                            ) : (
                              <HeartIconOutline className="w-5 h-5" />
                            )}
                            <span className="text-xs">
                              {post.likes.length || 0}
                            </span>
                          </button>
                          <div className="flex items-center space-x-1">
                            <CommentIconOutline className="w-5 h-5" />
                            <span className="text-xs">
                              {post.comments.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </main>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4">Report a problem</h3>
            <label className="block text-sm font-medium mb-1">
              Reason for reporting
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">-- Select reason --</option>
              <option value="Posting inappropriate work">
                Posting inappropriate work
              </option>
              <option value="Harassing/Trolling">Harassing/Trolling</option>
              <option value="Linking to inappropriate sites">
                Linking to inappropriate sites
              </option>
              <option value="Unsuitable content on profile">
                Unsuitable content on profile
              </option>
              <option value="Reproducing others' work">
                Reproducing others' work
              </option>
              <option value="Violating others' privacy">
                Violating others' privacy
              </option>
              <option value="This work depicts child pornography or child abuse">
                This work depicts child pornography or child abuse
              </option>
              <option value="Indicating intent to commit suicide or a crime">
                Indicating intent to commit suicide or a crime
              </option>
              <option value="Causing problems on pixiv Encyclopedia">
                Causing problems on pixiv Encyclopedia
              </option>
              <option value="Other violations of Terms of Use">
                Other violations of Terms of Use
              </option>
            </select>

            <label className="block text-sm font-medium mb-1">
              Your detailed report
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 resize-none focus:outline-none"
              placeholder="Optional details"
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
            ></textarea>

            <div className="flex justify-end space-x-2">
              <button
                onClick={submitReport}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90"
              >
                Send
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Alert Modal */}
      {showGuestAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowGuestAlert(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold text-center mb-4">
              Login Required
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please sign in to interact with posts and comments.
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 rounded-full"
                onClick={() => {
                  setShowGuestAlert(false);
                  router.push("/login");
                }}
              >
                Login
              </button>
              <button
                className="w-full bg-sky-100 hover:bg-sky-200 text-gray-700 font-semibold py-2 rounded-full"
                onClick={() => setShowGuestAlert(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
