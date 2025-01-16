import { RpcProvider, Contract, Account, Abi } from "starknet";
import { useAccount } from "@starknet-react/core";



const myNodeUrl = 'https://starknet-sepolia.infura.io/v3/7deb84b6f21441949768e183d36321c0';

const provider = new RpcProvider({
  nodeUrl: myNodeUrl,
});


const CONTRACT_ADDRESS = "0x0656a4f76d28aed8bc1543e3a06017d045e41556fc52803e7e2e3ede067e0549";

export const getContract = async (): Promise<Contract> => {
  try {
    const { abi } = await provider.getClassAt(CONTRACT_ADDRESS);
    if (!abi) throw new Error("No ABI found for the contract.");
    return new Contract(abi, CONTRACT_ADDRESS, provider);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize contract at ${CONTRACT_ADDRESS}: ${error.message}`);
    } else {
      throw new Error(`Failed to initialize contract at ${CONTRACT_ADDRESS}: Unknown error`);
    }
  }
};


export const readContract = async (
  method: string,
  args: any[] = []
) => {
  try {
    const contract = await getContract();
    const result = await contract.call(method, args);
    
    return { data: result, error: null };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading contract: ${error.message}`);
    } else {
      console.error(`Error reading contract: ${String(error)}`);
    }
    return { data: null, error };
  }
};

export const useWriteContract = () => {
    const { account } = useAccount();

  const writeContract = async (method: string, args: any[] = []) => {
    try {
      if (!account) {
        throw new Error("No wallet connected.");
      }

      const contract = await getContract();

      const contractWithSigner = new Contract(contract.abi as Abi, CONTRACT_ADDRESS, account);

      const response = await contractWithSigner.invoke(method, args);
      await provider.waitForTransaction(response.transaction_hash);

      return { transactionHash: response.transaction_hash, error: null };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error writing to contract: ${error.message}`);
      } else {
        console.error(`Error writing to contract: ${String(error)}`);
      }
      return { transactionHash: null, error };
    }
  };

  return { writeContract };
};
