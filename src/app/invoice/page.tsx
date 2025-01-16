"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@starknet-react/core";
import {  useWriteContract } from "@/services/contracts";
import { useRouter } from "next/navigation";
import StarkpayLoader from "@/components/StarkpayLoader";
import { format } from "date-fns";
import Blockies from "react-blockies";

const Invoice = () => {
  const [network, setNetwork] = useState<"starknet" | "ethereum">("starknet");
  const [coin, setCoin] = useState<"ETH" | "SOL" | "STRK" | "USDC">("ETH");
  const [amount, setAmount] = useState<number>(0);
  const [privateMode, setPrivateMode] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>();
  const [email, setEmail] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { address } = useAccount();
  const [data, setData] = useState<any>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false)
  

 const handleSubmit = async () => {
  if (!data) {
    router.push("/profile");
    return;
  }

  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3001"
        : "https://starkpay.vercel.app";

        const constructedUrl = `${baseUrl}/invoice?payee=${address}&amount=${amount}&currency=${coin}&private=${privateMode}`;


        setLoading(true);

  
    const { transactionHash, error } = await writeContract("create_invoice", [
      amount,
      coin,
      description,
      email,
      date ? Math.floor(date.getTime() / 1000) : 0,
    ]);

    if (error) {
      throw new Error("Failed to generate invoice");
    }

    console.log("Transaction Hash:", transactionHash);

     fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Payment Request from Starkpay",
        template: "payment",
        variables: {
          username: "StarkPay User",
          amount: amount,
          coin,
          transactionLink: constructedUrl,
        },
      }),
    });

  } catch (err) {
    console.error("Error generating invoice:", err);
    setError("Failed to generate invoice. Please try again.");
  } finally {
    setLoading(false);
  }
};



  return (
    <section>
      
      {loading && <StarkpayLoader />}
      <div className="max-w-lg mx-auto px-2 my-12">
        <div className="rounded-2xl bg-[#212529] p-4 text-white border-neutral-500 border">
          <h2 className="text-xl font-bold mb-6">Pay Invoice</h2>

          {/* payer Section */}
          <p className="text-md font-bold mb-1">From</p>
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            <div className="flex justify-start items-center ">
               <span className="flex items-center gap-2 text-white">
                  <Blockies
                    seed={address?.toLowerCase() || ""}
                    size={10}
                    scale={5}
                    className="mr-2 h-8 w-8 rounded-full"
                  />
                  {address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
                </span>
            </div>

          </div>

          {/* payee Section */}
          <p className="text-md font-bold mb-1">To</p>
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            <div className="flex justify-start items-center ">
               <span className="flex items-center gap-2 text-white">
                  <Blockies
                    seed={address?.toLowerCase() || ""}
                    size={10}
                    scale={5}
                    className="mr-2 h-8 w-8 rounded-full"
                  />
                  {address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
                </span>
            </div>

          </div>

          <div className="flex w-full flex-col items-center justify-center mb-4 ">
            <p className="text-md font-thin">Amount</p>
            <h1 className="text-2xl font-bold">$300 USDC</h1>
          </div>
     

          <div className="rounded-lg border border-blue-500 p-4 mt-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Description:</p>
              <p className="text-sm text-neutral-300 break-words whitespace-normal">
                {description || "(not provided)"}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Due Date:</p>
              <p className="text-sm text-neutral-300">
                {date ? format(date, "PPP") : "Not set"}
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-neutral-400">Private Mode:</p>
              <p className="text-sm text-neutral-300">
                {privateMode ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>


          <div className="rounded-lg border border-blue-500 p-4 mt-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">InvoiceID:</p>
              <p className="text-sm text-neutral-300 break-words whitespace-normal">
                #START-uuee
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Invoice Amount:</p>
              <p className="text-sm text-neutral-300">
                $ 300
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Invoice Fee:</p>
              <p className="text-sm text-neutral-300">
                $0
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-neutral-400">Private Mode:</p>
              <p className="text-sm text-neutral-300">
                {privateMode ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div className="border-t border-neutral-500 mt-2 mb-1"></div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Total Amount:</p>
            <p className="text-sm font-bold text-neutral-100">
              ${300 + (privateMode ? 0.02 : 0)}
            </p>
          </div> 
          </div>

          <Button
            className="w-full mt-6 bg-blue-600 text-white rounded-md py-5"
            onClick={handleSubmit}
            disabled={!address}
          >
            Generate Invoice
          </Button>

           
        </div>
      </div>
    </section>
  );
};

export default Invoice;
