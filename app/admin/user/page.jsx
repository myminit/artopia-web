"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

import AdminNavbar from "@/components/admin/adminnavbar";
import HeadLogo from "@/components/admin/adminheadlogo";

import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Adminuser() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/user", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้ล้มเหลว");

        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error(error);
        alert("โหลดข้อมูลผู้ใช้ล้มเหลว");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // ลบผู้ใช้จริง โดยเรียก API DELETE
  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบผู้ใช้นี้จริงหรือไม่?")) return;

    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบผู้ใช้ล้มเหลว");

      // ลบ user ออกจาก state เพื่อรีเฟรช UI
      setUsers(users.filter((u) => u._id !== id));
      alert("ลบผู้ใช้สำเร็จ");
    } catch (error) {
      console.error(error);
      alert("ลบผู้ใช้ล้มเหลว");
    }
  };

  const handleEdit = (user) => {
    router.push(`/admin/user/${user._id}`);
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
            <h1 className="text-2xl font-bold text-purple-500">Admin Users</h1>
            {/* Search bar */}
            <div className="flex-1 mx-6">
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full max-w-xl w-full mx-auto">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Last update</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      {searchTerm ? "No users found matching your search" : "No users in the system"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{user._id}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit user"
                        >
                          <PencilIcon className="h-5 w-5 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete user"
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
