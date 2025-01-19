"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useBalance } from "@starknet-react/core";
import { useRouter, useSearchParams } from "next/navigation";
import StarkpayLoader from "@/components/StarkpayLoader";
import { format } from "date-fns";
import Blockies from "react-blockies";
import ConnectButton from "@/components/ConnectButton";
import { readETHBalance, readSTRKBalance, usePayETH, usePaySTRK } from "@/services/contracts";

const Invoice = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { payETH } = usePayETH()
  const { paySTRK } = usePaySTRK()
  const [error, setError] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [strkBalance, setStrkBalance] = useState<string>("0.00");
  const [activeTab, setActiveTab] = useState<"ETH" | "STRK">("ETH");

  const decimals = 18;

  useEffect(() => {
    if (address) {
      const fetchBalances = async () => {
        try {
          const ethResponse = await readETHBalance("balance_of", [address]);
          const strkResponse = await readSTRKBalance("balance_of", [address]);

          if (ethResponse?.data) {
            setEthBalance(formatBalance(ethResponse.data as bigint, decimals));
          }
          if (strkResponse?.data) {
            setStrkBalance(formatBalance(strkResponse.data as bigint, decimals));
          }
        } catch (error) {
          console.error("Error fetching balances:", error);
        }
      };

      fetchBalances();
     
    }
  }, [address]);

    const formatBalance = (value: bigint, decimals: number): string => {
    return (Number(value) / Math.pow(10, decimals)).toFixed(4);
  };

   const toWei = (amount: number): bigint => {
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  };
  // Extract query parameters
  const payee = searchParams?.get("payee") || "";
  const amount = parseFloat(searchParams?.get("amount") || "0");
  const invoiceId = searchParams?.get("id") || "";
  const currency = searchParams?.get("currency") || "";
  const description = searchParams?.get("description") || "";
  const email = searchParams?.get("email") || "";
  const privateMode = searchParams?.get("private") === "true";
  const dueDate = new Date();


  const handleSubmit = async () => {
    try {
      setLoading(true);

      const amountInWei = toWei(amount + (privateMode ? 0.02 : 0));

      let transactionHash;

      if (currency === "ETH") {
        // Pay with ETH
        const payETHArgs = [payee, amountInWei];
        const confirmArgs = [payee, email, invoiceId];

        const result = await payETH("transfer", payETHArgs, "confirm_payment", confirmArgs);
        transactionHash = result.transactionHash;
      } else {
        // Pay with STRK
        const paySTRKArgs = [payee, amountInWei];
        const confirmArgs = [payee, email, invoiceId];

        const result = await paySTRK("transfer", paySTRKArgs, "confirm_payment", confirmArgs);
        transactionHash = result.transactionHash;
      }

      if (transactionHash) {
        console.log("Payment successful:", transactionHash);

        await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: `${email}`,
          subject: "Payment Confirmation - Starkpay",
          template: "confirm",
          variables: {
            name: "Starpay User",
            amount: amount,
            coin: currency,
            transactionId: transactionHash,
            payerName: "",
            payerWallet: address,
            payeeName: "",
            payeeWallet: payee,
          },
        }),
      });

        console.log("Email notification sent successfully.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment failed. Please try again.");
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

          {/* Payer Section */}
          <p className="text-md font-bold mb-1">From</p>
            <div className="rounded-lg bg-neutral-700 p-4 mb-6">
              {address ? (
                <>
                  <div className="flex justify-between items-center">
                    {/* Wallet Address */}
                    <div className="flex items-center gap-2 text-white text-md font-bold">
                      <Blockies
                        seed={address.toLowerCase() || ""}
                        size={10}
                        scale={5}
                        className="mr-2 h-8 w-8 rounded-full"
                      />
                      {address.slice(0, 6).concat("...").concat(address.slice(-5))}
                    </div>

                    {/* Balance Tabs */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-4">
                        <button
                          className={`px-2 py-1 text-sm font-bold ${
                            activeTab === "ETH" ? "border-b border-blue-500 text-white" : "text-neutral-400"
                          }`}
                          onClick={() => setActiveTab("ETH")}
                        >
                          ETH
                        </button>
                        <button
                          className={`px-2 py-1 text-sm font-bold ${
                            activeTab === "STRK" ? "border-b border-blue-500 text-white" : "text-neutral-400"
                          }`}
                          onClick={() => setActiveTab("STRK")}
                        >
                          STRK
                        </button>
                      </div>

                      {/* Display Balance */}
                      <div className="text-white mt-2">
                        {activeTab === "ETH" ? (
                          <span>{ethBalance} ETH</span>
                        ) : (
                          <span>{strkBalance} STRK</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Connect your wallet to view details</span>
                  <ConnectButton className="bg-blue-600 py-2 px-4 rounded-md text-sm font-bold text-white" />
                </div>
              )}
            </div>

          {/* Payee Section */}
          <p className="text-md font-bold mb-1">To</p>
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            <div className="flex justify-start items-center ">
              <span className="flex items-center gap-2 text-white font-bold text-md">
                <Blockies
                  seed={payee?.toLowerCase() || ""}
                  size={10}
                  scale={5}
                  className="mr-2 h-8 w-8 rounded-full"
                />
                {payee?.slice(0, 6).concat("...").concat(payee?.slice(-5))}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center mb-4 ">
            <p className="text-md font-thin">Amount</p>
            <h1 className="text-2xl font-bold">
              {privateMode ? amount + 0.02 : amount} {currency}
            </h1>
          </div>

          {/* Invoice Details */}
          <div className="rounded-lg border border-blue-500 p-4 mt-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Description:</p>
              <p className="text-sm text-neutral-300 break-words whitespace-normal">
                {description}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Due Date:</p>
              <p className="text-sm text-neutral-300">
                {dueDate ? format(dueDate, "PPP") : "Not set"}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Private Mode:</p>
              <p className="text-sm text-neutral-300">
                {privateMode ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="rounded-lg border border-blue-500 p-4 mt-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">InvoiceID:</p>
              <p className="text-sm text-neutral-300 break-words whitespace-normal">
                {invoiceId}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Invoice Amount:</p>
              <p className="text-sm text-neutral-300">
                {amount} {currency}
              </p>
            </div>
            {
              privateMode && (
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-neutral-400">Invoice fee:</p>
                  <p className="text-sm text-neutral-300">
                    0.02 {currency}
                  </p>
                </div>
              )
            }
            <div className="border-t border-neutral-500 mt-2 mb-1"></div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Total Amount:</p>
              <p className="text-sm font-bold text-neutral-100">
                {amount + (privateMode ? 0.02 : 0)} {currency}
              </p>
            </div>
          </div>

          {address ? (
            <Button
              className="w-full mt-6 bg-blue-600 text-lg text-white rounded-md py-5"
              onClick={handleSubmit}
              disabled={!address}
            >
              Send
            </Button>
          ) : (
            <ConnectButton className="w-full bg-blue-600 py-5 text-md mt-4" />
          )}
        </div>
      </div>
    </section>
  );
};

export default Invoice;



