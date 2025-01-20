const PINATA_BASE_URL = "https://api.pinata.cloud";

export const postJsonToPinata = async (
  jsonObject: Record<string, any>,
  fileName: string
): Promise<string> => {
  const response = await fetch(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY || "",
      pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET || "",
    },
    body: JSON.stringify({
      pinataContent: jsonObject,
      pinataMetadata: {
        name: fileName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload JSON: ${response.statusText}`);
  }

  const result = await response.json();
  return result.IpfsHash;
};


export const getJsonFromPinata = async (cid: string): Promise<Record<string, any>> => {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.statusText}`);
  }

  return response.json();
};
