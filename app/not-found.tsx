export default function NotFound() {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <p className="text-gray-600 mt-2">Halaman yang Anda cari tidak ditemukan.</p>
          <a
            href="/"
            className="mt-4 inline-block px-4 py-2 text-[#75B7AA] hover:underline rounded-lg"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }
  