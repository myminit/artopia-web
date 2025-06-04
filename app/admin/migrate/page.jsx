"use client";
import { useState } from "react";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";

export default function AdminMigrate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleMigrate = async () => {
    if (!confirm("ต้องการ Migrate Reports หรือไม่?")) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/report/migrate", {
        method: "POST",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Migration failed');
      }
      
      setResult(data);
      alert("Migration completed successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert("Migration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <AdminHeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Sidebar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-purple-400 z-40 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content */}
        <div className="ml-72 p-6 w-full">
          <h1 className="text-2xl font-bold text-purple-500 mb-6">
            Migrate Reports
          </h1>

          <div className="bg-white rounded-xl p-6 shadow">
            <p className="mb-4 text-gray-600">
              This will migrate all reports from posts, comments, and replies to the new Reports collection.
              This process might take a while depending on the number of reports.
            </p>

            <button
              onClick={handleMigrate}
              disabled={loading}
              className={`px-6 py-2 rounded font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
            >
              {loading ? "Migrating..." : "Start Migration"}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-700 mb-2">Migration Error:</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-700 mb-2">Migration Result:</h3>
                <p>Successfully migrated reports: {result.migratedCount}</p>
                {result.errorCount > 0 && (
                  <>
                    <p className="text-red-600 mt-2">Failed reports: {result.errorCount}</p>
                    <div className="mt-2">
                      <details>
                        <summary className="cursor-pointer text-sm text-gray-600">
                          View Error Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.errors, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {new Date().toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 