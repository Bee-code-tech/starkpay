import { Abi } from "starknet";


const feltToString = (hex: string): string => {
  if (!hex || typeof hex !== "string") return "";
  const hexStr = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Buffer.from(hexStr, "hex").toString("utf8").replace(/\0/g, "");
};


const feltToNumber = (hex: string): string => {
  if (!hex || typeof hex !== "string") return "0";
  return BigInt(hex).toString();
};



export interface Uint256 {
  low: string;
  high: string;
}

const uint256ToDecimal = (uint256: Uint256): string => {
  const low = BigInt(uint256.low);
  const high = BigInt(uint256.high);
  return ((high << BigInt(128)) + low).toString();
};


const unixTimestampToDate = (timestamp: string): string => {
  const date = new Date(Number(BigInt(timestamp)) * 1000);
  return date.toISOString();
};

export const decodeContractResponse = (
  response: any[],
  abi: Abi,
  functionName: string
): Record<string, any> => {
  const functionAbi = abi.find((item) => item.type === "function" && item.name === functionName);

  if (!functionAbi || !Array.isArray(functionAbi.outputs)) {
    throw new Error(`Function "${functionName}" not found in ABI.`);
  }

  const decoded: Record<string, any> = {};
functionAbi.outputs.forEach((output: { name?: string; type: string }, index: number) => {
    const fieldName: string = output.name || `field_${index}`;
    const fieldType: string = output.type;

    if (fieldType === "core::felt252" || fieldType === "felt252") {
        decoded[fieldName] = feltToString(response[index]);
    } else if (fieldType === "core::integer::u64" || fieldType === "u64") {
        decoded[fieldName] = unixTimestampToDate(response[index]);
    } else if (fieldType.startsWith("core::array")) {
        decoded[fieldName] = response[index]; // Handle arrays as raw data
    } else if (fieldType.startsWith("core::starknet::contract_address")) {
        decoded[fieldName] = response[index];
    } else {
        decoded[fieldName] = response[index]; // Default fallback
    }
});

  return decoded;
};
