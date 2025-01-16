import { NextApiRequest, NextApiResponse } from "next";
import dns from "dns";

const validateEmailSyntax = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const checkDomainExists = (domain: string): Promise<boolean> => {
  return new Promise((resolve) => {
    dns.resolveMx(domain, (error, addresses) => {
      if (error || addresses.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Step 1: Validate the email syntax
    const isValidSyntax = validateEmailSyntax(email);
    if (!isValidSyntax) {
      return res.status(400).json({ isValid: false, reason: "Invalid email syntax" });
    }

    // Step 2: Extract the domain and check if it exists
    const domain = email.split("@")[1];
    const domainExists = await checkDomainExists(domain);

    if (!domainExists) {
      return res.status(400).json({ isValid: false, reason: "Email domain does not exist" });
    }

    res.status(200).json({ isValid: true, reason: "Email is valid" });
  } catch (error) {
    console.error("Error validating email:", error);
    res.status(500).json({ isValid: false, reason: "Server error occurred" });
  }
};

export default handler;
