import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export interface Transaction {
  id: string;
  type: "generated" | "received";
  amount: string;
  wallet: string;
  description: string;
  date: string;
  currency: string;
  status: string;
  privacy: string;
  email: string
}

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}
const shortenAddress = (address: string, chars = 6): string => {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const statusBadgeColor = transaction.status === "PAID" ? "bg-green-500" : "bg-red-500";
  const formattedDate = format(new Date(transaction.date), "PPP, p");

  const showSendButton =
    transaction.type === "received" && transaction.status !== "PAID";
  

  
  

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent aria-describedby="transaction details" className="flex items-centerr justify-start flex-col ">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4  space-y-4">
          {/* Type and Status */}
          <div className="flex items-center justify-between">
            <p className="text-sm">
              <strong>Type:</strong> Invoice {transaction.type}
            </p>
            <Badge className={`${statusBadgeColor} text-white py-1 px-3 rounded-full`}>
              {transaction.status}
            </Badge>
          </div>

          {/* Amount */}
          <div>
            <div className="text-md flex justify-between">
              <strong>Amount:</strong>{" "}
              <span className="text-lg font-bold">
                {transaction.amount} {transaction.currency}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-md flex justify-between">
              <strong>Description:</strong> 
              <p>{transaction.description || "No description provided"}</p>
            </div>
          </div>

          {/* Wallet */}
          <div>
            <div className="text-md flex justify-between">
              <strong>Wallet:</strong> 
              <p>{shortenAddress(transaction.wallet)}</p>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <div className="text-md flex justify-between">
              <strong>Privacy:</strong> 
              <p>{transaction.privacy === "PUBLIC" ? "Off" : "On" }</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="text-md flex justify-between">
              <strong>Date:</strong>
              <p> {formattedDate}</p>
            </div>
          </div>

          {/* Transaction Link */}
         <div className="mt-4">
          {showSendButton && (
            <Link
              href={`/invoice?payee=${transaction.wallet}&amount=${transaction.amount}&currency=${transaction.currency}&private=${transaction.privacy === "PUBLIC" ? 'false' : 'true'}&id=${transaction.id}&description=${transaction.description}&date=${transaction.date}&email=${transaction.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-500 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
              >
               
              Send {transaction.amount} {transaction.currency}
            </Link>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
