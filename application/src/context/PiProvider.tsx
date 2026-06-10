import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { initPi, authenticatePioneer, launchPurchase, getBalance as getPiBalance } from "../piBridge";

interface PiUser {
  uid: string;
  username: string;
}

interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

interface PiBalance {
  amount: number;
  chain: string;
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, string>;
}

interface PiPaymentResult {
  transactionId: string;
  amount: number;
  memo: string;
}

interface PiContextType {
  user: PiUser | null;
  accessToken: string | null;
  loading: boolean;
  authenticated: boolean;
  balance: PiBalance[];
  signIn: () => Promise<void>;
  signOut: () => void;
  checkBalance: () => Promise<PiBalance[]>;
  createPayment: (data: PiPaymentData) => Promise<PiPaymentResult>;
}

const PiContext = createContext<PiContextType>({
  user: null,
  accessToken: null,
  loading: false,
  authenticated: false,
  balance: [],
  signIn: async () => {},
  signOut: () => {},
  checkBalance: async () => [],
  createPayment: async () => ({ transactionId: "", amount: 0, memo: "" }),
});

interface PiProviderProps {
  children: ReactNode;
  sandbox?: boolean;
}

export function PiProvider({ children }: PiProviderProps) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<PiBalance[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("pi_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setUser(session.user);
        setAccessToken(session.accessToken);
      } catch {
        localStorage.removeItem("pi_session");
      }
    }
    initPi();
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      const result: PiAuthResult = await authenticatePioneer();
      setUser(result.user);
      setAccessToken(result.accessToken);
      localStorage.setItem("pi_session", JSON.stringify(result));
    } catch (err) {
      console.error("Pi authentication failed:", err);
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setBalance([]);
    localStorage.removeItem("pi_session");
  }, []);

  const checkBalance = useCallback(async (): Promise<PiBalance[]> => {
    const balances: PiBalance[] = await getPiBalance();
    setBalance(balances);
    return balances;
  }, []);

  const createPayment = useCallback(async (data: PiPaymentData): Promise<PiPaymentResult> => {
    return new Promise((resolve, reject) => {
      launchPurchase(data.amount, data.memo, data.metadata);
      resolve({ transactionId: "tx_" + Date.now(), amount: data.amount, memo: data.memo });
    });
  }, []);

  return (
    <PiContext.Provider
      value={{
        user,
        accessToken,
        loading,
        authenticated: !!user,
        balance,
        signIn,
        signOut,
        checkBalance,
        createPayment,
      }}
    >
      {children}
    </PiContext.Provider>
  );
}

export function usePi(): PiContextType {
  return useContext(PiContext);
}
