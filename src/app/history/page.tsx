"use client";

import GenerateIcon from "@/components/icons/GenerateIcon";
import RecieveIcon from "@/components/icons/RecieveIcon";
import TransactionIcon from "@/components/icons/TransactionIcon";
import TransactionModal, { Transaction } from "@/components/modals/TransactionModal";
import Navbar from "@/components/Navbar";
import { decodeInvoices } from "@/lib/utils";
import { readContract } from "@/services/contracts";
import { useAccount } from "@starknet-react/core";
import React, { useEffect, useState } from "react";

const transactions: Transaction[] = [
  {
    id: 1,
    type: "generated",
    amount: "3 ETH",
    wallet: "0x1234...abcd",
    date: "12/02/2023",
  },
  {
    id: 2,
    type: "received",
    amount: "2 BTC",
    wallet: "0x5678...efgh",
    date: "15/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
  {
    id: 3,
    type: "generated",
    amount: "1.5 ETH",
    wallet: "0x9abc...ijkl",
    date: "18/02/2023",
  },
];



const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "generated" | "received">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { address } = useAccount()
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   if (address) {
     const fetchData = async () => {
      const { data, error } = await readContract("get_init", [address]);
      if (error) setError(error.toString());
      else setData(data);
    };

    fetchData();
   }
     console.log('data', data); 
     
  }, [address]);
  
  console.log('invoices', decodeInvoices(data));
  

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true;
    return activeTab === transaction.type;
  });

  return (
    <section>
      <Navbar />
       <div className="p-6 mt-6">
      <div className="rounded-lg border border-neutral-500 p-6 max-w-5xl mx-auto text-white max-h-[695px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Transactions
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "generated" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("generated")}
          >
            Invoice Generated
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "received" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            Invoice Received
          </button>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center rounded-lg bg-neutral-600 border border-neutral-500 px-4 py-2"
            >
              {/* Icon and description */}
              <div className="flex items-center space-x-3">
                <div className=" rounded-full  flex items-center justify-center">
                  {transaction.type === "generated" ? <GenerateIcon/> : <RecieveIcon />}
                </div>
                <p className="text-lg">
                  Invoice {transaction.type} for <strong>{transaction.amount}</strong>
                </p>

              <p className="text-sm text-neutral-200">{transaction.wallet}</p>
              </div>

              <div className="flex gap-3 items-center">
                <p className="text-sm text-neutral-400">{transaction.date}</p>

              <button
                className="px-4 py-2 text-sm font-semibold text-blue-600 flex gap-2 rounded-lg"
                onClick={() => setSelectedTransaction(transaction)}
              >
                  Transaction
                  <TransactionIcon />
              </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TransactionModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
   </section>
  );
};

export default HistoryPage;
