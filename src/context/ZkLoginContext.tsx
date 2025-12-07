// src/contexts/ZkLoginContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  genAddressSeed,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { toSerializedSignature } from "@mysten/sui/cryptography";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

interface ZkLoginState {
  ephemeralPublicKey: string;
  ephemeralPrivateKey: number[];
  randomness: string;
  maxEpoch: number;
  status: "Awaiting JWT" | "Authenticated";
  suiAddress?: string;
  zkProof?: {
    proofPoints: any;
    issBase64Details: any;
    headerBase64: any;
  };
  jwt?: string;
}

interface ZkLoginContextType {
  isAuthenticated: boolean;
  address: string | null;
  currentEpoch: number | null;
  isExpired: boolean;
  signAndExecuteTransaction: (transaction: Transaction) => Promise<any>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const ZkLoginContext = createContext<ZkLoginContextType | undefined>(undefined);

export function ZkLoginProvider({ children }: { children: ReactNode }) {
  const [zkLoginState, setZkLoginState] = useState<ZkLoginState | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [suiClient] = useState(
    () => new SuiClient({ url: getFullnodeUrl("testnet") })
  );

  // Load zkLogin state from session storage
  useEffect(() => {
    const loadState = () => {
      const storedState = sessionStorage.getItem("zkLoginState");
      const storedAddress = localStorage.getItem("zklogin_address");

      if (storedState) {
        const parsed = JSON.parse(storedState);
        setZkLoginState(parsed);
      }

      if (storedAddress) {
        setAddress(storedAddress);
      }
    };

    loadState();
  }, []);

  // Monitor current epoch
  useEffect(() => {
    const fetchEpoch = async () => {
      try {
        const { epoch } = await suiClient.getLatestSuiSystemState();
        setCurrentEpoch(Number(epoch));
      } catch (error) {
        console.error("Failed to fetch epoch:", error);
      }
    };

    fetchEpoch();

    // Update epoch every 30 seconds
    const interval = setInterval(fetchEpoch, 30000);
    return () => clearInterval(interval);
  }, [suiClient]);

  const isAuthenticated = !!(
    zkLoginState?.status === "Authenticated" && address
  );
  const isExpired = !!(
    currentEpoch &&
    zkLoginState?.maxEpoch &&
    currentEpoch >= zkLoginState.maxEpoch
  );

  const signAndExecuteTransaction = async (
    transaction: Transaction
  ): Promise<any> => {
    if (!zkLoginState || zkLoginState.status !== "Authenticated") {
      throw new Error("Not authenticated with zkLogin");
    }

    if (isExpired) {
      throw new Error("zkLogin session expired. Please log in again.");
    }

    if (
      !zkLoginState.suiAddress ||
      !zkLoginState.zkProof ||
      !zkLoginState.jwt
    ) {
      throw new Error("Incomplete zkLogin state");
    }

    try {
      // Set the transaction sender
      transaction.setSender(zkLoginState.suiAddress);

      // Reconstruct the ephemeral keypair from stored private key
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
        Uint8Array.from(zkLoginState.ephemeralPrivateKey)
      );

      // Sign the transaction with ephemeral key
      const { bytes, signature: userSignature } = await transaction.sign({
        client: suiClient,
        signer: ephemeralKeyPair,
      });

      // Decode JWT to get claims
      const jwtPayload = decodeJwt(zkLoginState.jwt);

      // Generate address seed
      const addressSeed = genAddressSeed(
        BigInt(zkLoginState.randomness),
        "sub",
        jwtPayload.sub,
        jwtPayload.aud as string
      ).toString();

      // Assemble zkLogin signature
      const zkLoginSignature = getZkLoginSignature({
        inputs: {
          ...zkLoginState.zkProof,
          addressSeed,
        },
        maxEpoch: zkLoginState.maxEpoch,
        userSignature,
      });

      // Execute transaction
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return result;
    } catch (error) {
      console.error("Transaction execution failed:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    if (!zkLoginState?.jwt) {
      throw new Error("No JWT available for refresh");
    }

    try {
      // Generate new ephemeral keypair
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const newMaxEpoch = Number(epoch) + 2;

      const newKeypair = new Ed25519Keypair();
      const randomness = zkLoginState.randomness; // Keep same randomness

      // Request new ZK proof
      const response = await fetch("/api/zklogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwt: zkLoginState.jwt,
          ephemeralPublicKey: newKeypair.getPublicKey().toBase64(),
          maxEpoch: newMaxEpoch,
          randomness: randomness,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh session");
      }

      const data = await response.json();

      // Convert secret key to number[] (bytes). Some key implementations return a base64 string,
      // while others return a Uint8Array; handle both cases.
      const secretKeyRaw = newKeypair.getSecretKey();
      const ephemeralPrivateKeyBytes =
        typeof secretKeyRaw === "string"
          ? Array.from(atob(secretKeyRaw)).map((c) => c.charCodeAt(0))
          : Array.from(secretKeyRaw);

      const newState: ZkLoginState = {
        ...zkLoginState,
        ephemeralPrivateKey: ephemeralPrivateKeyBytes as number[],
        ephemeralPublicKey: newKeypair.getPublicKey().toBase64(),
        maxEpoch: newMaxEpoch,
        zkProof: data.zkProof,
      };

      sessionStorage.setItem("zkLoginState", JSON.stringify(newState));
      setZkLoginState(newState);
    } catch (error) {
      console.error("Session refresh failed:", error);
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("zkLoginState");
    localStorage.removeItem("auth_method");
    localStorage.removeItem("zklogin_address");
    localStorage.removeItem("sui_session");
    setZkLoginState(null);
    setAddress(null);
  };

  return (
    <ZkLoginContext.Provider
      value={{
        isAuthenticated,
        address,
        currentEpoch,
        isExpired,
        signAndExecuteTransaction,
        logout,
        refreshSession,
      }}
    >
      {children}
    </ZkLoginContext.Provider>
  );
}

export function useZkLogin() {
  const context = useContext(ZkLoginContext);
  if (context === undefined) {
    throw new Error("useZkLogin must be used within a ZkLoginProvider");
  }
  return context;
}

// Helper function to decode JWT
function decodeJwt(jwt: string): any {
  const base64Url = jwt.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}
