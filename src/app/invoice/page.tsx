"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@starknet-react/core";
import StarkpayLoader from "@/components/StarkpayLoader";
import { format } from "date-fns";
import Blockies from "react-blockies";
import ConnectButton from "@/components/ConnectButton";
import { readETHBalance, readSTRKBalance, usePayETH, usePaySTRK } from "@/services/contracts";

const Invoice = () => {
  const { address } = useAccount();
  const { payETH } = usePayETH();
  const { paySTRK } = usePaySTRK();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [strkBalance, setStrkBalance] = useState<string>("0.00");
  const [activeTab, setActiveTab] = useState<"ETH" | "STRK">("ETH");

  const [params, setParams] = useState<{
    payee: string;
    amount: number;
    id: string;
    currency: string;
    description: string;
    email: string;
    date: string;
    privateMode: boolean;
  } | null>(null);

  const decimals = 18;

  const formatBalance = (value: bigint, decimals: number): string => {
    return (Number(value) / Math.pow(10, decimals)).toFixed(4);
  };

  const toWei = (amount: number): bigint => {
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  };

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payee = urlParams.get("payee") || "";
    const amount = parseFloat(urlParams.get("amount") || "0");
    const id = urlParams.get("id") || "";
    const currency = urlParams.get("currency") || "";
    const description = urlParams.get("description") || "";
    const email = urlParams.get("email") || "";
    const privateMode = urlParams.get("private") === "true";
    const date = urlParams.get('date') || ""

    setParams({ payee, amount, id, currency, description, email, privateMode, date });
  }, []);

  const handleSubmit = async () => {
    if (!params) return;

    const { payee, amount, id, currency, email, privateMode } = params;

    try {
      setLoading(true);

      const amountInWei = toWei(amount + (privateMode ? 0.02 : 0));
      let transactionHash;

      if (currency === "ETH") {
        const payETHArgs = [payee, amountInWei];
        const confirmArgs = [payee, email, id];
        const result = await payETH("transfer", payETHArgs, "confirm_payment", confirmArgs);
        transactionHash = result.transactionHash;
      } else {
        const paySTRKArgs = [payee, amountInWei];
        const confirmArgs = [payee, email, id];
        const result = await paySTRK("transfer", paySTRKArgs, "confirm_payment", confirmArgs);
        transactionHash = result.transactionHash;
      }

      if (transactionHash) {
        console.log("Payment successful:", transactionHash);

        await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Payment Confirmation - Starkpay",
            template: "confirm",
            variables: {
              name: "Starkpay User",
              amount,
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

  if (!params) {
    return <StarkpayLoader />;
  }

  return (
    <section>
      {loading && <StarkpayLoader />}
      <div className="max-w-lg mx-auto px-2 my-12">
        <div className="rounded-2xl bg-[#212529] p-4 text-white border-neutral-500 border">
          <h2 className="text-xl font-bold mb-6">Pay Invoice</h2>

          {/* Payer Section */}
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            {address ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white text-md font-bold">
                    <Blockies
                      seed={address.toLowerCase() || ""}
                      size={10}
                      scale={5}
                      className="mr-2 h-8 w-8 rounded-full"
                    />
                    {address.slice(0, 6).concat("...").concat(address.slice(-5))}
                  </div>
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
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            <div className="flex justify-start items-center">
              <span className="flex items-center gap-2 text-white font-bold text-md">
                <Blockies seed={params.payee.toLowerCase() || ""} size={10} scale={5} className="mr-2 h-8 w-8 rounded-full" />
                {params.payee.slice(0, 6).concat("...").concat(params.payee.slice(-5))}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center mb-4">
            <p className="text-md font-thin">Amount</p>
            <h1 className="text-2xl font-bold">
              {params.privateMode ? params.amount + 0.02 : params.amount} {params.currency}
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
                {params.description}
              </p>
            </div>
            {/* <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Due Date:</p>
              <p className="text-sm text-neutral-300">
                {params.date ? format(params.date, "PPP") : "Not set"}
              </p>
            </div> */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Private Mode:</p>
              <p className="text-sm text-neutral-300">
                {params.privateMode ? "Enabled" : "Disabled"}
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
                {params.id}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Invoice Amount:</p>
              <p className="text-sm text-neutral-300">
                {params.amount} {params.currency}
              </p>
            </div>
            {
              params.privateMode && (
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-neutral-400">Invoice fee:</p>
                  <p className="text-sm text-neutral-300">
                    0.02 {params.currency}
                  </p>
                </div>
              )
            }
            <div className="border-t border-neutral-500 mt-2 mb-1"></div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Total Amount:</p>
              <p className="text-sm font-bold text-neutral-100">
                {params.amount + (params.privateMode ? 0.02 : 0)} {params.currency}
              </p>
            </div>
          </div>

          <Button
            className="w-full mt-6 bg-blue-600 text-lg text-white rounded-md py-5"
            onClick={handleSubmit}
            disabled={!address}
          >
            Send
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Invoice;
