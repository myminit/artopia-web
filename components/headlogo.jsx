
import Image from "next/image";


export default function HeadLogo() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-sky-400 shadow-sm">
      {/* Logo + Title */}
      <div className="flex items-center space-x-2">
        <Image
          src="/img/logo.png"
          alt="Artopia Logo"
          width={40}
          height={40}
        />
        <h1 className="text-white text-3xl px-4 font-bold">Artopia</h1>
      </div>

      {/* Search bar */}
      <div className="flex-1 mx-6">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full max-w-xl w-full mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search ..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center space-x-2 ">
        <Image
          src="/img/tin.png"
          alt="User Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-black text-xl font-medium px-4 ">TINNY</span>
      </div>
    </header>
  );
}
