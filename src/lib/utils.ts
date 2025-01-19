import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSTRKContract } from "@/services/contracts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const decodeUser = (userData: {
  email: bigint;
  username: bigint;
  address: bigint;
  registered_at: bigint;
}) => {
  const decodeBigIntToString = (bigIntValue: bigint): string => {
    const hex = bigIntValue?.toString(16);
    let str = '';
    for (let i = 0; i < hex?.length; i += 2) {
      const charCode = parseInt(hex?.slice(i, i + 2), 16);
      if (charCode) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  };

  return {
    email: decodeBigIntToString(userData?.email),
    username: decodeBigIntToString(userData?.username),
    address: `0x${userData?.address?.toString(16)}`,
    registeredAt: userData?.registered_at
      ? new Date(Number(userData?.registered_at) * 1000).toISOString()
      : "N/A",
  };
};

export const decodeInvoices = (invoices: any[]) => {
  return invoices?.map((invoice) => ({
    invoiceId: decodeBigIntToString(invoice.invoice_id),
    creator: decodeBigIntToHex(invoice.creator),
    recipientEmail: decodeBigIntToString(invoice.recipient_mail),
    amount: invoice.amount.toString(),
    description: decodeBigIntToString(invoice.description),
    currency: decodeCurrency(invoice.currency),
    dueDate: decodeUnixTimestamp(invoice.due_date),
    generatedAt: decodeUnixTimestamp(invoice.generated_at),
    status: decodeStatus(invoice.invoice_status),
    privacy: decodePrivacy(invoice.privacy),
  }));
};


export const decodeBigIntToHex = (value: bigint) => {
  return `0x${value.toString(16)}`;
};

export const decodeBigIntToString = (value: bigint) => {
  return Buffer.from(value.toString(16), "hex").toString("utf8");
};

export const decodeUnixTimestamp = (value: bigint) => {
  const timestamp = Number(value);
  return new Date(timestamp * 1000).toLocaleString();
};

const decodeCurrency = (currencyBigInt: bigint): string => {
  const hexString = currencyBigInt.toString(16);
  const text = Buffer.from(hexString, 'hex').toString('utf-8');
  return text.trim();
};

export const decodeStatus = (bigIntValue: bigint): string => {
  if (!bigIntValue) return "";

  const hex = bigIntValue.toString(16);

  let decodedString = "";

  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.slice(i, i + 2), 16);
    if (charCode) {
      decodedString += String.fromCharCode(charCode);
    }
  }

  return decodedString;
};

export const decodePrivacy = (value: bigint) => {
  const privacyMap: Record<string, string> = {
    "88327114737987": "PUBLIC",
    "88327114737988": "PRIVATE",
  };
  return privacyMap[value.toString()] || "UNKNOWN";
};




