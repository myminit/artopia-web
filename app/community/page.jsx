// File: app/community/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
  FlagIcon as FlagIconOutline,
} from '@heroicons/react/24/outline';

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/community/list', { credentials: 'include' });
        const data = await res.json();
        setPosts(data);
        const initLikes = {};
        data.forEach((p) => {
          initLikes[p._id] = false;
        });
        setLikedPosts(initLikes);
      } catch (err) {
        console.error('Fetch community failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleLike = async (e, postId) => {
    e.preventDefault();
    try {
      await fetch(`/api/community/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: likedPosts[postId]
                  ? p.likes.filter((uid) => uid !== '')
                  : [...p.likes, '']
              }
            : p
        )
      );
    } catch (err) {
      console.error('Toggle like failed:', err);
    }
  };

  const openReport = (e, postId) => {
    e.preventDefault();
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      alert('กรุณาเลือกเหตุผลก่อน');
      return;
    }
    try {
      await fetch(`/api/community/${reportPostId}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reportReason,
          detail: reportDetail
        })
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeadLogo />
        <div className="flex pt-[60px]">
          <aside className="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-60 bg-[#00AEEF] z-40 shadow-lg">
            <Navbar />
          </aside>
          <main className="ml-60 flex-1 flex items-center justify-center">
            <p className="text-gray-500">กำลังโหลด...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <HeadLogo />

      <div className="flex pt-[60px]">
        <aside className="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-60 bg-[#00AEEF] text-white shadow-lg z-40">
          <Navbar />
        </aside>

        <main className="ml-60 flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6">Artopia Community</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/community/${post._id}`} passHref>
                <div className="relative bg-white rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer">
                  <div className="bg-[#00AEEF] text-white flex items-center justify-between px-4 py-2 rounded-t-lg">
                    <span className="font-medium text-sm">{post.userName}</span>
                    <button
                      onClick={(e) => openReport(e, post._id)}
                      className="hover:opacity-80"
                    >
                      <FlagIconOutline className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-gray-800 text-sm truncate">{post.caption}</p>
                  </div>

                  <div className="px-4 pb-4 flex items-center space-x-6 text-gray-600">
                    <button
                      onClick={(e) => toggleLike(e, post._id)}
                      className="flex items-center space-x-1 hover:text-red-500"
                    >
                      {likedPosts[post._id] ? (
                        <HeartIconSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIconOutline className="w-5 h-5" />
                      )}
                      <span className="text-xs">{post.likes.length || 0}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a2 
                              2 0 01-2-2V7a2 2 0 012-2h5l2 2h5a2 
                              2 0 012 2v7a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-xs">{post.comments.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

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
    </div>
  );
}
