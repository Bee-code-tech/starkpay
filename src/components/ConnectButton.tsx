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
      className="hover:bg-outline-grey flex cursor-pointer items-center gap-4 p-[.2rem] text-start transition-all hover:rounded-[10px]"
      onClick={handleConnectWallet}
    >
      <div className="h-[2.2rem] w-[2.2rem] rounded-[5px]">
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
      <p className="flex-1">{name}</p>
    </button>
  );
};

const ConnectModal = () => {
  const { connectors } = useConnect();

  return (
    <DialogContent className="text-white border-outline-grey mx-auto w-[90vw] rounded-[25px] border-[1px] border-solid bg-[#1c1b1f] md:h-[30rem] md:w-[45rem]">
      <DialogHeader>
        <DialogTitle>Connect a Wallet</DialogTitle>
        <DialogDescription className="lg:text-end">
          <button className="bg-outline-grey grid h-8 w-8 place-content-center rounded-full">
            <Close />
          </button>
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-1 flex-col justify-between lg:grid lg:grid-cols-5">
        <div className="lg:border-outline-grey px-8 lg:col-span-2 lg:h-full lg:border-r-[1px] lg:border-solid">
          <h4 className="text-text-grey mb-[1rem] font-semibold">Popular</h4>
          <div className="flex flex-col gap-4 py-8">
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
        <div className="border-red h-fit border-t-[.5px] border-solid p-4 lg:col-span-3 lg:flex lg:h-full lg:flex-col lg:border-none lg:px-8 lg:py-0">
          <h2 className="font-bold lg:mb-[3rem] lg:text-center lg:text-[1.125em]">
            What is a wallet?
          </h2>
          <article className="hidden flex-col place-content-center gap-8 self-center justify-self-center text-[0.875em] lg:flex">
            <div className="grid grid-cols-10 items-center gap-4">
              <div className="col-span-2 h-[3rem] w-[3rem] rounded-[10px] border-[2px] border-solid border-white">
                <Image
                  alt="text"
                  src={
                    "https://media.istockphoto.com/id/1084096262/vector/concept-of-mobile-payments-wallet-connected-with-mobile-phone.jpg?s=612x612&w=0&k=20&c=noILf6rTUyxN41JnmeFhUmqQWiCWoXlg0zCLtcrabD4="
                  }
                  width={100}
                  height={100}
                  className="h-full w-full rounded-[10px] object-cover"
                />
              </div>
              <div className="col-span-8 flex flex-col gap-2">
                <h4 className="text-[1.14em] font-bold">A home for your digital assets</h4>
                <p className="text-text-grey">
                  Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-4">
              <div className="col-span-2 h-[3rem] w-[3rem] rounded-[10px] border-[2px] border-solid border-white">
                <Image
                  alt="text"
                  src={
                    "https://media.istockphoto.com/id/1084096262/vector/concept-of-mobile-payments-wallet-connected-with-mobile-phone.jpg?s=612x612&w=0&k=20&c=noILf6rTUyxN41JnmeFhUmqQWiCWoXlg0zCLtcrabD4="
                  }
                  width={100}
                  height={100}
                  className="h-full w-full rounded-[10px] object-cover"
                />
              </div>
              <div className="col-span-8 flex flex-col gap-2">
                <h4 className="text-[1.14em] font-bold">A new way to sign-in</h4>
                <p className="text-text-grey pb-2">
                  Instead of creating new accounts and passwords on every website, just connect your wallet.
                </p>
              </div>
            </div>
          </article>
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
