"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentSchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    async function fetchSchedules() {
      try {
        const res = await fetch("/api/schedule", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await res.json();
        setSchedules(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, []);

  const handleStartCounseling = (teacherPhone: any) => {
    if (teacherPhone) {
      window.open(`https://wa.me/${teacherPhone}`, "_blank");
    } else {
      alert("Nomor WhatsApp tidak tersedia.");
    }
  };

  const handleReapply = () => {
    router.push("/pages/student/schedule/create");
  };

  if (loading)
    return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (error)
    return <p className="p-8 text-center text-red-500">Error: {error}</p>;

  const getStatusBadge = (
    status: "REJECTED" | "COMPLETED" | "APPROVED" | "PENDING"
  ) => {
    const badges = {
      REJECTED: "bg-red-500",
      COMPLETED: "bg-[#75B7AA]",
      APPROVED: "bg-green-500",
      PENDING: "bg-yellow-500",
    };

    const labels = {
      REJECTED: "Ditolak",
      COMPLETED: "Selesai",
      APPROVED: "Disetujui",
      PENDING: "Menunggu",
    };

    return (
      <span
        className={`${
          badges[status] || "bg-gray-500"
        } text-white px-3 py-1 rounded-full text-sm`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#75B7AA]">
            Jadwal Konseling
          </h1>
          <p className="text-gray-600 mt-2">
            Lihat jadwal konseling yang telah Anda ajukan dan terkonfirmasi
            untuk dilaksanakan. Anda dapat memantau status permintaan konseling
            dan mengakses informasi jadwal yang sudah disetujui.
          </p>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Anda belum memiliki jadwal konseling, atau ingin menambah jadwal
              konseling.
              <br />
              Klik untuk mengajukan jadwal baru.
            </p>
            <button
              onClick={() => router.push("/pages/student/schedule/create")}
              className="bg-[#75B7AA] text-white px-6 py-2 rounded-lg hover:bg-[#75B7AA]/90 transition-colors"
            >
              Ajukan jadwal baru
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => router.push("/pages/student/schedule/create")}
                className="bg-[#75B7AA] text-white px-6 py-2 rounded-lg hover:bg-[#75B7AA]/90 transition-colors"
              >
                Ajukan jadwal baru
              </button>
            </div>

            {/* Full-width table for larger screens */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-900">
                        Tanggal dan waktu
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Guru BK
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Topik
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule: any) => {
                      const scheduleDate = new Date(schedule.date);
                      const now = new Date();

                      const minutesDiff =
                        (scheduleDate.getTime() - now.getTime()) / (1000 * 60);
                      const isExpired = minutesDiff < -60;
                      const canStart = minutesDiff <= 15 && minutesDiff >= -60;

                      return (
                        <tr
                          key={schedule.id}
                          className="border-b border-gray-200 last:border-0"
                        >
                          <td className="p-4 text-gray-600">
                            {scheduleDate.toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4 text-gray-600">
                            {schedule.counselor?.user?.fullname || "Belum Ada"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {schedule.title}
                          </td>
                          <td className="p-4 text-gray-600">
                            {getStatusBadge(schedule.status)}
                          </td>
                          <td className="p-4 text-gray-600">
                            {schedule.status === "APPROVED" && canStart ? (
                              "Menunggu guru memulai konseling..."
                            ) : schedule.status === "REJECTED" ? (
                              <p>
                                {schedule.rejectedReason?.trim() ||
                                  "Tidak ada alasan"}
                              </p>
                            ) : isExpired ? (
                              "Sudah terlewat"
                            ) : (
                              "Belum bisa memulai"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split tables for mobile view */}
            <div className="grid md:grid-cols-2 gap-6 md:hidden">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b border-gray-200 text-[#75B7AA]">
                  Informasi Jadwal
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-medium text-gray-900">
                          Tanggal dan waktu
                        </th>
                        <th className="text-left p-4 font-medium text-gray-900">
                          Topik
                        </th>
                        <th className="text-left p-4 font-medium text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule: any) => (
                        <tr
                          key={`schedule-${schedule.id}`}
                          className="border-b border-gray-200 last:border-0"
                        >
                          <td className="p-4 text-gray-600 text-sm">
                            {new Date(schedule.date).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4 text-gray-600 text-sm">
                            {schedule.title}
                          </td>
                          <td className="p-4 text-gray-600 text-sm">
                            {getStatusBadge(schedule.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b border-gray-200 text-[#75B7AA]">
                  Detail Guru BK dan Keterangan
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-medium text-gray-900">
                          Guru BK
                        </th>
                        <th className="text-left p-4 font-medium text-gray-900">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule: any) => {
                        const scheduleDate = new Date(schedule.date);
                        const now = new Date();

                        const minutesDiff =
                          (scheduleDate.getTime() - now.getTime()) /
                          (1000 * 60);
                        const isExpired = minutesDiff < -60;
                        const canStart =
                          minutesDiff <= 15 && minutesDiff >= -60;

                        return (
                          <tr
                            key={`counselor-${schedule.id}`}
                            className="border-b border-gray-200 last:border-0"
                          >
                            <td className="p-4 text-gray-600 text-sm">
                              {schedule.counselor?.user?.fullname ||
                                "Belum Ada"}
                            </td>
                            <td className="p-4 text-gray-600">
                              {schedule.status === "APPROVED" && canStart ? (
                                "Menunggu guru memulai konseling..."
                              ) : schedule.status === "REJECTED" ? (
                                <p>
                                  {schedule.rejectedReason?.trim() ||
                                    "Tidak ada alasan"}
                                </p>
                              ) : isExpired ? (
                                "Sudah terlewat"
                              ) : (
                                "Belum bisa memulai"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
