"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import main_logo from "../../../public/assets/main_logo.png";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [email, setEmail] = useState("rifqimuzakki45@gmail.com");
  // const [password, setPassword] = useState("password");
  // const [email, setEmail] = useState("rifqimuzakki4545@gmail.com");
  // const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.fullname);
      console.log("data.user.role ", data.user.role);

      window.dispatchEvent(new Event("storage"));

      // router.refresh();

      if (data.user.role === "teacher") {
        router.push("/teacher/module");
      } else {
        router.push("/pages/student/module/list-module");
      }
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-[#75B7AA]">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-36">
        <div className="mb-8">
          <Image
            src={main_logo}
            alt="Logo"
            width={80}
            height={80}
            className="w-48 h-48"
          />
        </div>
        <h1 className="text-5xl font-bold text-[#75B7AA] mb-4">
          Halo,
          <br />
          Sahabat BK!
        </h1>
        <p className="text-[#75B7AA] text-xl max-w-md">
          "Terhubung, Bimbing, dan Tumbuh Bersama Sahabat BK, Platform Konseling Online Terpercaya Anda."
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[#75B7AA] mb-8 text-center">
            Selamat Datang di SahabatBK!
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] text-black"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] text-black"
                required
              />
            </div>

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-[#75B7AA] hover:underline text-sm"
              >
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#75B7AA] text-white py-3 rounded-lg hover:bg-[#629b8f] transition-colors"
            >
              Login
            </button>

            {error && (
              <p className="text-red-500 text-center text-sm mt-2">{error}</p>
            )}
          </form>

          <div className="mt-6 text-center text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/auth/register/student"
              className="text-[#75B7AA] hover:underline"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
