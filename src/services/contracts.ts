'use client'
import { RpcProvider, Contract, Account, Abi } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useState } from 'react';

const myNodeUrl = 'https://starknet-sepolia.infura.io/v3/7deb84b6f21441949768e183d36321c0';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const ETH_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS || '';
const STRK_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STRK_CONTRACT_ADDRESS || '';
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || '';
const ACCOUNT_ADDRESS = process.env.NEXT_PUBLIC_ACCOUNT_ADDRESS || '';



export const provider = new RpcProvider({ nodeUrl: myNodeUrl });

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

