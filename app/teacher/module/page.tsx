"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { ArrowLeft, Plus, Trash2, Edit2, X, Check } from "lucide-react";

interface Reference {
  id: string;
  url: string;
}

export default function CreateModule() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reference management states
  const [editingReference, setEditingReference] = useState<string | null>(null);
  const [newReferenceUrl, setNewReferenceUrl] = useState("");
  const [editReferenceUrl, setEditReferenceUrl] = useState("");

  // Generate unique ID for references
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add new reference
  const handleAddReference = () => {
    if (!newReferenceUrl.trim()) return;
    
    // Basic URL validation
    try {
      new URL(newReferenceUrl);
    } catch {
      setError("URL tidak valid. Pastikan URL dimulai dengan http:// atau https://");
      return;
    }

    const newReference: Reference = {
      id: generateId(),
      url: newReferenceUrl.trim(),
    };

    setReferences([...references, newReference]);
    setNewReferenceUrl("");
    setError("");
  };

  // Remove reference
  const handleRemoveReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
  };

  // Start editing reference
  const handleStartEdit = (reference: Reference) => {
    setEditingReference(reference.id);
    setEditReferenceUrl(reference.url);
  };

  // Save edited reference
  const handleSaveEdit = (id: string) => {
    if (!editReferenceUrl.trim()) return;
    
    // Basic URL validation
    try {
      new URL(editReferenceUrl);
    } catch {
      setError("URL tidak valid. Pastikan URL dimulai dengan http:// atau https://");
      return;
    }

    setReferences(references.map(ref => 
      ref.id === id ? { ...ref, url: editReferenceUrl.trim() } : ref
    ));
    setEditingReference(null);
    setEditReferenceUrl("");
    setError("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReference(null);
    setEditReferenceUrl("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Extract URLs from references for API submission
      const referenceUrls = references.map(ref => ref.url);

      const response = await fetch("/api/module", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          description, 
          content, 
          references: referenceUrls 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(response);
        throw new Error(data.message || "Gagal menambahkan module.");
      }

      alert("Module berhasil ditambahkan!");
      router.push("/pages/student/module/list-module");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => router.back()}
            className="text-[#75B7AA] hover:text-[#629b8f] mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#75B7AA]">
              Tambah Module
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Buat modul baru untuk siswa
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Module
              </label>
              <input
                type="text"
                placeholder="Masukkan judul module"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] text-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <input
                type="text"
                placeholder="Masukkan deskripsi singkat"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] text-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Module
              </label>
              <MDEditor
                value={content}
                onChange={(value) => setContent(value || "")}
                className="border border-gray-300 rounded-lg overflow-hidden"
              />
            </div>

            {/* References Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referensi (Opsional)
              </label>
              <p className="text-gray-500 text-xs mb-4">
                Tambahkan link referensi yang relevan dengan module ini
              </p>

              {/* Add New Reference */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newReferenceUrl}
                    onChange={(e) => setNewReferenceUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddReference();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="px-4 py-2 bg-[#75B7AA] text-white rounded-md hover:bg-[#629b8f] transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah
                  </button>
                </div>
              </div>

              {/* References List */}
              {references.length > 0 && (
                <div className="space-y-2">
                  {references.map((reference) => (
                    <div
                      key={reference.id}
                      className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      {editingReference === reference.id ? (
                        <>
                          <input
                            type="url"
                            value={editReferenceUrl}
                            onChange={(e) => setEditReferenceUrl(e.target.value)}
                            className="flex-1 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75B7AA] text-sm text-gray-700"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit(reference.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(reference.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Simpan"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Batal"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <a
                              href={reference.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm break-all"
                            >
                              {reference.url}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(reference)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(reference.id)}
                            className="p-1 text-gray-600 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {references.length === 0 && (
                <p className="text-gray-400 text-sm italic text-center py-4">
                  Belum ada referensi ditambahkan
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#75B7AA] text-white py-3 rounded-lg hover:bg-[#629b8f] transition-colors font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Module"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}