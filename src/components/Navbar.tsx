'use client'
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import Logo from "./Logo";
import ConnectButton from "./ConnectButton";
import { useAccount } from "@starknet-react/core";
import AddressBar from "./AddressBar";

const Navbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const {address} = useAccount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        isScrolled
          ? "bg-[#343A40]/80 backdrop-blur-md border-gray-700"
          : "bg-transparent border-gray-500"
      } transition-all duration-300`}
    >
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left Section: Logo and Links */}
        <div className="flex items-center space-x-6 text-white">
          <Link href="/">
            <Logo />
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-500">
              Generate Invoice
            </Link>
            {
              address && (
                <>
                <Link href="/history" className="hover:text-blue-500">
              Transaction History
            </Link>
            <Link href="/profile" className="hover:text-blue-500">
              Account
            </Link>
                </>
              )
            }
          </div>
        </div>

        {/* Right Section: Connect Button and Menu */}
        <div className="flex items-center space-x-2">
          {/* <Button variant="outline" className="bg-[#6C757D] text-white">
            Connect Wallet
          </Button> */}
           {address ? (
              <div className="flex items-center gap-4">
                <AddressBar />
              </div>
            ) : (
              <ConnectButton />
            )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="cursor-pointer">
                <Button variant="ghost" className="bg-[#6C757D] text-white">
                  <MenuIcon size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="top">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4 flex flex-col">
                  <Link href="/" className="hover:text-blue-500">
                    Generate Invoice
                  </Link>
                  <Link href="/history" className="hover:text-blue-500">
                    Transaction History
                  </Link>
                  <Link href="/profile" className="hover:text-blue-500">
                    Account
                  </Link>
                  {address ? (
              <div className="flex items-center gap-4">
                <AddressBar />
              </div>
            ) : (
              <ConnectButton />
            )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
