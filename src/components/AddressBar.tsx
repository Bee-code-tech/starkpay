"use client";
import {
  useAccount,
  useDisconnect,
  useStarkProfile,
} from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import CopyButton from "./CopyButton";
import { Button } from "./ui/button";
import Blockies from "react-blockies";

const AddressBar = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: starkProfile } = useStarkProfile({ address });
  const [imageError, setImageError] = useState(false);

  if (!address) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-haspopup="dialog"
          className="border border-neutral-500 bg-neutral-300/20 rounded-full px-2 py-1 md:px-4 md:py-2"
        >
          <span className="flex items-center gap-2 text-white">
            {!imageError && starkProfile?.profilePicture ? (
              <img
                src={starkProfile.profilePicture}
                className="mr-2 h-8 w-8 rounded-full"
                alt="starknet profile"
                onError={() => setImageError(true)}
              />
            ) : (
              <Blockies
                seed={address.toLowerCase()} // Generate the Blockie based on the address
                size={8} // Number of squares (8x8)
                scale={4} // Pixel scaling factor
                className="mr-2 h-8 w-8 rounded-full"
              />
            )}
            {starkProfile?.name
              ? starkProfile.name
              : address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="flex items-center justify-center">
        <div className="">
          <div className="text-md text-text-primary shadow-popover-shadow flex w-[90vw] max-w-[25rem] flex-col justify-between gap-4 rounded-[24px] p-6  transition-colors duration-500 ease-linear md:max-w-[30rem] ">
            <div className="flex justify-center items-center">
              <h3 className="text-xl font-bold">Connected</h3>
            </div>

            <div className="mx-auto">
              <div className="mx-auto mb-4 h-20 w-20 overflow-clip rounded-full md:h-24 md:w-24">
                {!imageError && starkProfile?.profilePicture ? (
                  <img
                    src={starkProfile?.profilePicture}
                    className="w-full rounded-full"
                    alt="starknet profile"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Blockies
                    seed={address.toLowerCase()}
                    size={10}
                    scale={10}
                    className="h-full w-full rounded-full"
                  />
                )}
              </div>
              <CopyButton
                copyText={starkProfile?.name || address || ""}
                buttonText={
                  starkProfile?.name ||
                  address?.slice(0, 12).concat("...").concat(address?.slice(-5))
                }
                className="text-yellow-primary flex items-center gap-2 text-sm"
                iconClassName="rounded-full  p-1 text-white "
              />
            </div>

            <div>
              <Button
                onClick={() => {
                  disconnect();
                }}
                className="w-full py-5"
                variant="destructive"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressBar;
