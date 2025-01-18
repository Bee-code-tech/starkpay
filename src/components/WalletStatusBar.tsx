"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect } from "@starknet-react/core";

const WalletStatusBar = () => {
  const { address } = useAccount();
  const { connect } = useConnect();
  const [status, setStatus] = useState<"connected" | "locked" | "disconnected">(
    "disconnected"
  );

  useEffect(() => {
    if (!address) {
      setStatus("disconnected");
    } else {
      checkWalletState();
    }
  }, [address]);

  const checkWalletState = async () => {
    try {
        const isLocked = false;

      if (isLocked) {
        setStatus("locked");
      } else {
        setStatus("connected");
      }
    } catch (error) {
      console.error("Error checking wallet state:", error);
      setStatus("disconnected");
    }
  };

 

  return (
    <div
      className="hidden fixed bottom-4 right-4 bg-neutral-800 text-white rounded-full shadow-lg p-2 lg:flex items-center gap-2 px-3 border border-neutral-400"
      style={{ zIndex: 1000 }}
    >
      {/* Status Icon */}
      <div className="flex items-center">
        {status === "connected" && (
          <span className="bg-green-500 h-5 w-5 rounded-full  "></span>
        )}
        {status === "locked" && (
          <span className="bg-yellow-500 h-5 w-5 rounded-full "></span>
        )}
        {status === "disconnected" && (
          <span className="bg-red-500 h-5 w-5 rounded-full "></span>
        )}
      </div>

      {/* Status Text */}
      <div>
        {status === "connected" && <p> Connected</p>}
        {status === "locked" && <p>Locked</p>}
        {status === "disconnected" && <p>Disconnected</p>}
      </div>

     
    </div>
  );
};

export default WalletStatusBar;
