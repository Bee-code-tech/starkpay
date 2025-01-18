"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Blockies from "react-blockies";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import StarkpayLoader from "@/components/StarkpayLoader";
import { decodeUser } from "@/lib/utils";
import { readContract, useWriteContract } from "@/services/contracts";

const Profile = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useRouter();
  const { writeContract } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [shouldRefetch, setShouldRefetch] = useState(false);

  useEffect(() => {
    if (address) {
      fetchProfileData();
    }
  }, [address, shouldRefetch]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await readContract("get_user", [address]);

      if (error) {
        toast.error("Failed to fetch profile data!");
        console.error("Error fetching profile data:", error);
        return;
      }

      if (data) {
        const formattedData = decodeUser(data as {
          email: bigint;
          username: bigint;
          address: bigint;
          registered_at: bigint;
        });

        if (formattedData) {
          setFormData({
            username: formattedData.username || "",
            email: formattedData.email || "",
          });
          toast.success("Profile data fetched successfully!");
        } else {
          toast.error("Invalid profile data format!");
        }
      } else {
        toast.error("No profile data found!");
      }
    } catch (err) {
      toast.error("Unexpected error fetching profile data!");
      console.error("Unexpected error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async () => {
  try {
    setLoading(true);

    // Fetch current user data
    const { data, error } = await readContract("get_user", [address]);
    if (error) {
      toast.error("Failed to fetch current profile data!");
      return;
    }

    const currentData = data
      ? decodeUser(data as {
          email: bigint;
          username: bigint;
          address: bigint;
          registered_at: bigint;
        })
      : { email: "", username: "" };

    // Determine if it's an update or a new profile
    const isUpdatingProfile =
      currentData.username !== formData.username ||
      currentData.email !== formData.email;

    const { transactionHash, error: writeError } = await writeContract(
      "register",
      [formData.email, formData.username]
    );

    if (writeError) {
      toast.error("Failed to register profile!");
      console.error("Error registering profile:", writeError);
      return;
    }

    toast.success(
      isUpdatingProfile
        ? "Profile updated successfully!"
        : "Profile registered successfully!"
    );

    console.log("Transaction Hash:", transactionHash);

    await sendEmail(
      formData.email,
      formData.username,
      isUpdatingProfile ? "profile" : "welcome"
    );

    // Trigger refetch
    setShouldRefetch((prev) => !prev);
  } catch (err) {
    toast.error("Unexpected error during profile registration!");
    console.error("Unexpected error:", err);
  } finally {
    setLoading(false);
  }
};

const sendEmail = async (
  email: string,
  name: string,
  action: "welcome" | "profile"
) => {
  try {
    const subject =
      action === "welcome"
        ? "Welcome to StarkPay!"
        : "Your Profile Has Been Updated";

    const template = action;

    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject,
        template,
        variables: { name },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending email:", error);
    } else {
      console.log(
        action === "welcome"
          ? "Welcome email sent successfully!"
          : "Profile update email sent successfully!"
      );
    }
  } catch (error) {
    toast.error(
      action === "welcome"
        ? "Unexpected error sending welcome email!"
        : "Unexpected error sending profile update email!"
    );
    console.error("Unexpected error:", error);
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
        console.log("Welcome email sent successfully!");
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
          <p className="text-neutral-400">
            Please connect your wallet to view this page.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Navbar />
      {loading && <StarkpayLoader />}
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
