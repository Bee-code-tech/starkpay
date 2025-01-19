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

interface Invoice {
  invoiceId: string;
  creator: string;
  recipientEmail: string;
  amount: string;
  description: any;
  currency: string;
  dueDate: string;
  generatedAt: string;
  status: string;
  privacy: string;
  type?: "generated" | "received";
}

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "generated" | "received">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { address } = useAccount();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addInvoiceType = (decodedInvoices: Invoice[], myAddress: string): Invoice[] => {
    return decodedInvoices.map((invoice) => ({
      ...invoice,
      type: invoice.creator.toLowerCase() === myAddress.toLowerCase() ? "generated" : "received",
    }));
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!address) return;

      setLoading(true);
      try {
        const { data, error } = await readContract("get_init", [address]);

        if (error) {
          setError("Failed to fetch invoices");
          console.error("Error fetching invoices:", error);
          return;
        }

        if (!data) {
          setError("No data received");
          return;
        }
        console.log('data', data);
        
        const decoded = decodeInvoices(Array.isArray(data) ? data : [data]);
        const typedInvoices = addInvoiceType(decoded, address);
        setInvoices(typedInvoices);
      } catch (err) {
        setError("Unexpected error occurred while fetching invoices");
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [address]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (activeTab === "all") return true;
    return activeTab === invoice.type;
  });

  console.log('invoices', invoices);
  

  return (
    <section>
      <Navbar />
      <div className="p-6 mt-6">
        <div className="rounded-lg border border-neutral-500 p-6 max-w-5xl mx-auto text-white max-h-screen overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-blue-500 font-bold" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All 
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "generated" ? "border-b-2 border-blue-500 font-bold" : ""}`}
              onClick={() => setActiveTab("generated")}
            >
              Generated
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "received" ? "border-b-2 border-blue-500 font-bold" : ""}`}
              onClick={() => setActiveTab("received")}
            >
              Received
            </button>
          </div>

          {/* Transactions */}
          {loading ? (
            <p className="text-center text-neutral-400">Loading...</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-center text-neutral-400">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.invoiceId}
                  className="flex flex-col lg:flex-row gap-2  lg:justify-between items-center rounded-lg bg-neutral-600 border border-neutral-500 px-2 py-4 lg:py-2"
                >
                  {/* Icon and description */}
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full flex items-center justify-center">
                      {invoice.type === "generated" ? <GenerateIcon /> : <RecieveIcon />}
                    </div>
                    <p className="text-lg">
                      Invoice {invoice.type} for <strong>{invoice.amount}</strong> <strong>{invoice.currency}</strong>
                    </p>
                  </div>

                  {/* Date and action */}
                  <div className="flex gap-3 items-center">
                    <p className="text-sm text-neutral-400">{invoice.generatedAt}</p>
                    <button
                      className="px-4 py-2 text-sm font-semibold text-blue-600 flex gap-2 rounded-lg"
                      onClick={() => setSelectedTransaction({
                        id: invoice.invoiceId,
                        wallet: invoice.creator,
                        date: invoice.generatedAt,
                        amount: invoice.amount,
                        description: invoice.description ?? '',
                        currency: invoice.currency,
                        status: invoice.status,
                        privacy: invoice.privacy,
                        email: invoice.recipientEmail,
                        type: invoice.type as "generated" | "received",
                      })}
                    >
                      Transaction
                      <TransactionIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        {selectedTransaction && (
          <TransactionModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </section>
  );
};

export default HistoryPage;
