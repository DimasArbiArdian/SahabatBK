"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim tautan atur ulang kata sandi"); // Translated
      }

      setMessage("Tautan atur ulang kata sandi telah dikirim ke email Anda."); // Translated
      setEmail("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#75B7AA] p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#75B7AA] hover:text-[#629b8f] mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Cari akun Anda {/* Translated */}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Masukkan email Anda</p> {/* Translated */}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <input
            type="email"
            name="email"
            placeholder="Masukkan email Anda" // Translated (assuming "Enter code" was a typo and "Enter your email" was intended based on context. If "Enter code" was specific, it would be "Masukkan kode")
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#75B7AA] text-white py-3 rounded-lg hover:bg-[#629b8f] transition-colors font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Lanjutkan"} {/* Translated */}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
        {message && (
          <p className="text-green-500 text-sm text-center mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}