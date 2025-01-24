"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import StarkpayLoader from "@/components/StarkpayLoader";
import { getJsonFromPinata } from "@/services/ipfs";
import { readContract, readETHBalance, readSTRKBalance, usePayPrivateETH, usePayPrivateSTRK} from "@/services/contracts";
import { useAccount } from "@starknet-react/core";
import Blockies from "react-blockies";
import ConnectButton from "@/components/ConnectButton";

const PrivateInvoice = () => {
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [strkBalance, setStrkBalance] = useState<string>("0.00");
  const [activeTab, setActiveTab] = useState<"ETH" | "STRK">("ETH");
  const { payETH } = usePayPrivateETH();
  const { paySTRK } = usePayPrivateSTRK();
  const decimals = 18;

  const formatBalance = (value: bigint, decimals: number): string => {
    return (Number(value) / Math.pow(10, decimals)).toFixed(4);
  };

  const toWei = (amount: number): bigint => {
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  };

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hash = urlParams.get("hash");

        if (!hash) {
          throw new Error("Hash parameter is missing in the URL.");
        }

        console.log("Fetching CID from Starknet...");
        const { data: cid, error } = await readContract("get_private_invoice_cid", [hash]);
        if (error || !cid) {
          throw new Error("Failed to fetch CID from contract.");
        }

        console.log("Fetching JSON data from Pinata...");
        const jsonData = await getJsonFromPinata(String(cid));
        console.log("Fetched Data:", jsonData);
        setInvoiceData(jsonData);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, []);

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

  const handleSubmit = async () => {
    if (!invoiceData) return;

    const { address: payeeAddress, amount, id, coin, email, privateMode } = invoiceData;

    try {
      setLoading(true);

      const amountInWei = toWei(Number(amount) + (privateMode ? 0.02 : 0));
      let transactionHash;

      if (coin === "ETH") {
        const payETHArgs = [payeeAddress, amountInWei];
        const result = await payETH("transfer", payETHArgs);
        transactionHash = result.transactionHash;
      } else {
        const paySTRKArgs = [payeeAddress, amountInWei];
        const result = await paySTRK("transfer", paySTRKArgs);
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
              coin,
              transactionId: transactionHash,
              payerName: "",
              payerWallet: address,
              payeeName: "",
              payeeWallet: payeeAddress,
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

  if (loading) {
    return <StarkpayLoader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-12">
        <h2 className="text-lg font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
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

          {/* address Section */}
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            <div className="flex justify-start items-center">
              <span className="flex items-center gap-2 text-white font-bold text-md">
                <Blockies seed={invoiceData.address.toLowerCase() || ""} size={10} scale={5} className="mr-2 h-8 w-8 rounded-full" />
                {invoiceData.address.slice(0, 6).concat("...").concat(invoiceData.address.slice(-5))}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center mb-4">
            <p className="text-md font-thin">Amount</p>
            <h1 className="text-2xl font-bold">
              {invoiceData.privateMode ? Number(invoiceData.amount) + 0.02 : invoiceData.amount} {invoiceData.coin}
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
                {invoiceData.description}
              </p>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Private Mode:</p>
              <p className="text-sm text-neutral-300">
                {invoiceData.privateMode ? "Enabled" : "Disabled"}
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
                {invoiceData.id}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Invoice Amount:</p>
              <p className="text-sm text-neutral-300">
                {invoiceData.amount} {invoiceData.coin}
              </p>
            </div>
            {
              invoiceData.privateMode && (
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-neutral-400">Invoice fee:</p>
                  <p className="text-sm text-neutral-300">
                    0.02 {invoiceData.coin}
                  </p>
                </div>
              )
            }
            <div className="border-t border-neutral-500 mt-2 mb-1"></div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Total Amount:</p>
              <p className="text-sm font-bold text-neutral-100">
                {Number(invoiceData.amount) + (invoiceData.privateMode ? 0.02 : 0)} {invoiceData.coin}
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

export default PrivateInvoice;
