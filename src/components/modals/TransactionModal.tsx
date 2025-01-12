import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface Transaction {
  id: number;
  type: "generated" | "received";
  amount: string;
  wallet: string;
  date: string;
}

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <p>
            <strong>Type:</strong> Invoice {transaction.type}
          </p>
          <p>
            <strong>Amount:</strong> {transaction.amount}
          </p>
          <p>
            <strong>Wallet:</strong> {transaction.wallet}
          </p>
          <p>
            <strong>Date:</strong> {transaction.date}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
