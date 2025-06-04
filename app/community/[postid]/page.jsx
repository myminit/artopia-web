// File: app/community/[postid]/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
  ChatBubbleBottomCenterTextIcon as CommentIconOutline,  
  FlagIcon as FlagIconOutline,
  ArrowLeftIcon,
  PaperAirplaneIcon as SendIcon,
} from '@heroicons/react/24/outline';

export default function PostDetailPage() {
  const router = useRouter();
  const { postid } = useParams();

  const [post, setPost] = useState(null);
  const [hearted, setHearted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  // เก็บข้อความ reply ของแต่ละ comment ด้วย object: { [commentId]: replyText }
  const [replyText, setReplyText] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ── 1. โหลดข้อมูล user และโพสต์เมื่อ mount ──────────────────────────
  useEffect(() => {
    // ดึงข้อมูล user
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));

    // ดึงข้อมูลโพสต์
    if (!postid) return;
    (async () => {
      try {
        const res = await fetch(`/api/community/${postid}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setPost(data);
        setComments(data.comments || []);
        // ไม่ได้เช็กว่า user เคยกดไลค์โพสต์นี้หรือยัง, กำหนด default เป็น false
        setHearted(false);
      } catch (err) {
        console.error('Fetch post detail failed:', err);
      }
    })();
  }, [postid]);

  // ── 2. แสดง Login Modal ──────────────────────────────────────────────
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-4">Please sign in to interact with posts and comments.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowLoginModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowLoginModal(false);
              router.push('/login');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );

  // ── 3. ตรวจสอบ Authentication ก่อนทำ interaction ──────────────────────
  const checkAuth = () => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  if (!post) {
    return (
      <div className="min-h-screen">
        <HeadLogo />
        <div className="flex pt-[60px]">
          <aside className="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-60 bg-[#00AEEF] z-40 shadow-lg">
            <Navbar />
          </aside>
          <main className="ml-60 flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </main>
        </div>
      </div>
    );
  }

  // ── 4. Toggle Like ของตัวโพสต์ ───────────────────────────────────────
  const toggleLikePost = async () => {
    if (!checkAuth()) return;

    try {
      await fetch(`/api/community/${post._id}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      setHearted((h) => !h);
      setPost((p) => ({
        ...p,
        likes: hearted
          ? p.likes.filter((uid) => uid !== 'dummy')
          : [...p.likes, 'dummy'],
      }));
    } catch (err) {
      console.error('Toggle like post failed:', err);
    }
  };

  // ── 5. Toggle Like ของ comment/reply ใด ๆ ─────────────────────────────
  const toggleLikeComment = async (commentId) => {
    if (!checkAuth()) return;

    try {
      await fetch(`/api/community/${post._id}/comment/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      // ปรับค่า local state ให้ตรงกับ API: หา comment/reply แล้วสลับ like ในหน้าเดียว
      setComments((prev) =>
        prev.map((c) => {
          // 1) ถ้า comment นี้ตรงกับ commentId
          if (c._id === commentId) {
            const likesArr = c.likes || [];
            if (likesArr.includes('')) {
              return { ...c, likes: likesArr.filter((x) => x !== '') };
            } else {
              return { ...c, likes: [...likesArr, ''] };
            }
          }
          // 2) ถ้าไม่ใช่ ให้ไปตรวจใน replies
          const newReplies = (c.replies || []).map((r) => {
            if (r._id === commentId) {
              const rLikes = r.likes || [];
              if (rLikes.includes('')) {
                return { ...r, likes: rLikes.filter((x) => x !== '') };
              } else {
                return { ...r, likes: [...rLikes, ''] };
              }
            }
            return r;
          });
          return { ...c, replies: newReplies };
        })
      );
    } catch (err) {
      console.error('Toggle like comment failed:', err);
    }
  };

  // ── 6. Submit comment ใหม่ (level-1) ────────────────────────────────────
  const submitComment = async () => {
    if (!checkAuth()) return;

    const textTrim = newComment.trim();
    if (!textTrim) return;

    try {
      const res = await fetch(`/api/community/${post._id}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textTrim }),
      });
      if (!res.ok) return;
      const c = await res.json();
      setComments((arr) => [...arr, { ...c, likes: [], replies: [] }]);
      setNewComment('');
    } catch (err) {
      console.error('Submit comment failed:', err);
    }
  };

  // ── 7. Submit reply (level-2) ───────────────────────────────────────────
  // ถ้าอยากให้ reply ไปอยู่ใต้ comment ใด ให้ส่ง commentId เป็น parent
  const submitReply = async (parentCommentId) => {
    if (!checkAuth()) return;

    const textTrim = (replyText[parentCommentId] || '').trim();
    if (!textTrim) return;

    try {
      const res = await fetch(`/api/community/${post._id}/comment/${parentCommentId}/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textTrim }),
      });
      if (!res.ok) return;
      const r = await res.json();
      // เก็บ reply ใหม่ใน state
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === parentCommentId) {
            const oldReplies = c.replies || [];
            return { ...c, replies: [...oldReplies, { ...r, likes: [] }] };
          }
          return c;
        })
      );
      setReplyText((prev) => ({ ...prev, [parentCommentId]: '' }));
    } catch (err) {
      console.error('Submit reply failed:', err);
    }
  };

  // ── 8. เปิด/ปิด Report Modal (ทั้งโพสต์และ comment/reply) ─────────────────
  const openReport = (id) => {
    if (!checkAuth()) return;
    setReportPostId(id);
    setShowReportModal(true);
  };
  const submitReport = async () => {
    if (!checkAuth()) return;
    if (!reportReason) {
      alert('กรุณาเลือกเหตุผล');
      return;
    }
    try {
      await fetch(`/api/community/${post._id}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reportReason,
          detail: reportDetail,
        }),
      });
      setShowReportModal(false);
      setReportReason('');
      setReportDetail('');
      alert('Report ส่งเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Submit report failed:', err);
      alert('เกิดข้อผิดพลาดในการรายงาน');
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
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4 pt-6">
          <div className="cursor-pointer">
            <button
              onClick={() => router.back()}
              className="text-black hover:opacity-70"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center px-6 pb-3 bg-white">
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-screen-xl">
              {/* Left: Post */}
              <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-md p-6 ">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="rounded w-full max-w-[600px] mx-auto"
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500"></div>
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

                <p className="mt-2 text-gray-800">{post.caption}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-gray-500 text-sm items-center">
                  <button
                    onClick={toggleLikePost}
                    className="flex items-center gap-1 hover:opacity-70"
                  >
                    {hearted ? (
                      <HeartIconSolid className="w-6 h-6 text-black fill-current" />
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

              {/* Right: Comments */}
              <div className="w-full lg:w-[480px] bg-sky-300 rounded-2xl p-4 flex flex-col h-[600px]">
                <h3 className="text-xl font-semibold mb-4">Comments</h3>

                {/* Scrollable Comment List */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {comments.map((c) => (
                    <div key={c._id} className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500"></div>
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
                              <div className="w-5 h-5 rounded-full bg-purple-400"></div>
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
                  <button onClick={submitComment} className="p-2 text-sky-500">
                    <SendIcon className="w-6 h-6 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

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
