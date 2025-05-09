"use client";

import { useState } from "react";
import Image from "next/image";
import { CameraIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import HeadLogo from "@/components/HeadLogo";

export default function AccountSetting() {
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [formData, setFormData] = useState({
    username: "TINNY",
    email: "tinnapat.takananant@gmail.com",
    newPassword: "",
    confirmPassword: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleReset = () => {
    setFormData({
      username: "TINNY",
      email: "tinnapat.takananant@gmail.com",
      newPassword: "",
      confirmPassword: "",
      bio: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // call API here
  };

  return (
    <div className="min-h-screen">
      {/* HeadLogo ด้านบน */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar ด้านซ้าย */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="ml-72 flex-1 overflow-y-auto p-2 bg-white">
          <div className="max-w-5xl mx-auto bg-white p-16 shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold text-sky-600 mb-3">
              Account Setting
            </h2>

            <label className="block text-sm text-gray-600 mb-2">
              Your Profile Picture
            </label>
            <div className="relative w-24 h-24 mb-8">
              <img
                src="/img/tin.png"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />

              {/* Overlay เมื่อ hover */}
              <label className="absolute inset-0 rounded-full cursor-pointer group">
                <div className="w-full h-full bg-gray-500 bg-opacity-60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CameraIcon className="w-6 h-6 text-white mb-1" />
                  <span className="text-xs text-white">Change Profile</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  name="username"
                  readOnly
                  className="w-full p-2  rounded bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Please enter your new password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-2  rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full p-2  rounded bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Please enter your new password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2  rounded bg-gray-100"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Bio</label>
                <textarea
                  name="bio"
                  placeholder="Write your Bio here e.g your hobbies, interests ETC"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-2  rounded bg-gray-100 min-h-[100px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-start gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-600 transition"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-gray-600 hover:underline"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}