'use client'
import { RpcProvider, Contract, Account, Abi } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useState } from 'react';

const myNodeUrl = 'https://starknet-sepolia.infura.io/v3/7deb84b6f21441949768e183d36321c0';
const CONTRACT_ADDRESS = "0x00ad671719dd9c4f094c8efccecc3794ae0bd81c6a9ff2560cd02748ab492f0d";
const ETH_CONTRACT_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const STRK_CONTRACT_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'
const PRIVATE_KEY = "0x0111cf424c8f1615a65f4e4d9ae2d3f1ed97a9931cf2fb9f04274538ad7b404f";
const ACCOUNT_ADDRESS = "0x070fdef0b89b2f4c5a2dec9641285b0f69ee36ead6c7099d629edf34afef5ec9";

export const provider = new RpcProvider({
  nodeUrl: myNodeUrl,
});

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

export const getETHContract = async (): Promise<Contract> => {
  try {
    const { abi } = await provider.getClassAt(ETH_CONTRACT_ADDRESS);
    if (!abi) throw new Error("No ABI found for the contract.");
    return new Contract(abi, ETH_CONTRACT_ADDRESS, provider);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize contract at ${ETH_CONTRACT_ADDRESS}: ${error.message}`);
    } else {
      throw new Error(`Failed to initialize contract at ${ETH_CONTRACT_ADDRESS}: Unknown error`);
    }
  }
};

export const getSTRKContract = async (): Promise<Contract> => {
  try {
    const { abi } = await provider.getClassAt(STRK_CONTRACT_ADDRESS);
    if (!abi) throw new Error("No ABI found for the contract.");
    return new Contract(abi, STRK_CONTRACT_ADDRESS, provider);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize contract at ${STRK_CONTRACT_ADDRESS}: ${error.message}`);
    } else {
      throw new Error(`Failed to initialize contract at ${STRK_CONTRACT_ADDRESS}: Unknown error`);
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

export const readETHBalance = async (
  method: string,
  args: any[] = []
) => {
  try {
    const contract = await getETHContract();
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

export const readSTRKBalance = async (
  method: string,
  args: any[] = []
) => {
  try {
    const contract = await getSTRKContract();
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
  const [loading, setLoading] =useState(false);

  const writeContract = async (method: string, args: any[] = []) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return { writeContract, loading };
};

export const usePaySTRK = () => {
  const { account } = useAccount();
  const [loading, setLoading] = useState(false);
  
  const getProgrammaticAccount = async () => {
    return new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
  };

  const programmaticConfirmPayment = async (
    method: string,
    args: any[] = []
  ) => {
    try {
      const contract = await getContract();
      const account = await getProgrammaticAccount();
      const contractWithSigner = new Contract(
        contract.abi as Abi,
        CONTRACT_ADDRESS,
        account
      );

      const response = await contractWithSigner.invoke(method, args);
      await provider.waitForTransaction(response.transaction_hash);
      console.log("Confirm payment transaction hash:", response.transaction_hash);

      return { transactionHash: response.transaction_hash, error: null };
    } catch (error) {
      console.error("Error in programmatic confirm payment:", error);
      return { transactionHash: null, error };
    }
  };

  const paySTRK = async (
    method: string,
    args: any[] = [],
    confirmMethod: string,
    confirmArgs: any[] = []
  ) => {
    setLoading(true);

    try {
      if (!account) {
        throw new Error("No wallet connected.");
      }
       const contract = await getSTRKContract();
      const contractWithSigner = new Contract(
        contract.abi as Abi,
        STRK_CONTRACT_ADDRESS,
        account
      );
      const response = await contractWithSigner.invoke(method, args);
      await provider.waitForTransaction(response.transaction_hash);

      console.log("paySTRK transaction hash:", response.transaction_hash);

      const confirmPaymentResponse = await programmaticConfirmPayment(
        confirmMethod,
        confirmArgs
      );

      if (confirmPaymentResponse.error) {
        throw new Error("Programmatic confirm_payment failed", confirmPaymentResponse.error);
      }

      console.log("Programmatic confirm_payment succeeded.");
      return { transactionHash: response.transaction_hash, error: null };
    } catch (error) {
      console.error("Error in paySTRK:", error);
      return { transactionHash: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { paySTRK, loading };
};

export const usePayETH = () => {
  const { account } = useAccount();
  const [loading, setLoading] = useState(false);
  
  const getProgrammaticAccount = async () => {
    return new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
  };

  const programmaticConfirmPayment = async (
    method: string,
    args: any[] = []
  ) => {
    try {
      const contract = await getContract();
      const account = await getProgrammaticAccount();
      const contractWithSigner = new Contract(
        contract.abi as Abi,
        CONTRACT_ADDRESS,
        account
      );

      const response = await contractWithSigner.invoke(method, args);
      await provider.waitForTransaction(response.transaction_hash);
      console.log("Confirm payment transaction hash:", response.transaction_hash);

      return { transactionHash: response.transaction_hash, error: null };
    } catch (error) {
      console.error("Error in programmatic confirm payment:", error);
      return { transactionHash: null, error };
    }
  };

  const payETH = async (
    method: string,
    args: any[] = [],
    confirmMethod: string,
    confirmArgs: any[] = []
  ) => {
    setLoading(true);

    try {
      if (!account) {
        throw new Error("No wallet connected.");
      }
       const contract = await getETHContract();
      const contractWithSigner = new Contract(
        contract.abi as Abi,
        ETH_CONTRACT_ADDRESS,
        account
      );
      const response = await contractWithSigner.invoke(method, args);
      await provider.waitForTransaction(response.transaction_hash);

      console.log("payETH transaction hash:", response.transaction_hash);

      const confirmPaymentResponse = await programmaticConfirmPayment(
        confirmMethod,
        confirmArgs
      );

      if (confirmPaymentResponse.error) {
        throw new Error("Programmatic confirm_payment failed", confirmPaymentResponse.error);
      }

      console.log("Programmatic confirm_payment succeeded.");
      return { transactionHash: response.transaction_hash, error: null };
    } catch (error) {
      console.error("Error in paySTRK:", error);
      return { transactionHash: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { payETH, loading };
};

