"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from 'lucide-react';

export default function UpdateTeacherPage() {
  const [form, setForm] = useState({
    fullname: "",
    employeeId: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    const response = await fetch("/api/user/teacher", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Profile updated successfully");
      router.back();
    } else {
      alert(`Error: ${data.message}`);
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
              Update Profil Guru
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Perbarui informasi profil Anda dengan mengisi form berikut
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullname"
                placeholder="Masukkan nama lengkap"
                value={form.fullname}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIP (Nomor Induk Pegawai)
              </label>
              <input
                type="text"
                name="employeeId"
                placeholder="Masukkan NIP"
                value={form.employeeId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#75B7AA] text-white py-3 rounded-lg hover:bg-[#629b8f] transition-colors font-medium"
            >
              Perbarui Profil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
