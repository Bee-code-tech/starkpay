import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccount } from "@starknet-react/core";

interface InvoiceModalProps {
  id: string;
    open: boolean;
  email: string;
  amount: string;
  description: string;
  mode?: boolean;
    date: string;
    onConfirm: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  id,
    email,
    description,
  date,
  amount,
    mode,
    onConfirm,
}) => {
  const {address} = useAccount();
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
          <div className="flex justify-between items-center mb-2">
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
                {
                  address ? address.slice(0, 12).concat("...").concat(address.slice(-5)) : "No wallet connected"
              }
            </p>
          </div>       
        </div>
                  
        {/* Payment  */}
        <div className="mt-4">
               <h2 className="font-bold text-lg mb-3">Payment</h2>
         
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Invoice ID:</p>
            <p className="text-sm text-neutral-300">
              {id}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">Invoice Amount:</p>
            <p className="text-sm text-neutral-300 ">
             $ {amount}
            </p>
          </div>
            {
              mode && (
                 <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Invoice fee:</p>
            <p className="text-sm text-neutral-300">
              $.02
            </p>
          </div>
              )
         }
         
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-400">Private mode:</p>
            <p className="text-sm text-neutral-300">
              {mode ? "On" : "Off"}
            </p>
          </div>
          
          <div className="border-t border-neutral-500 mt-2 mb-1"></div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Total Amount:</p>
            <p className="text-sm font-bold text-neutral-100">
              ${amount + (mode ? 0.02 : 0)}
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
