"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount, useDisconnect, useStarkProfile } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Blockies from "react-blockies";

const Profile = () => {
  const { address } = useAccount();
  const { data: starkProfile } = useStarkProfile({ address });
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const { disconnect } = useDisconnect();
  const navigate = useRouter();

  // Handles input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Submitting form data:");
    console.log("Username:", formData.username);
    console.log("Email:", formData.email);
    console.log("Wallet Address:", address);
    console.log("Stark Profile Data:", starkProfile);
  };

  const handleDisconnect = () => {
    disconnect();
    navigate.push("/");
  };

  if (!address) {
    return (
      <section>
        <Navbar />
        <div className="max-w-lg mx-auto px-2 mt-8 mb-12 text-center">
          <h2 className="text-xl font-bold text-white">No Wallet Connected</h2>
          <p className="text-neutral-400">Please connect your wallet to view this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Navbar />
      <div className="max-w-lg mx-auto px-2 mt-8 mb-12">
        <div className="rounded-2xl bg-[#212529] p-4 text-white border-neutral-500 border">
          <h2 className="text-xl font-bold mb-4">Additional Information</h2>

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
            Edit Information
          </Button>
        </div>

        {/* Connected Wallet Section */}
        <div className="rounded-2xl bg-[#212529] p-4 mt-5 text-white border-neutral-500 border">
          <h2 className="text-xl font-bold mb-4">Connected Wallet</h2>
          <div
            className="flex items-start gap-1 rounded-lg border border-neutral-300
           bg-[#212529] p-4"
          >
            <div className="">
              <span className="flex items-center gap-2 text-white">
                {!imageError && starkProfile?.profilePicture ? (
                  <img
                    src={starkProfile.profilePicture}
                    className="mr-2 h-8 w-8 rounded-full"
                    alt="starknet profile"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Blockies
                    seed={address.toLowerCase()}
                    size={10}
                    scale={5}
                    className="mr-2 h-8 w-8 rounded-full"
                  />
                )}
                {starkProfile?.name
                  ? starkProfile.name
                  : address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
              </span>
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            className="w-full text-lg mt-4 bg-none text-red-500 rounded-md py-6"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Profile;
