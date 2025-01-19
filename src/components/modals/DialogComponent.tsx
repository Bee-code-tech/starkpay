import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PrivateIcon from "../icons/PrivateIcon";

interface DialogComponentProps {
  open: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onOpenChange: (open: boolean) => void;
}

export const DialogComponent: React.FC<DialogComponentProps> = ({
  open,
  title,
  confirmText = "Continue",
  cancelText = "Turn Off",
  onConfirm,
  onCancel,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center mb-4">
                  <div className="my-6">
                  <PrivateIcon />
                      
                </div>
                  <h2 className="text-lg font-bold">Private Mode</h2>
                  <p className="text-center font-thin">This will make your transaction encrypted, attracts extra fee of </p>
                  <h3 className="text-md font-bold">$0.02</h3>
              </div>
          
            <Button onClick={onConfirm} className="py-5 text-md">
            {confirmText}
              </Button>
              <Button variant="outline" onClick={onCancel} className="-mt-2 py-5 text-md">
            {cancelText}
            </Button>
      </DialogContent>
    </Dialog>
  );
};
