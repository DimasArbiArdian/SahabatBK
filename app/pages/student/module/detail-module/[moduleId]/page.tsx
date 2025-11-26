"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";

type Module = {
  id: string;
  title: string;
  description?: string;
  content: string;
  teacher?: { user?: { fullname?: string } };
  references?: { id: string; url: string }[];
};

export default function ModuleDetail() {
  const params = useParams();
  const moduleId = params?.moduleId as string | undefined; // Pastikan moduleId bertipe string

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!moduleId) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`/api/module/${moduleId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setModule(data);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load module details");
      })
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading)
    return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500 p-8">{error}</p>;
  if (!module) return <p className="text-gray-600 p-8">Module not found</p>; // Tambahkan pengecekan

  return (
    <div className="text-gray-600 p-8 flex items-start">
      <button
        onClick={() => router.back()}
        className="text-[#75B7AA] hover:text-[#629b8f] mr-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <div className="text-center max-w-max mx-auto">
          <h1 className="text-2xl font-bold break-words max-w-lg">
            {module.title}
          </h1>
          <h2 className="text-xl font-semibold max-w-lg break-words">
            {module.description || "No description"}
          </h2>
          <p className="text-gray-500">
            By: {module.teacher?.user?.fullname || "Unknown"}
          </p>
        </div>
        <ReactMarkdown className="prose break-words max-w-5xl mt-6">
          {module.content}
        </ReactMarkdown>
        <p className="text-gray-600 mt-6">Referensi</p>
        {module?.references?.map((reference: any) => (
          <a
            key={reference.id}
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm break-all block"
          >
            {reference.url}
          </a>
        ))}
      </div>
    </div>
  );
}
