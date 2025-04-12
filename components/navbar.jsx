"use client";

import {
  HomeIcon,
  PencilIcon,
  Squares2X2Icon,
  GlobeAltIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";

const navItems = [
  { name: "Home", icon: HomeIcon, href: "/", active: true },
  { name: "Draw", icon: PencilIcon, href: "/draw" },
  { name: "Community", icon: GlobeAltIcon, href: "/community" },
  { name: "Upload", icon: ArrowUpTrayIcon, href: "/upload" },
  { name: "Account setting", icon: Cog6ToothIcon, href: "/settings" },
];

export default function Navbar() {
  return (
    <nav className="w-72 h-[calc(100vh-70px)] bg-sky-400 text-white px-4 py-6 flex flex-col justify-between">
      {/* Top Menu */}
      <div className="space-y-4 ">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition 
              ${
                item.active
                  ? "bg-white text-sky-500 font-medium"
                  : "hover:bg-sky-300/40"
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div>
        <Link
          href="/logout"
          className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-sky-300/40 rounded-lg transition"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
}
