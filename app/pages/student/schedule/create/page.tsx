"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CreateSchedulePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, date }),
      });

      if (!res.ok) {
        throw new Error("Failed to create schedule");
      }

      alert("Schedule berhasil ditambahkan!");
      setTitle("");
      setDescription("");
      setDate("");
      router.push("/pages/student/schedule");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => router.back()}
            className="text-[#75B7AA] hover:text-[#629b8f] mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#75B7AA]">
              Ajukan Jadwal Konseling
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Isi form berikut untuk mengajukan jadwal konseling baru
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Konseling
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Konsultasi Akademik"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan secara detail tujuan konseling Anda"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal dan Waktu
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#75B7AA] text-white py-3 rounded-lg hover:bg-[#629b8f] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Mengajukan..." : "Ajukan Jadwal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
