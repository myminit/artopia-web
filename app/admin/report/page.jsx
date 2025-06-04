"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminNavbar from "@/components/admin/adminnavbar";
import HeadLogo from "@/components/admin/adminheadlogo";

import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function AdminReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/admin/report", {
          credentials: "include",
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch reports:", res.status, errText);
          alert("ไม่สามารถโหลดรายงานได้");
          return;
        }
        const data = await res.json();
        setReports(data);
        setFilteredReports(data);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("เกิดข้อผิดพลาดขณะโหลดรายงาน");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Filter reports based on search term
  useEffect(() => {
    let filtered = reports;

    // Apply search filter
    filtered = filtered.filter(report => 
      report._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.detail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบรายงานนี้จริงหรือไม่?")) return;

    try {
      const res = await fetch(`/api/admin/report/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("ลบรายงานไม่สำเร็จ");
      
      setReports(reports.filter((r) => r._id !== id));
      alert("ลบรายงานสำเร็จ");
    } catch (err) {
      console.error(err);
      alert("ลบรายงานไม่สำเร็จ");
    }
  };

  const handleViewUser = (userId) => {
    router.push(`/admin/user/${userId}`);
  };

  const handleViewReport = (reportId) => {
    router.push(`/admin/report/${reportId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeadLogo />
        <div className="flex pt-[70px]">
          <aside className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-purple-400 z-40 shadow-lg">
            <AdminNavbar />
          </aside>
          <main className="ml-72 flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      {/* Sidebar + Main */}
      <div className="flex pt-[70px] h-screen">
        {/* Sidebar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-purple-400 z-40 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-72 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-purple-500">
              Admin Reports
            </h1>
            <div className="flex-1 mx-6 flex items-center space-x-4">
              {/* Search Bar */}
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full flex-1">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search by ID, reason, or details..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Report ID</th>
                  <th className="px-4 py-2">Reported User</th>
                  <th className="px-4 py-2">By User</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      {searchTerm ? "No reports found matching your criteria" : "No reports in the system"}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{report._id}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleViewUser(report.reportUserId)}
                          className="text-blue-500 hover:underline"
                        >
                          {report.reportUserId}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleViewUser(report.byUserId)}
                          className="text-blue-500 hover:underline"
                        >
                          {report.byUserId}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <div className="max-w-xs truncate">{report.reason}</div>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleViewReport(report._id)}
                          className="p-1 hover:bg-gray-100 rounded inline-block"
                          title="View report details"
                        >
                          <PencilIcon className="h-5 w-5 text-purple-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="p-1 hover:bg-gray-100 rounded inline-block"
                          title="Delete report"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
