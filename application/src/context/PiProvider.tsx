import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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

function getPiSDK(): any {
  if (typeof window !== "undefined" && (window as any).Pi) {
    return (window as any).Pi;
  }
  return null;
}

export function PiProvider({ children, sandbox = true }: PiProviderProps) {
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
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      const scopes = ["username", "payments"];
      const pi = getPiSDK();

      const result: PiAuthResult = await new Promise((resolve, reject) => {
        if (pi) {
          pi.authenticate(scopes, (authResult: PiAuthResult) => {
            resolve(authResult);
          }, (error: any) => {
            reject(error);
          });
        } else {
          const devUser: PiAuthResult = {
            accessToken: "dev_token_" + Date.now(),
            user: { uid: "dev_uid", username: "dev_user" },
          };
          setTimeout(() => resolve(devUser), 500);
        }
      });

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
    const pi = getPiSDK();
    if (pi && pi.getBalances) {
      const balances: PiBalance[] = await new Promise((resolve, reject) => {
        pi.getBalances((result: PiBalance[]) => {
          resolve(result);
        }, (error: any) => {
          reject(error);
        });
      });
      setBalance(balances);
      return balances;
    }
    // Dev fallback
    const devBalance: PiBalance[] = [{ amount: 42, chain: "Pi Network" }];
    setBalance(devBalance);
    return devBalance;
  }, []);

  const createPayment = useCallback(async (data: PiPaymentData): Promise<PiPaymentResult> => {
    const pi = getPiSDK();
    if (!pi || !pi.createPayment) {
      return { transactionId: "dev_tx_" + Date.now(), amount: data.amount, memo: data.memo };
    }

    const paymentResult: PiPaymentResult = await new Promise((resolve, reject) => {
      const paymentData = {
        amount: data.amount,
        memo: data.memo,
        metadata: data.metadata,
      };
      pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log("Payment ready for approval:", paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          resolve({ transactionId: txid, amount: data.amount, memo: data.memo });
        },
        onCancel: (paymentId: string) => {
          reject(new Error("Payment cancelled: " + paymentId));
        },
        onError: (error: any, paymentId: string) => {
          reject(error);
        },
      });
    });

    return paymentResult;
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
