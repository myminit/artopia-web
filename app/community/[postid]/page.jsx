// File: app/community/[postid]/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
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
          reportUserId: post.userId
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <HeadLogo />
      {showLoginModal && <LoginModal />}

      <div className="flex pt-[60px]">
        {/* Sidebar */}
        <aside className="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-60 bg-[#00AEEF] text-white shadow-lg z-40">
          <Navbar />
        </aside>

        {/* Main Content */}
        <main className="ml-60 flex-1 flex space-x-6 p-6">
          {/* ซ้าย: โพสต์ + รูป + caption + like + comments/replies */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            {/* 2.1 ปุ่ม Back */}
            <button
              onClick={() => router.back()}
              className="mb-4 text-gray-700 hover:opacity-80"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>

            {/* 2.2 รูปของโพสต์ */}
            <div className="w-full h-80 bg-gray-200 mb-4 overflow-hidden rounded-lg">
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="object-cover w-full h-full"
              />
            </div>

            {/* 2.3 ข้อมูล userName + ปุ่ม report */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl">{post.userName}</h2>
              <button
                onClick={() => openReport(post._id)}
                className="flex items-center space-x-1 border px-3 py-1 rounded hover:bg-gray-100"
              >
                <FlagIconOutline className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700">Report</span>
              </button>
            </div>

            {/* 2.4 Caption */}
            <p className="mb-4 text-gray-800">{post.caption}</p>

            {/* 2.5 Like/count ของโพสต์ */}
            <button
              onClick={toggleLikePost}
              className="flex items-center space-x-2 mb-6 hover:opacity-80"
            >
              {hearted ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIconOutline className="w-6 h-6 text-gray-700" />
              )}
              <span>{post.likes.length} Likes</span>
            </button>

            {/* 2.6 Comments List */}
            <div>
              <h3 className="font-semibold mb-2">Comments</h3>
              {comments.map((c) => (
                <div key={c._id} className="mb-4 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{c.userName}</p>
                      <p className="text-gray-700">{c.text}</p>
                    </div>
                    <div className="flex space-x-2">
                      {/* Toggle Like บน comment นี้ */}
                      <button
                        onClick={() => toggleLikeComment(c._id)}
                        className="flex items-center space-x-1 hover:text-red-500"
                      >
                        {/* เปลี่ยนมาเช็กด้วย (c.likes || []) */}
                        {(c.likes || []).includes('') ? (
                          <HeartIconSolid className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIconOutline className="w-5 h-5 text-gray-700" />
                        )}
                        <span className="text-xs">{(c.likes || []).length}</span>
                      </button>
                      {/* ปุ่ม Report ของ comment นี้ */}
                      <button
                        onClick={() => openReport(c._id)}
                        className="hover:opacity-80"
                      >
                        <FlagIconOutline className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* 2.7 Replies (level-2) ของ comment c */}
                  {(c.replies || []).map((r) => (
                    <div
                      key={r._id}
                      className="ml-6 mt-2 mb-2 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{r.userName}</p>
                        <p className="text-gray-700">{r.text}</p>
                      </div>
                      <div className="flex space-x-2">
                        {/* Toggle Like บน reply r */}
                        <button
                          onClick={() => toggleLikeComment(r._id)}
                          className="flex items-center space-x-1 hover:text-red-500"
                        >
                          {(r.likes || []).includes('') ? (
                            <HeartIconSolid className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIconOutline className="w-5 h-5 text-gray-700" />
                          )}
                          <span className="text-xs">{(r.likes || []).length}</span>
                        </button>
                        {/* ปุ่ม Report ของ reply นี้ */}
                        <button
                          onClick={() => openReport(r._id)}
                          className="hover:opacity-80"
                        >
                          <FlagIconOutline className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 2.8 ฟอร์มพิมพ์ reply สำหรับ comment c */}
                  <div className="mt-2 flex items-center space-x-2 ml-6">
                    <input
                      type="text"
                      placeholder="Reply..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                      value={replyText[c._id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [c._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => submitReply(c._id)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:opacity-90"
                    >
                      <SendIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* 2.9 ฟอร์มพิมพ์ comment ใหม่ (level-1) */}
              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={submitComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา (ว่างไว้ หากต้องการบีบ layout เพิ่ม) */}
          <div className="w-1/4"></div>
        </main>
      </div>

      {/* ── Modal: Report (ใช้กับทั้งโพสต์ และ comment/reply ได้) ────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4">Report a problem</h3>
            <label className="block text-sm font-medium mb-1">Reason for reporting</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">-- Select reason --</option>
              <option value="Posting inappropriate work">Posting inappropriate work</option>
              <option value="Harassing/Trolling">Harassing/Trolling</option>
              <option value="Linking to inappropriate sites">Linking to inappropriate sites</option>
              <option value="Unsuitable content on profile">Unsuitable content on profile</option>
              <option value="Reproducing others' work">Reproducing others' work</option>
              <option value="Violating others' privacy">Violating others' privacy</option>
              <option value="This work depicts child pornography or child abuse">
                This work depicts child pornography or child abuse
              </option>
              <option value="Indicating intent to commit suicide or a crime">
                Indicating intent to commit suicide or a crime
              </option>
              <option value="Causing problems on pixiv Encyclopedia">
                Causing problems on pixiv Encyclopedia
              </option>
              <option value="Other violations of Terms of Use">Other violations of Terms of Use</option>
            </select>

            <label className="block text-sm font-medium mb-1">Your detailed report</label>
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
    </div>
  );
}
