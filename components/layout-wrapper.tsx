"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthWrapper from "@/components/auth-wrapper";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthPage, setIsAuthPage] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathName = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathName === href;

  useEffect(() => {
    const updateUserState = () => {
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("name"));
    };

    updateUserState();

    window.addEventListener("storage", updateUserState);
    return () => window.removeEventListener("storage", updateUserState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("id");
    // window.location.reload(); // Refresh page to update auth state
    setName(null);
    setRole(null);

    // setTimeout(() => router.push("/auth/login"), 3000);
    router.push("/auth/login");
  };

  const handleProfile = () => {
    role === "TEACHER"
      ? router.push("/teacher/user")
      : router.push("/pages/student/user");
    // ? setTimeout(() => router.push("/teacher/user"), 3000)
    // : setTimeout(() => router.push("/pages/student/user"), 3000);
  };

  return (
    <AuthWrapper setIsAuthPage={setIsAuthPage}>
      {isAuthPage ? (
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      ) : (
        <div className="flex h-screen bg-white">
          {/* Mobile Sidebar Toggle */}
          <button
            className="absolute top-4 left-4 z-50 md:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {!sidebarOpen && <Menu className="w-6 h-6" />}
          </button>
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform md:relative md:translate-x-0 z-40 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:block`}
          >
            <div className="p-6 flex justify-between">
              <Link href="#" className="text-2xl font-bold text-[#75B7AA]">
                SahabatBK
              </Link>
              {sidebarOpen && (
                <button
                  className="top-4 left-4 z-50 md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen && <X className="w-6 h-6 text-gray-800" />}
                </button>
              )}
            </div>
            <nav className="mt-6 space-y-1 px-3">
              {role === "STUDENT" ? (
                <>
                  <Link
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    href="/pages/student/module/list-module"
                    className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                      isActive("/pages/student/module/list-module")
                        ? "text-[#75B7AA] bg-[#75B7AA]/10"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Modul bimbingan
                  </Link>
                  <Link
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    href="/pages/student/schedule"
                    className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                      isActive("/pages/student/schedule")
                        ? "text-[#75B7AA] bg-[#75B7AA]/10"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Jadwal konseling
                  </Link>
                </>
              ) : role === "TEACHER" ? (
                <>
                  <Link
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    href="/pages/student/module/list-module"
                    className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                      isActive("/pages/student/module/list-module")
                        ? "text-[#75B7AA] bg-[#75B7AA]/10"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Modul bimbingan
                  </Link>
                  <Link
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    href="/teacher/schedule"
                    className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                      isActive("/teacher/schedule")
                        ? "text-[#75B7AA] bg-[#75B7AA]/10"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Jadwal konseling
                  </Link>
                  <Link
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    href="/teacher/schedule/pending"
                    className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                      isActive("/teacher/schedule/pending")
                        ? "text-[#75B7AA] bg-[#75B7AA]/10"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Daftar konseling
                  </Link>
                </>
              ) : null}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-gray-200 bg-white relative">
              <div className="h-full px-6 flex items-center justify-end">
                <div
                  className="relative flex items-center gap-3 cursor-pointer"
                  onClick={() => setShowLogout(!showLogout)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{name}</div>
                    <div className="text-sm text-gray-500">
                      {role === "TEACHER" ? "Guru" : "Siswa"}
                    </div>
                  </div>
                  {showLogout && (
                    <div className="absolute right-0 mt-6 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                      <button
                        onClick={handleProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-auto bg-white">{children}</main>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
}
