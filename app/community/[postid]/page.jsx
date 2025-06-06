// File: app/community/[postid]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headlogo";
import Image from "next/image";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
  ChatBubbleBottomCenterTextIcon as CommentIconOutline,
  FlagIcon as FlagIconOutline,
  ArrowLeftIcon,
  PaperAirplaneIcon as SendIcon,
} from "@heroicons/react/24/outline";

export default function PostDetailPage() {
  const router = useRouter();
  const { postid } = useParams();

  const [post, setPost] = useState(null);
  const [hearted, setHearted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // เก็บข้อความ reply ของแต่ละ comment ด้วย object: { [commentId]: replyText }
  const [replyText, setReplyText] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [user, setUser] = useState(null);

  // เพิ่ม state สำหรับ guest alert popup
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  // ฟังก์ชันสำหรับโหลดข้อมูลโพสต์และคอมเมนต์
  const loadPostAndComments = async () => {
    try {
      // โหลดข้อมูลโพสต์
      const postRes = await fetch(`/api/community/${postid}`, {
        credentials: "include",
      });
      if (!postRes.ok) return;
      const postData = await postRes.json();
      setPost(postData);

      // โหลดข้อมูล comments พร้อม user data
      const commentsRes = await fetch(`/api/community/${postid}/comment`, {
        credentials: "include",
      });
      if (!commentsRes.ok) return;
      const { comments: commentsData } = await commentsRes.json();

      // โหลด replies พร้อม user data สำหรับแต่ละ comment
      for (const comment of commentsData) {
        const repliesRes = await fetch(
          `/api/community/${postid}/comment/${comment._id}/reply`,
          {
            credentials: "include",
          }
        );
        if (repliesRes.ok) {
          const { replies } = await repliesRes.json();
          comment.replies = replies;
        }
      }

      setComments(commentsData);
    } catch (err) {
      console.error("Fetch post detail failed:", err);
    }
  };

  // Effect สำหรับโหลดข้อมูล user และตั้ง interval สำหรับรีเฟรชข้อมูล
  useEffect(() => {
    // โหลด user
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));

    if (!postid) return;

    // โหลดโพสต์และคอมเมนต์
    (async () => {
      try {
        const postRes = await fetch(`/api/community/${postid}`, {
          credentials: "include",
        });
        if (!postRes.ok) return;
        const postData = await postRes.json();
        setPost(postData);

        // ตรวจสอบว่า user นี้กดไลก์โพสต์นี้หรือยัง
        if (postData.likes && user && user._id) {
          setHearted(postData.likes.includes(user._id));
        } else {
          setHearted(false);
        }

        // โหลด comments
        const commentsRes = await fetch(`/api/community/${postid}/comment`, {
          credentials: "include",
        });
        if (!commentsRes.ok) return;
        const { comments: commentsData } = await commentsRes.json();

        // โหลด replies
        for (const comment of commentsData) {
          const repliesRes = await fetch(
            `/api/community/${postid}/comment/${comment._id}/reply`,
            {
              credentials: "include",
            }
          );
          if (repliesRes.ok) {
            const { replies } = await repliesRes.json();
            comment.replies = replies;
          }
        }
        setComments(commentsData);
      } catch (err) {
        console.error("Fetch post detail failed:", err);
      }
    })();
  }, [postid, user && user._id]);

  // ฟังก์ชันตรวจสอบว่าเป็น guest user หรือไม่
  const checkGuestUser = () => {
    if (!user) {
      setShowGuestAlert(true);
      return true;
    }
    return false;
  };

  if (!post) {
    // ไม่ต้องขึ้นกำลังโหลด ให้แสดง Navbar และ HeadLogo ตามปกติ
    return (
      <div className="min-h-screen">
        <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
          <HeadLogo />
        </div>
        <div className="flex pt-[70px] h-screen">
          <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-50 bg-sky-400 z-40 shadow">
            <Navbar />
          </div>
          <main className="ml-50 flex-1 overflow-y-auto px-6 py-4 pt-6" />
        </div>
      </div>
    );
  }

  // ── 2. Toggle Like ของตัวโพสต์ ───────────────────────────────────────────
  const toggleLikePost = async () => {
    if (checkGuestUser()) return;
    try {
      await fetch(`/api/community/${post._id}/like`, {
        method: "POST",
        credentials: "include",
      });
      setHearted((h) => !h);
      setPost((p) => {
        if (!user || !user._id) return p;
        return {
          ...p,
          likes: hearted
            ? p.likes.filter((uid) => uid !== user._id)
            : [...p.likes, user._id],
        };
      });
    } catch (err) {
      console.error("Toggle like post failed:", err);
    }
  };

  // ── 3. Toggle Like ของ comment/reply ใด ๆ ─────────────────────────────────
  // รับ param เป็น commentId หรือ replyId โดยจะค้นใน level-1 หรือ level-2 ก็ได้
  const toggleLikeComment = async (commentId) => {
    // ตรวจสอบ guest user ก่อน
    if (checkGuestUser()) return;

    try {
      await fetch(`/api/community/${post._id}/comment/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      });

      // ปรับค่า local state ให้ตรงกับ API: หา comment/reply แล้วสลับ like ในหน้าเดียว
      setComments((prev) =>
        prev.map((c) => {
          // 1) ถ้า comment นี้ตรงกับ commentId
          if (c._id === commentId) {
            const likesArr = c.likes || [];
            if (likesArr.includes("")) {
              return { ...c, likes: likesArr.filter((x) => x !== "") };
            } else {
              return { ...c, likes: [...likesArr, ""] };
            }
          }
          // 2) ถ้าไม่ใช่ ให้ไปตรวจใน replies
          const newReplies = (c.replies || []).map((r) => {
            if (r._id === commentId) {
              const rLikes = r.likes || [];
              if (rLikes.includes("")) {
                return { ...r, likes: rLikes.filter((x) => x !== "") };
              } else {
                return { ...r, likes: [...rLikes, ""] };
              }
            }
            return r;
          });
          return { ...c, replies: newReplies };
        })
      );
    } catch (err) {
      console.error("Toggle like comment failed:", err);
    }
  };

  // ── 4. Submit comment ใหม่ (level-1) ────────────────────────────────────────
  const submitComment = async () => {
    // ตรวจสอบ guest user ก่อน
    if (checkGuestUser()) return;

    const textTrim = newComment.trim();
    if (!textTrim) return;

    try {
      // ส่ง comment ไปที่ API
      const res = await fetch(`/api/community/${post._id}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textTrim }),
      });
      if (!res.ok) return;
      const c = await res.json();

      // ดึงข้อมูล comments ล่าสุดมาใช้
      const commentsRes = await fetch(`/api/community/${post._id}/comment`, {
        credentials: "include",
      });
      if (commentsRes.ok) {
        const { comments: commentsData } = await commentsRes.json();
        setComments(commentsData);
      } else {
        // ถ้าดึงข้อมูลล่าสุดไม่ได้ ค่อยใช้ข้อมูลจาก response แรก
        setComments((arr) => [...arr, { ...c, likes: [], replies: [] }]);
      }

      setNewComment("");
    } catch (err) {
      console.error("Submit comment failed:", err);
    }
  };

  // ── 5. Submit reply (level-2) ───────────────────────────────────────────────
  // ถ้าอยากให้ reply ไปอยู่ใต้ comment ใด ให้ส่ง commentId เป็น parent
  const submitReply = async (parentCommentId) => {
    // ตรวจสอบ guest user ก่อน
    if (checkGuestUser()) return;

    const textTrim = (replyText[parentCommentId] || "").trim();
    if (!textTrim) return;

    try {
      // ส่ง reply ไปที่ API
      const res = await fetch(
        `/api/community/${post._id}/comment/${parentCommentId}/reply`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textTrim }),
        }
      );
      if (!res.ok) return;
      const r = await res.json();

      // ดึงข้อมูล replies ล่าสุดมาใช้
      const repliesRes = await fetch(
        `/api/community/${post._id}/comment/${parentCommentId}/reply`,
        {
          credentials: "include",
        }
      );

      if (repliesRes.ok) {
        const { replies } = await repliesRes.json();
        // อัพเดท replies ของ comment นั้น
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === parentCommentId) {
              return { ...c, replies };
            }
            return c;
          })
        );
      } else {
        // ถ้าดึงข้อมูลล่าสุดไม่ได้ ค่อยใช้ข้อมูลจาก response แรก
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === parentCommentId) {
              const oldReplies = c.replies || [];
              return { ...c, replies: [...oldReplies, { ...r, likes: [] }] };
            }
            return c;
          })
        );
      }

      setReplyText((prev) => ({ ...prev, [parentCommentId]: "" }));
    } catch (err) {
      console.error("Submit reply failed:", err);
    }
  };

  // ── 6. เปิด/ปิด Report Modal (ทั้งโพสต์และ comment/reply) ─────────────────
  const openReport = (id) => {
    // ตรวจสอบ guest user ก่อน
    if (checkGuestUser()) return;

    setReportPostId(id);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      alert("กรุณาเลือกเหตุผล");
      return;
    }
    try {
      await fetch(`/api/community/${post._id}/report`, {
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

  return (
    <div className="min-h-screen">
      {/* HeadLogo */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-50 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="ml-50 flex flex-1 min-h-[calc(100vh-70px)] items-center justify-center overflow-y-auto px-6 py-4 pt-6">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-screen-xl">
              <div className="cursor-pointer mb-4">
                <button
                  onClick={() => router.back()}
                  className="text-black hover:opacity-70"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex justify-center px-6 pb-3 bg-white">
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-screen-xl">
                  {/* Left: Post - ขนาดคงที่ */}
                  <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-md p-6 h-[600px] flex flex-col">
                    {/* Container สำหรับรูปภาพ - จำกัดขนาด */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg mb-4 bg-gray-50">
                      <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* ข้อมูลโพสต์ - ส่วนล่าง */}
                    <div className="flex-shrink-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={
                                post.userAvatar ||
                                "https://api.dicebear.com/7.x/bottts/svg?seed=1"
                              }
                              alt={post.userName}
                              fill
                              sizes="32px"
                              className="object-cover"
                              priority
                            />
                          </div>
                          <span className="font-semibold">{post.userName}</span>
                        </div>

                        <button
                          onClick={() => openReport(post._id)}
                          className="px-1 py-1 text-sm rounded hover:bg-gray-100 flex items-center gap-1 border"
                        >
                          <FlagIconOutline className="w-6 h-6 text-black" />
                          Report
                        </button>
                      </div>

                      <p className="text-gray-800 text-sm mb-3 line-clamp-2">
                        {post.caption}
                      </p>

                      <div className="flex flex-wrap gap-4 text-gray-500 text-sm items-center">
                        <button
                          onClick={toggleLikePost}
                          className="flex items-center gap-1 hover:opacity-70"
                        >
                          {hearted ? (
                            <HeartIconSolid className="w-6 h-6 text-red-500 fill-current" />
                          ) : (
                            <HeartIconOutline className="w-6 h-6 text-black" />
                          )}
                          <span>{post.likes.length} Likes</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <CommentIconOutline className="w-6 h-6 text-black" />
                          <span>{comments.length} Comments</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Comments */}
                  <div className="w-full lg:w-[480px] bg-sky-300 rounded-2xl p-4 flex flex-col h-[600px]">
                    <h3 className="text-xl font-semibold mb-4">Comments</h3>

                    {/* Scrollable Comment List */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      {comments.map((c) => (
                        <div key={c._id} className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                <Image
                                  src={
                                    c.userAvatar ||
                                    "https://api.dicebear.com/7.x/bottts/svg?seed=2"
                                  }
                                  alt={c.userName}
                                  fill
                                  sizes="24px"
                                  className="object-cover"
                                  priority
                                />
                              </div>
                              <span className="font-semibold text-sm">
                                {c.userName}
                              </span>
                            </div>

                            {/* ... vertical icon */}
                            <div className="relative">
                              <button
                                onClick={() => openReport(c._id)}
                                className="text-black hover:opacity-80"
                              >
                                <FlagIconOutline className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm">{c.text}</p>

                          <div className="flex gap-4 mt-1 text-xs text-gray-700">
                            <button
                              onClick={() => toggleLikeComment(c._id)}
                              className="flex items-center gap-1 hover:opacity-70"
                            >
                              {(c.likes || []).includes("") ? (
                                <HeartIconSolid className="w-5 h-5 text-black fill-current" />
                              ) : (
                                <HeartIconOutline className="w-5 h-5 text-black" />
                              )}
                              <span>{(c.likes || []).length}</span>
                            </button>
                          </div>

                          {/* Replies */}
                          {(c.replies || []).map((r) => (
                            <div key={r._id} className="ml-6 mt-2 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                    <Image
                                      src={
                                        r.userAvatar ||
                                        "https://api.dicebear.com/7.x/bottts/svg?seed=3"
                                      }
                                      alt={r.userName}
                                      fill
                                      sizes="20px"
                                      className="object-cover"
                                      priority
                                    />
                                  </div>
                                  <span className="font-semibold text-xs">
                                    {r.userName}
                                  </span>
                                </div>
                                <button
                                  onClick={() => openReport(r._id)}
                                  className="text-black hover:opacity-80"
                                >
                                  <FlagIconOutline className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs ml-7">{r.text}</p>
                              <div className="flex gap-4 mt-1 ml-7 text-xs text-gray-700">
                                <button
                                  onClick={() => toggleLikeComment(r._id)}
                                  className="flex items-center gap-1 hover:opacity-70"
                                >
                                  {(r.likes || []).includes("") ? (
                                    <HeartIconSolid className="w-4 h-4 text-black" />
                                  ) : (
                                    <HeartIconOutline className="w-4 h-4 text-black" />
                                  )}
                                  <span>{(r.likes || []).length}</span>
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Reply Input */}
                          <div className="mt-2 flex items-center ml-6 border rounded px-2 bg-white">
                            <input
                              type="text"
                              placeholder="Reply..."
                              className="flex-1 px-2 py-1 outline-none text-sm"
                              value={replyText[c._id] || ""}
                              onChange={(e) =>
                                setReplyText((prev) => ({
                                  ...prev,
                                  [c._id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              onClick={() => submitReply(c._id)}
                              className="p-1 text-sky-500"
                            >
                              <SendIcon className="w-4 h-4 text-black" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input comment */}
                    <div className="mt-4 flex items-center border rounded px-2 bg-white">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 px-2 py-1 outline-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        onClick={submitComment}
                        className="p-2 text-sky-500"
                      >
                        <SendIcon className="w-6 h-6 text-black" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal: Guest User Alert ──────────────────────────────────────────── */}
      {showGuestAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            {/* ปุ่มปิด */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowGuestAlert(false)}
            >
              &times;
            </button>

            {/* หัวข้อ */}
            <h2 className="text-2xl font-semibold text-center mb-4">
              Login Required
            </h2>

            {/* ข้อความ */}
            <p className="text-center text-gray-600 mb-6">
              Please sign in to interact with posts and comments.
            </p>

            {/* ปุ่ม */}
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 rounded-full"
                onClick={() => {
                  setShowGuestAlert(false);
                  router.push("/login"); // redirect ไปหน้า login
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

      {/* ── Modal: Report (ใช้กับทั้งโพสต์ และ comment/reply ได้) ────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            {/* ปุ่มปิด */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowReportModal(false)}
            >
              &times;
            </button>

            {/* หัวข้อ */}
            <h2 className="text-2xl font-semibold text-center mb-6">
              Report a problem
            </h2>

            {/* เลือกเหตุผล */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason for reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
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
            </div>

            {/* กล่องเขียนเพิ่มเติม */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your detailed report
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-sky-300"
                rows={4}
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                placeholder="Optional details"
              />
            </div>

            {/* ปุ่ม */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 rounded-full"
                onClick={submitReport}
              >
                Send
              </button>
              <button
                className="w-full bg-sky-100 hover:bg-sky-200 text-gray-700 font-semibold py-2 rounded-full"
                onClick={() => setShowReportModal(false)}
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
