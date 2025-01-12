"use client";

import ProfileIcon from "@/components/icons/ProfileIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  // Handles input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Submitting form data:", formData);
    
  };

  return (
    <div className="max-w-lg mx-auto px-2 mt-8 mb-12">
      <div className="rounded-2xl bg-[#212529] p-4 text-white border-neutral-500 border">
        <h2 className="text-xl font-bold mb-4">Additional Information</h2>
        <div className="flex flex-col w-full mb-4">
          <p className="text-lg font-bold mb-1">First Name</p>
          <Input
            name="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full mb-4 bg-neutral-700 text-md text-white py-5"
          />
        </div>
        <div className="flex flex-col w-full mb-4">
          <p className="text-lg font-bold mb-1">Last Name</p>
          <Input
            name="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full mb-4 bg-neutral-700 text-md text-white py-5"
          />
        </div>
        <div className="flex flex-col w-full mb-4">
          <p className="text-lg font-bold mb-1">Username</p>
          <Input
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full mb-4 bg-neutral-700 text-md text-white py-5"
          />
        </div>
        <div className="flex flex-col w-full mb-4">
          <p className="text-lg font-bold mb-1">Email</p>
          <Input
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full mb-4 bg-neutral-700 text-md text-white py-5"
          />
        </div>
        <Button
          className="w-full text-lg mt-4 bg-blue-600 text-white rounded-md py-6"
          onClick={handleSubmit}
        >
          Edit information
        </Button>
      </div>

      {/* Connected Wallet Section */}
      <div className="rounded-2xl bg-[#212529] p-4 mt-5 text-white border-neutral-500 border">
        <h2 className="text-xl font-bold mb-4">Connected Wallet</h2>
        <div
          className="flex items-start gap-1 rounded-lg border border-neutral-300
         bg-[#212529] p-4"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            <ProfileIcon />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Starknet Network</p>
            <p className="font-bold text-xl">0x7890...8535jh</p>
          </div>
        </div>
        <Button className="w-full text-lg mt-4 bg-none text-red-500 rounded-md py-6">
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default Profile;
