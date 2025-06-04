"use client";
import { useState, useEffect } from "react";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation"; 
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function Adminuserid() {
    const params = useParams();
    const userId = params.userid;
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchReports();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้ล้มเหลว");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/admin/user/${userId}/reports`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลรายงานล้มเหลว");

      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
      // Don't show alert for reports loading failure
    }
  };

  const handleBan = async () => {
    if (!confirm("ต้องการแบนผู้ใช้นี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'banned',
          banUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }),
      });

      if (!res.ok) throw new Error("แบนผู้ใช้ล้มเหลว");

      await fetchUser(); // รีโหลดข้อมูลผู้ใช้
      alert("แบนผู้ใช้เรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);
      alert("แบนผู้ใช้ไม่สำเร็จ");
    }
  };

  const handleUnban = async () => {
    if (!confirm("ต้องการยกเลิกการแบนผู้ใช้นี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'active',
          banUntil: null
        }),
      });

      if (!res.ok) throw new Error("ยกเลิกการแบนล้มเหลว");

      await fetchUser(); // รีโหลดข้อมูลผู้ใช้
      alert("ยกเลิกการแบนเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);
      alert("ยกเลิกการแบนไม่สำเร็จ");
    }
  };

  const handleDelete = async () => {
    if (!confirm("ต้องการลบผู้ใช้นี้จริงหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;

    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบผู้ใช้ล้มเหลว");

      alert("ลบผู้ใช้เรียบร้อยแล้ว");
      router.push("/admin/user");
    } catch (err) {
      console.error(err);
      alert("ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
          <AdminHeadLogo />
        </div>
        <div className="flex pt-[70px] h-screen">
          <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
            <AdminNavbar />
          </div>
          <div className="ml-72 p-6 w-full flex items-center justify-center">
            <p>กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <p>ไม่พบผู้ใช้</p>;
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <AdminHeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Sidebar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content */}
        <div className="ml-72 p-6 w-full">
          <button
            onClick={() => router.push("/admin/user")}
            className="text-black hover:opacity-70"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-purple-500 ">Admin Users</h1>

          {/* User Info */}
          <div className="bg-white rounded-xl p-6 shadow mb-6">
            <div className="flex justify-between items-start gap-8">
              <div>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    User ID:
                  </span>
                  {user._id}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Username:
                  </span>
                  {user.name}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Email:
                  </span>
                  {user.email}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Last Update:
                  </span>
                  {new Date(user.updatedAt).toLocaleString()}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Status:
                  </span>
                  <span className={user.status === 'banned' ? 'text-red-500' : 'text-green-500'}>
                    {user.status || 'active'}
                  </span>
                </p>
                {user.banUntil && (
                  <p>
                    <span className="inline-block min-w-[120px] text-gray-400">
                      Ban until:
                    </span>
                    <span className="text-red-500">
                      {new Date(user.banUntil).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl p-4 shadow mb-6">
            <h2 className="font-semibold mb-4 text-sky-500">
              List Users Reports
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr className="text-center">
                    <th className="p-3">Report ID</th>
                    <th className="p-3">By User</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr
                        key={report._id}
                        className="text-center hover:bg-gray-50"
                      >
                        <td className="p-3">{report._id}</td>
                        <td className="p-3">{report.byUserId?.name || 'Unknown'}</td>
                        <td className="p-3">{report.reason}</td>
                        <td className="p-3">{new Date(report.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-start space-x-4 mt-6">
            {user.status !== 'banned' ? (
              <button 
                onClick={handleBan}
                className="bg-yellow-400 text-black font-semibold py-1 px-6 rounded hover:bg-yellow-500"
              >
                Ban
              </button>
            ) : (
              <button 
                onClick={handleUnban}
                className="bg-sky-400 text-white font-semibold py-1 px-6 rounded hover:bg-sky-500"
              >
                UnBan
              </button>
            )}
            <button 
              onClick={handleDelete}
              className="bg-red-500 text-white font-semibold py-1 px-6 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
