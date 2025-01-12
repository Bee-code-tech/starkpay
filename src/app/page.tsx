"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// import { DatePicker } from "@/components/ui/date-picker";
import { FaEthereum } from "react-icons/fa";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import StarkIcon from "@/components/icons/StarkIcon";

const Home = () => {
  const [network, setNetwork] = useState("starknet");
  const [coin, setCoin] = useState("ETH");
  const [conversionRate] = useState("≈ @$33,990");
  const [privateMode, setPrivateMode] = useState(false);
   const [date, setDate] = React.useState<Date>() 

  return (
    <div className="max-w-lg mx-auto p-6 mt-12">
      <div className="rounded-2xl bg-[#212529] p-6 text-white border-neutral-500 border">
        <h2 className="text-xl font-bold mb-4">Generate Invoice</h2>

         <p className="text-md font-bold mb-1">Amount</p>
        <div className="rounded-lg bg-neutral-700 p-4 mb-6">
          <div className="flex justify-start items-center mb-4">
            <Select
              value={network}
              onValueChange={(value) => setNetwork(value)}
            >
              <SelectTrigger className="w-32">
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
              className="flex-1 border-b-2 border-transparent bg-none text-white text-2xl font-bold focus:border-b-white focus:outline-none"
            />


            {/* Coin Dropdown */}
            <Select value={coin} onValueChange={(value) => setCoin(value)}>
              <SelectTrigger className="w-[87px] rounded-full">
                <div className="flex items-center gap-1 ">
                  <FaEthereum />
                   <SelectValue placeholder="Select Coin">{coin}</SelectValue>
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
          <p className="text-sm text-neutral-400 -mt-4 mb-4">
            {coin} {conversionRate}
          </p>

        <div className="flex flex-col w-full mb-4">
        <p className="text-lg font-bold mb-1">Payer Email</p>
          <Input
          placeholder="Enter recipient's email"
          className="w-full mb-4 bg-neutral-700 text-md text-white py-5"
        />
        </div>

        <div className="flex flex-col w-full mb-4">
        <p className="text-lg font-bold mb-1">Description</p>
          <Textarea
          placeholder="Add a description"
          className="w-full mb-4 bg-neutral-700 text-white"
        />
        </div>



        <div className="flex w-full  mb-6 flex-col">
          <p className="text-lg font-bold mb-1">Due Date(Optional)</p>
          <Popover  >
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

       


        {/* Private Mode Box */}
        <div className="rounded-lg bg-neutral-700 p-4 mb-6 flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Private Mode</h3>
            <p className="text-sm text-neutral-400">
              Invoice created will only be seen and accessible by only you and payer
            </p>
          </div>
          <Switch checked={privateMode} onCheckedChange={setPrivateMode} />
        </div>

        {/* Invoice Summary */}
        <div className="rounded-lg border border-blue-500 p-4">
          <h3 className="text-lg font-semibold mb-2">Invoice Summary</h3>
          <p className="text-sm text-neutral-400 mb-1">Network: {network}</p>
          <p className="text-sm text-neutral-400 mb-1">Coin: {coin}</p>
          <p className="text-sm text-neutral-400 mb-1">
            Conversion Rate: {coin} {conversionRate}
          </p>
          <p className="text-sm text-neutral-400 mb-1">
            Recipient Email: (filled email here)
          </p>
          <p className="text-sm text-neutral-400">
            Private Mode: {privateMode ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
