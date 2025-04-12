import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen ">
      {/* Banner */}

      <div className="w-full">
        <Image
          src="/img/banner.png"
          alt="Artopia Banner"
          width={1100}
          height={100}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Gallery Section */}
      <div className="px-6 py-10">
        <h2 className="text-2xl font-bold text-black mb-4">Gallery</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="relative bg-white border rounded-lg shadow-md p-2 hover:shadow-lg transition"
            >
              {/* Three Dots Button */}
              <div className="absolute top-2 right-2">
                <button className="text-gray-500 hover:text-black">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </div>

              {/* Image Placeholder */}
              <div className="w-full h-36 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400">Artwork</span>
              </div>

              {/* Info */}
              <p className="text-sm font-medium mt-2 text-black">about cat</p>
              <p className="text-xs text-gray-500">Last update 24 Jun 2025</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
