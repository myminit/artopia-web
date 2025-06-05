// File: app/admin/user/[userid]/page.jsx
'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params.userid;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [banUntil, setBanUntil] = useState("");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [banDuration, setBanDuration] = useState("7"); // default 7 days

  useEffect(() => {
    async function fetchUser() {
      try {
        const [userRes, reportsRes] = await Promise.all([
          fetch(`/api/admin/user/${userId}`, {
            credentials: "include",
          }),
          fetch(`/api/admin/report`, {
            credentials: "include",
          }),
        ]);

        if (!userRes.ok) {
          const errorText = await userRes.text();
          throw new Error(errorText || "โหลดข้อมูลผู้ใช้ล้มเหลว");
        }

        const userData = await userRes.json();
        setUser(userData);
        setBanUntil(userData.banUntil ? userData.banUntil.slice(0, 10) : "");

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          const userReports = reportsData.filter((r) => r.reportUserId === userId);
          setReports(userReports);
        }
      } catch (err) {
        console.error("Error in fetchUser:", err);
        alert(err.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  const handleBanUpdate = async (action) => {
    try {
      let banUntilDate = null;
      if (action === "ban") {
        if (banDuration === "permanent") {
          banUntilDate = new Date(2100, 0, 1).toISOString();
        } else {
          banUntilDate = new Date(
            Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000
          ).toISOString();
        }
      }

      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          banUntil: banUntilDate,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "อัปเดตข้อมูลล้มเหลว");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      alert(
        action === "ban"
          ? `แบนผู้ใช้เป็นเวลา ${
              banDuration === "permanent" ? "ถาวร" : banDuration + " วัน"
            } สำเร็จ`
          : "ปลดแบนผู้ใช้สำเร็จ"
      );
    } catch (error) {
      console.error("Error in handleBanUpdate:", error);
      alert(error.message || "อัปเดตสถานะผู้ใช้ไม่สำเร็จ");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบผู้ใช้ไม่สำเร็จ");

      alert("ลบผู้ใช้สำเร็จ");
      router.push("/admin/user");
    } catch (error) {
      console.error(error);
      alert("ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">กำลังโหลดข้อมูล...</p>;
  }
  if (!user) {
    return <p className="p-6 text-red-500">ไม่พบผู้ใช้</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <AdminHeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Sidebar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-48 bg-purple-400 z-40 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content */}
        <div className="ml-48 p-6 w-full">
          <button
            onClick={() => router.push("/admin/user")}
            className="mb-4 flex items-center text-black hover:opacity-70"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-purple-500 mb-6">Admin Users</h1>

          {/* User Info */}
          <div className="bg-white rounded-xl p-6 shadow mb-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
              <div>
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
                  <span
                    className={`font-semibold ${
                      user.status === "banned" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Ban until:
                  </span>
                  {user.banUntil ? user.banUntil.slice(0, 10) : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h2 className="font-semibold text-sky-500 mb-4">List Users Reports</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr className="text-center">
                    <th className="p-3">Report ID</th>
                    <th className="p-3">By User ID</th>
                    <th className="p-3">Report User ID</th>
                    <th className="p-3">Last update</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        ไม่พบรายงาน
                      </td>
                    </tr>
                  )}
                  {reports.map((report) => (
                    <tr key={report._id} className="text-center hover:bg-gray-50">
                      <td className="p-3">
                        <span
                          onClick={() => router.push(`/admin/report/${report._id}`)}
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          {report._id}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          onClick={() => router.push(`/admin/user/${report.byUserId}`)}
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          {report.byUserId}
                        </span>
                      </td>
                      <td className="px-4">{report.reportUserId}</td>
                      <td className="p-3 text-sm">
                        {new Date(report.updatedAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            title="Edit"
                            onClick={() =>
                              router.push(`/admin/report/${report._id}`)
                            }
                          >
                            <PencilIcon className="h-5 w-5 text-blue-500 cursor-pointer" />
                          </button>
                          <button
                            title="Delete"
                            onClick={async () => {
                              if (!confirm("ต้องการลบรายงานนี้หรือไม่?"))
                                return;
                              try {
                                const res = await fetch(
                                  `/api/admin/report/${report._id}`,
                                  {
                                    method: "DELETE",
                                    credentials: "include",
                                  }
                                );
                                if (res.ok) {
                                  setReports(
                                    reports.filter((r) => r._id !== report._id)
                                  );
                                  alert("ลบรายงานสำเร็จ");
                                } else {
                                  throw new Error("Failed to delete report");
                                }
                              } catch (error) {
                                console.error(error);
                                alert("ลบรายงานไม่สำเร็จ");
                              }
                            }}
                          >
                            <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination (หากยังมีหน้าอื่น สามารถปรับได้ตามต้องการ) */}
            <div className="flex justify-end items-center mt-4 text-sm text-gray-500 px-1">
              <div className="space-x-2">
                <button className="px-2 py-1 border rounded hover:bg-gray-200">
                  {"<"}
                </button>
                <span>1 of 1</span>
                <button className="px-2 py-1 border rounded hover:bg-gray-200">
                  {">"}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {user?.status === "banned" ? (
                  <button
                    onClick={() => {
                      if (confirm("ต้องการปลดแบนผู้ใช้นี้หรือไม่?")) {
                        handleBanUpdate("unban");
                      }
                    }}
                    className="bg-sky-400 text-white font-semibold py-2 px-6 rounded hover:bg-sky-500 transition"
                  >
                    UnBan
                  </button>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <label className="text-gray-600 whitespace-nowrap">
                        ระยะเวลาแบน:
                      </label>
                      <select
                        value={banDuration}
                        onChange={(e) => setBanDuration(e.target.value)}
                        className="border rounded px-3 py-2"
                      >
                        <option value="1">1 วัน</option>
                        <option value="3">3 วัน</option>
                        <option value="7">7 วัน</option>
                        <option value="15">15 วัน</option>
                        <option value="30">30 วัน</option>
                        <option value="90">90 วัน</option>
                        <option value="permanent">ถาวร</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `ต้องการแบนผู้ใช้นี้เป็นเวลา ${
                              banDuration === "permanent"
                                ? "ถาวร"
                                : banDuration + " วัน"
                            } หรือไม่?`
                          )
                        ) {
                          handleBanUpdate("ban");
                        }
                      }}
                      className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded hover:bg-yellow-500 transition"
                    >
                      Ban
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "ต้องการลบผู้ใช้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
                    )
                  ) {
                    handleDelete();
                  }
                }}
                className="bg-red-500 text-white font-semibold py-2 px-6 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
