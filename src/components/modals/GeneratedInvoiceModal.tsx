import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ShareIcon from "../icons/ShareIcon";
import toast from "react-hot-toast";

interface GeneratedInvoiceModalProps {
  open: boolean;
  qrcode: string;
  amount: string;
  url: string;
  coin: string;
  onOpenChange: (open: boolean) => void;
}

export const GeneratedInvoiceModal: React.FC<GeneratedInvoiceModalProps> = ({
  open,
  qrcode,
  amount,
  coin,
  url,
  onOpenChange,
}) => {
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to copy!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Invoice</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="my-2">
            <ShareIcon />
          </div>
          <div className="h-36 w-36 bg-neutral-700 rounded-lg p-2 my-4 relative">
            <img
              src={qrcode}
              alt="QR Code"
              className="h-full w-full object-contain rounded-lg"
            />
            <svg
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              width="36"
              height="36"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="512" height="512" rx="100" fill="#0D6EFD" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M285.461 160C303.554 178.953 316.463 191.916 326.151 200.872V217.174C302.559 213.381 283.322 207.958 256.235 193.739L232.561 221.29L356 248.697V276.596C326.312 303.24 308.768 322.523 285.461 351.472H229.1C214.014 329.395 201.989 316.399 187.704 306.3V292.177C212.321 295.537 231.465 300.985 256.235 315.656L282 286.72L156 259.483V234.296C178.448 214.552 197.688 195.047 229.086 160H285.461Z"
                fill="#F8F9FA"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Share invoice link</h2>
          <p className="text-center font-thin">
            An email has been sent to the payer or you can send this link to the
            payer and it will ask them to send {amount} {coin}.
          </p>
        </div>

        <Button
          onClick={handleCopyToClipboard}
          className="w-full mt-4 bg-blue-600 text-white text-md py-6 rounded-md"
        >
          Copy to Clipboard
        </Button>
      </DialogContent>
    </Dialog>
  );
  
};
