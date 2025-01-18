"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn, decodeUser } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import StarkIcon from "@/components/icons/StarkIcon";
import { FaEthereum } from "react-icons/fa";
import MaxIcon from "@/components/icons/MaxIcon";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import Navbar from "@/components/Navbar";
import { useAccount } from "@starknet-react/core";
import { DialogComponent } from "@/components/modals/DialogComponent";
import { readContract, useWriteContract } from "@/services/contracts";
import { useRouter } from "next/navigation";
import { GeneratedInvoiceModal } from "@/components/modals/GeneratedInvoiceModal";
import QRCode from "qrcode";
import StarkpayLoader from "@/components/StarkpayLoader";
import toast from "react-hot-toast";

const Home = () => {
  const [network, setNetwork] = useState<"starknet" | "ethereum">("starknet");
  const [coin, setCoin] = useState<"ETH" | "SOL" | "STRK" | "USDC">("ETH");
  const [amount, setAmount] = useState<number>(0);
  const [privateMode, setPrivateMode] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { address } = useAccount();
  const [data, setData] = useState<any>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  const [invoiceUrl, setInvoiceUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [generate, setGenerate] = useState(false)
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [exist, setExist] = useState(false)

  const generateUniqueId = (): string => {
    const timestamp = Date.now().toString(36).slice(-4);
    const randomString = Math.random().toString(36).substring(2, 3).toUpperCase();
  return `STK-${timestamp}${randomString}`;
  };
  
  const validateEmail = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      setValidationMessage("Invalid email format.");
      return;
    }

    try {
      const response = await fetch(`/api/verify-email?email=${email}`);
      const result = await response.json();

      if (result.isValid) {
        setIsEmailValid(true);
        setValidationMessage("Email is verified.");
      } else {
        setIsEmailValid(false);
        setValidationMessage("Email does not exist.");
      }
    } catch (error) {
      console.error("Email validation error:", error);
      setIsEmailValid(false);
      setValidationMessage("Failed to validate email.");
    }
  };

   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);

    if (inputEmail) {
      validateEmail(inputEmail);
    } else {
      setIsEmailValid(null);
      setValidationMessage("");
    }
  };
  
  const invoiceId = generateUniqueId();


   const generateQRCode = async (url: string) => {
    try {
      const qrCode = await QRCode.toDataURL(url, { errorCorrectionLevel: "H" });
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Failed to generate QR Code:", error);
    }
  };
  
   useEffect(() => {
   if (address) {
     const fetchData = async () => {
      const { data, error } = await readContract("is_exist", [address]);
       if (data) {
         setExist(true)
       } 
     };
     const fetchUser = async () => {
      const { data, error } = await readContract("get_user", [address]);
       if (
        typeof data === "object" &&
        data !== null &&
        "email" in data &&
        "username" in data &&
        "address" in data &&
        "registered_at" in data &&
        typeof data.email === "bigint" &&
        typeof data.username === "bigint" &&
        typeof data.address === "bigint" &&
        typeof data.registered_at === "bigint"
      ) {
        const formattedData = decodeUser(data as {
          email: bigint;
          username: bigint;
          address: bigint;
          registered_at: bigint;
        });
         setData(formattedData)
        console.log("Decoded user data:", formattedData);
      } else {
        console.error("Invalid data structure:", data);
      }
     };
     
    fetchUser()
    fetchData();
   }
     
   }, [address]);
  
  console.log('is exsi', exist);
  console.log('data', data);
  
  


  
  

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      setDialogOpen(true);
    } else {
      setPrivateMode(false);
    }
  };

  const confirmPrivateMode = () => {
    setPrivateMode(true);
    setDialogOpen(false);
  };

  const cancelPrivateMode = () => {
    setDialogOpen(false);
  };

  const closeInvoice = () => {
    setInvoiceOpen(false);
  };

 const handleSubmit = async () => {
  if (!exist) {
    router.push("/profile");
    return;
  } 
   

  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3001"
        : "https://starkpay.vercel.app";

        const constructedUrl = `${baseUrl}/invoice?payee=${address}&amount=${amount}&currency=${coin}&private=${privateMode}`;
        setInvoiceUrl(constructedUrl);

        generateQRCode(constructedUrl);

        setLoading(true);

  
    const { transactionHash, error } = await writeContract("create_invoice", [
      invoiceId,
      amount,
      coin,
      description,
      email,
      date ? Math.floor(date.getTime() / 1000) : 0,
    ]);

    if (error) {
      throw new Error("Failed to generate invoice");
    }

    console.log("Transaction Hash:", transactionHash);
    toast.success('Invoice Generated Successfully')

     fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Payment Request from Starkpay",
        template: "payment",
        variables: {
          username: data?.username,
          amount: amount,
          coin,
          transactionLink: constructedUrl,
        },
      }),
    });

    setGenerate(true);
  } catch (err) {
    console.error("Error generating invoice:", err);
    setError("Failed to generate invoice. Please try again.");
  } finally {
    setLoading(false);
  }
};



  return (
    <section>
      
      <Navbar />
      {loading && <StarkpayLoader />}
      <div className="max-w-lg mx-auto px-2 mt-8 mb-12">
        <div className="rounded-2xl bg-[#212529] p-4 text-white border-neutral-500 border">
          <h2 className="text-xl font-bold mb-4">Generate Invoice</h2>

          {/* Amount Section */}
          <p className="text-md font-bold mb-1">Amount</p>
          <div className="rounded-lg bg-neutral-700 p-4 mb-6">
            <div className="flex justify-start items-center mb-4">
              <Select
                value={network}
                onValueChange={(value) =>
                  setNetwork(value as "starknet" | "ethereum")
                }
              >
                <SelectTrigger className="w-32 rounded-full">
                  <SelectValue placeholder="Select Network">
                    <div className="flex items-center gap-2">
                      <StarkIcon />
                      {network === "starknet" ? "StarkNet" : "Ethereum"}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starknet">
                    <div className="flex items-center gap-2">
                      <StarkIcon />
                      StarkNet
                    </div>
                  </SelectItem>
                  <SelectItem value="ethereum">
                    <div className="flex items-center gap-2">
                      <FaEthereum />
                      Ethereum
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <Input
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 border-b-2 border-transparent bg-none text-white text-2xl font-bold focus:border-b-white focus:outline-none"
              />
              <Select
                value={coin}
                onValueChange={(value) =>
                  setCoin(value as "ETH" | "SOL" | "STRK" | "USDC")
                }
              >
                <SelectTrigger className="w-[87px] rounded-full">
                  <SelectValue placeholder="Select Coin">{coin}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="STRK">STRK</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Other Inputs */}
          <div className="flex flex-col w-full mb-4">
            <p className="text-lg font-bold mb-1">Payer Email</p>
            <Input
              placeholder="Enter recipient's email"
              value={email}
              onChange={handleEmailChange}
              className="w-full mb-4 bg-neutral-700 text-md text-white py-5"
            />
              {isEmailValid === true && (
                <div className="flex items-center text-green-500 text-sm ">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>{validationMessage}</span>
                </div>
              )}
              {isEmailValid === false && (
                <div className="flex items-center text-red-500 text-sm ">
                  <XCircle className="w-3 h-3 mr-1" />
                  <span>{validationMessage}</span>
                </div>
              )}
          </div>

          <div className="flex flex-col w-full mb-4">
            <p className="text-lg font-bold mb-1">Description</p>
            <Input
              placeholder="Add a description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-4 bg-neutral-700 text-white text-xl"
            />
          </div>

          <div className="flex w-full mb-6 flex-col">
            <p className="text-lg font-bold mb-1">Due Date (Optional)</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "bg-neutral-700 w-full justify-start text-left font-normal py-5",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Private Mode Section */}
          <div className="rounded-lg bg-neutral-700 p-4 mb-6 flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">Private Mode</h3>
              <p className="text-sm text-neutral-400">
                Invoice created will only be seen and accessible by only you and
                the payer
              </p>
            </div>
            <Switch checked={privateMode} onCheckedChange={handleSwitchChange} />
          </div>

          {/* Invoice Summary Section */}
          <div className="rounded-lg border border-blue-500 p-4 mt-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
              <div onClick={() => setInvoiceOpen(true)}>
                <MaxIcon className="cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Network:</p>
              <p className="text-sm text-neutral-300">{network}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Coin:</p>
              <p className="text-sm text-neutral-300">{coin}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Amount:</p>
              <p className="text-sm text-neutral-300">$ {amount}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Recipient Email:</p>
              <p className="text-sm text-neutral-300">
                {email || "(not provided)"}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Description:</p>
              <p className="text-sm text-neutral-300 break-words whitespace-normal">
                {description || "(not provided)"}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-neutral-400">Due Date:</p>
              <p className="text-sm text-neutral-300">
                {date ? format(date, "PPP") : "Not set"}
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-neutral-400">Private Mode:</p>
              <p className="text-sm text-neutral-300">
                {privateMode ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          <Button
            className="w-full mt-6 bg-blue-600 text-white rounded-md py-5"
            onClick={handleSubmit}
            disabled={!address}
          >
            Generate Invoice
          </Button>

          <DialogComponent
            open={dialogOpen}
            title="Private Mode"
            onConfirm={confirmPrivateMode}
            onCancel={cancelPrivateMode}
            onOpenChange={setDialogOpen}
          />
          <InvoiceModal
            open={invoiceOpen}
            id={invoiceId}
            mode={privateMode}
            amount={amount}
            email={email}
            description={description}
            date={date ? format(date, "PPP") : "Not set"}
            onConfirm={closeInvoice}
          />
          <GeneratedInvoiceModal
            qrcode={qrCodeUrl}
            amount={amount}
            coin={coin}
            open={generate}
            url={invoiceUrl}
            onOpenChange={setGenerate}
          />
           
        </div>
      </div>
    </section>
  );
};

export default Home;
