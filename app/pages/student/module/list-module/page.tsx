"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Module } from "@/types/module";

export default function ModuleList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleDeleteClick = (moduleId: any) => {
    setSelectedModuleId(moduleId);
    setIsModalOpen(true);
  };

  const handleDelete = async (moduleId: any) => {
    try {
      const response = await fetch(`/api/module/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal menghapus module.");

      alert("Module berhasil dihapus!");
      setIsModalOpen(false);
      // Refresh data setelah menghapus

      // setTimeout(() => window.location.reload(), 3000);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    try {
      const [, payloadBase64] = token.split(".");
      const payload = JSON.parse(atob(payloadBase64));

      if (payload.role === "TEACHER") {
        setIsTeacher(true);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }

    fetch(`/api/module`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setModules(data));
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#75B7AA]">
            Modul bimbingan
          </h1>
          <p className="text-gray-600 mt-2">
            Akses materi bimbingan yang disediakan oleh Guru BK untuk membantu
            siswa mengembangkan potensi diri.
          </p>
        </div>

        {isTeacher && (
          <div className="mb-6">
            <button
              onClick={() => router.push("/teacher/module")}
              className="px-4 py-2 bg-[#75B7AA] text-white rounded-lg hover:bg-[#75B7AA]/90 transition-colors"
            >
              Tambah Modul
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white w-full overflow-hidden  rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2 text-black truncate-64 break-words line-clamp-1 ">
                {module.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-1 break-words">
                {module.description}
              </p>
              <div className="justify-between flex">
                <button
                  onClick={() =>
                    router.push(
                      `/pages/student/module/detail-module/${module.id}`
                    )
                  }
                  className="px-4 py-2 bg-[#75B7AA] text-white rounded-lg text-sm hover:bg-[#75B7AA]/90 transition-colors"
                >
                  Buka modul
                </button>
                {isTeacher && (
                  <button
                    onClick={() => handleDeleteClick(module.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-500/90 transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-800 mb-8">
              Apakah Anda yakin ingin menghapus module ini?
            </p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-white rounded-lg text-sm hover:bg-gray-300/90 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(selectedModuleId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-500/90 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
