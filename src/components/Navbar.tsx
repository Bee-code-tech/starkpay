
import { FC } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import Logo from "./Logo";

const Navbar: FC = () => {
  return (
    <header className="w-full bg-[#343A40] border-b border-gray-500 ">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left Section: Logo and Links */}
        <div className="flex items-center space-x-6 text-white">
          <Link href="/" >
                 <Logo />
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/invoice" className="hover:text-blue-500">
              Generate Invoice
            </Link>
            <Link href="/history" className="hover:text-blue-500">
              Transaction History
            </Link>
            <Link href="/profile" className="hover:text-blue-500">
              Account
            </Link>
          </div>
        </div>

        {/* Right Section: Connect Button and Ellipsis */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-[#6C757D] text-white">Connect Wallet</Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="cursor-pointer">
                <Button variant="ghost" className="bg-[#6C757D] text-white">
                                  <MenuIcon size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>
                                      <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  <Link href="/" className="block text-lg hover:text-blue-500">
                    Home
                  </Link>
                  <Link href="/about" className="block text-lg hover:text-blue-500">
                    About
                  </Link>
                  <Link href="/contact" className="block text-lg hover:text-blue-500">
                    Contact
                  </Link>
                  <Button variant="outline" className="mt-4 w-full bg-[#6C757D] text-white">
                    Connect Wallet
                  </Button>
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
