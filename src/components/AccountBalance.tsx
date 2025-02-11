import { useContractRead } from "@starknet-react/core";


type Props = {
  address: string;
  heading?: boolean;
};

function AccountBalance({ address, heading = true }: Props) {
//   const { data: eth, isLoading: ethLoading } = useContractRead({
//     address: ETH_SEPOLIA,
//     abi: Erc20Abi,
//     functionName: "balanceOf",
//     args: [address!],
//     watch: true,
//   });

//   const { data: strk, isLoading: strkLoading } = useContractRead({
//     address: STRK_SEPOLIA,
//     abi: Erc20Abi,
//     functionName: "balanceOf",
//     args: [address!],
//     watch: true,
//   });

  // @ts-ignore
//   const ethBalance = formatCurrency(eth?.balance.low.toString());
  // @ts-ignore
//   const strkBalance = formatCurrency(strk?.balance?.low.toString());

  return (
    <div className="p-4 text-sm">
      {heading && <h3 className="mb-4 text-md">Assets</h3>}

      <div className="flex flex-col gap-4 text-[--headings]">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full md:h-12 md:w-12">
              <img className="w-full" src="/assets/eth.svg" alt="" />
            </div>
            <div>
              <p className="mb-2 text-md">ETH</p>
              <p>Ethereum</p>
            </div>
          </div>
          <div className="mr-4 flex items-center">
            <p className="">p</p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full md:h-12 md:w-12">
              <img className="w-full" src="/assets/strk.svg" alt="" />
            </div>
            <div>
              <p className="mb-2 text-md">STRK</p>
              <p>Starknet token</p>
            </div>
          </div>
          <div className="mr-4 flex items-center">
            <p className="">000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountBalance;
