"use client";

import { useEffect, useState } from "react";

export default function PendingSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    async function fetchPendingSchedules() {
      try {
        const res = await fetch("/api/schedule/pending", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch pending schedules");
        }
        const data = await res.json();
        setSchedules(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingSchedules();
  }, []);

  const handleUpdateSchedule = async (
    id: any,
    status: any,
    rejectedReason?: string
  ) => {
    const token = localStorage.getItem("token");
    try {
      const body: any = { status };
      if (status === "REJECTED" && rejectedReason) {
        body.rejectedReason = rejectedReason;
      }

      const res = await fetch(`/api/schedule/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("Failed to update schedule");
      }

      alert("Schedule telah berhasil diubah");
      setSchedules(schedules.filter((schedule: any) => schedule.id !== id));

      // Reset modal state
      setIsRejectModalOpen(false);
      setSelectedScheduleId(null);
      setRejectionReason("");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRejectClick = (scheduleId: any) => {
    setSelectedScheduleId(scheduleId);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedScheduleId && rejectionReason.trim()) {
      handleUpdateSchedule(selectedScheduleId, "REJECTED", rejectionReason);
    } else {
      alert("Harap masukkan alasan penolakan");
    }
  };

  const handleModalClose = () => {
    setIsRejectModalOpen(false);
    setSelectedScheduleId(null);
    setRejectionReason("");
  };

  if (loading)
    return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold text-[#75B7AA]">Jadwal Tertunda</h1>
      <p className="text-gray-600 mt-2 mb-8">
        Lihat jadwal konseling yang telah Anda ajukan dan terkonfirmasi untuk
        dilaksanakan. Anda dapat memantau status permintaan konseling dan
        mengakses informasi jadwal yang sudah disetujui.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-900">
                  Siswa
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Judul
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Tanggal
                </th>
                <th className="p-4 font-medium text-gray-900 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule: any) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="p-4 max-w-40 break-words text-gray-600 text-sm">
                      {schedule.student?.user?.fullname} (
                      {schedule.student?.user?.student?.grade})
                    </td>
                    <td className="p-4 max-w-40 break-words text-gray-600 text-sm">
                      {schedule.title}
                    </td>
                    <td className="p-4 max-w-40 break-words text-gray-600 text-sm">
                      {new Date(schedule.date).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 max-w-40 break-words text-gray-600 text-sm text-center">
                      <button
                        onClick={() =>
                          handleUpdateSchedule(schedule.id, "APPROVED")
                        }
                        className="bg-green-500 text-white px-4 py-1 rounded mr-2"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => handleRejectClick(schedule.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded my-2"
                      >
                        Tolak
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 max-w-40 break-words text-gray-600 text-sm text-center"
                  >
                    Tidak ada jadwal tertunda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-y-6 md:hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b border-gray-200 text-[#75B7AA]">
            Informasi Siswa
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-900">
                    Siswa
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Kelas
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.length > 0 ? (
                  schedules.map((schedule: any) => (
                    <tr
                      key={`student-${schedule.id}`}
                      className="border-b border-gray-200 last:border-0"
                    >
                      <td className="p-4 text-gray-600 text-sm">
                        {schedule.student?.user?.fullname}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {schedule.student?.user?.student?.grade}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-4 text-gray-600 text-sm text-center"
                    >
                      Tidak ada jadwal tertunda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b border-gray-200 text-[#75B7AA]">
            Detail Jadwal
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-900">
                    Judul
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Tanggal
                  </th>
                  <th className="p-4 font-medium text-gray-900 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.length > 0 ? (
                  schedules.map((schedule: any) => (
                    <tr
                      key={`schedule-${schedule.id}`}
                      className="border-b border-gray-200 last:border-0"
                    >
                      <td className="p-4 text-gray-600 text-sm">
                        {schedule.title}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(schedule.date).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-600 text-sm text-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateSchedule(schedule.id, "APPROVED")
                          }
                          className="bg-green-500 text-white px-4 py-1 rounded mr-2 mb-2"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => handleRejectClick(schedule.id)}
                          className="bg-red-500 text-white px-4 py-1 rounded"
                        >
                          Tolak
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-gray-600 text-sm text-center"
                    >
                      Tidak ada jadwal tertunda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Alasan Penolakan
            </h3>
            <p className="text-gray-600 mb-4">
              Mohon berikan alasan mengapa Anda menolak jadwal konseling ini:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] focus:border-transparent text-gray-600"
              rows={4}
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Tolak Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
