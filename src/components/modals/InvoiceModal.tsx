import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InvoiceModalProps {
    open: boolean;
  email: string;
  amount: number;
    description: string;
    date: string;
    onConfirm: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
    open,
    email,
    description,
  date,
    amount,
    onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onConfirm}>
      <DialogContent className="max-w-lg ">
        <DialogHeader>
          <DialogTitle>Invoice Summary</DialogTitle>
        </DialogHeader>
              
        <div className="rounded-lg border border-blue-500 p-4 mt-6 mb-4">
        <div className="">
               <h2 className="font-bold text-lg mb-3">Details</h2>
         
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Payer Email:</p>
            <p className="text-sm text-neutral-300">
              {email }
            </p>
          </div>
          <div className="flex flex-col mb-2">
            <p className="text-sm text-neutral-400">Description:</p>
            <p className="text-sm text-neutral-300 break-words whitespace-normal">
              {description}
            </p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Due Date:</p>
            <p className="text-sm text-neutral-300">
              {date}
            </p>
          </div>
          
          <div className="border-t border-neutral-500 mt-2 mb-1"></div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Payee Wallet Address:</p>
            <p className="text-sm font-bold text-neutral-100">
              0x653h...73ujd
            </p>
          </div>       
        </div>
                  
        {/* Payment  */}
        <div className="mt-4">
               <h2 className="font-bold text-lg mb-3">Payment</h2>
         
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Invoice ID:</p>
            <p className="text-sm text-neutral-300">
              #212529
            </p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">Invoice Amount:</p>
            <p className="text-sm text-neutral-300 ">
             {amount}
            </p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Invoice fee:</p>
            <p className="text-sm text-neutral-300">
              $3.00
            </p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Gas fee:</p>
            <p className="text-sm text-neutral-300">
              $1.00
            </p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Private mode:</p>
            <p className="text-sm text-neutral-300">
              $0.12
            </p>
          </div>
          
          <div className="border-t border-neutral-500 mt-2 mb-1"></div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Total Amount:</p>
            <p className="text-sm font-bold text-neutral-100">
              $10,000.00
            </p>
          </div>       
        </div>
        </div>
          
        <Button onClick={onConfirm} className="py-5 text-md">
               Close
        </Button>
              
      </DialogContent>
    </Dialog>
  );
};
