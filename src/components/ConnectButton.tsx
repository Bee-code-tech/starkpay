import React from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import Image from "next/image";
import { Connector, useConnect } from "@starknet-react/core";
import { Close } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";

const Wallet = ({
  name,
  alt,
  src,
  connector,
}: {
  name: string;
  alt: string;
  src: string;
  connector: Connector;
}) => {
  const { connect } = useConnect();
  const isSvg = src?.startsWith("<svg");

  function handleConnectWallet(): void {
    connect({ connector });
    localStorage.setItem("lastUsedConnector", connector.name);
  }

  return (
    <button
      className=" flex cursor-pointer items-center gap-4 p-[.7rem] text-start justify-center transition-all hover:rounded-[10px] bg-neutral-600"
      onClick={handleConnectWallet}
    >
      <div className="h-[2.2rem] w-[2.2rem] rounded-[5px] ">
        {isSvg ? (
          <div
            className="h-full w-full rounded-[5px] object-cover"
            dangerouslySetInnerHTML={{
              __html: src ?? "",
            }}
          />
        ) : (
          <Image
            alt={alt}
            src={src}
            width={70}
            height={70}
            className="h-full w-full rounded-[5px] object-cover"
          />
        )}
      </div>
      <p className="">{name}</p>
    </button>
  );
};

const ConnectModal = () => {
  const { connectors } = useConnect();

  return (
      <DialogContent className="text-white  mx-auto max-w-lg">
      <DialogHeader>
        <DialogTitle>Connect a Wallet</DialogTitle>
        <DialogDescription className="lg:text-end">
          <button className="bg-outline-grey grid h-8 w-8 place-content-center rounded-full">
            <Close />
          </button>
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-1 flex-col justify-between ">
        <div className=" col-span-5 lg:h-full ">
          <div className="flex flex-col gap-4 ">
            {connectors.map((connector, index) => (
              <Wallet
                key={connector.id || index}
                src={connector.icon.light!}
                name={connector.name}
                connector={connector}
                alt="alt"
              />
            ))}
          </div>
        </div>
        
      </div>
    </DialogContent>
  );
};

const ConnectButton = ({
  text = "Connect Wallet",
  className = "",
}: {
  text?: string;
  className?: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button  className={className}>
          {text}
        </Button>
      </DialogTrigger>
      <ConnectModal />
    </Dialog>
  );
};

export default ConnectButton;
