"use client";

import Navbar from "@/components/Navbar";
import StarkpayLoader from "@/components/StarkpayLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readContract, useWriteContract } from "@/services/contracts";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Blockies from "react-blockies";
import toast, { Toaster } from "react-hot-toast";

const Profile = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const { disconnect } = useDisconnect();
  const navigate = useRouter();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (address) {
      console.log("Address is active");
      // Uncomment to fetch profile data on load
      // fetchProfileData();
    }
  }, [address]);

  // const fetchProfileData = async () => {
  //   try {
  //     setLoading(true);
  //     const { data, error } = await readContract("get_profile", [address]);
  //     if (error) {
  //       toast.error("Failed to fetch profile data!");
  //       console.error("Error fetching profile data:", error);
  //     } else if (data) {
  //       setFormData({
  //         username: data.username || "",
  //         email: data.email || "",
  //       });
  //       toast.success("Profile data fetched successfully!");
  //     }
  //   } catch (err) {
  //     toast.error("Unexpected error fetching profile data!");
  //     console.error("Unexpected error:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handles input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { transactionHash, error } = await writeContract("register", [
        formData.email,
        formData.username,
      ]);

      if (error) {
        toast.error("Failed to register profile!");
        console.error("Error registering profile:", error);
      } else {
        toast.success("Profile registered successfully!");
        console.log("Transaction Hash:", transactionHash);

        // Send a welcome email after successful registration
        await sendWelcomeEmail(formData.email, formData.username);
      }
    } catch (err) {
      toast.error("Unexpected error during profile registration!");
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to StarkPay!",
          template: "welcome",
          variables: { name },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error sending email:", error);
      } else {
        // toast.success("Welcome email sent successfully!");
        console.log('email sent');
        
      }
    } catch (error) {
      toast.error("Unexpected error sending welcome email!");
      console.error("Unexpected error:", error);
    }
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
      {
        loading && <StarkpayLoader />
      }
      <Toaster position="top-right" reverseOrder={false} />
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
            disabled={loading}
          >
            {loading ? "Processing..." : "Edit Information"}
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
                <Blockies
                  seed={address.toLowerCase()}
                  size={10}
                  scale={5}
                  className="mr-2 h-8 w-8 rounded-full"
                />
                {address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
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
