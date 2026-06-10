const PI_SANDBOX = true;
const PI_SDK_URL = "https://sdk.minepi.com/pi-sdk.js";
let _piInitCalled = false;

function getPi() {
  if (typeof window !== "undefined") return window.Pi || null;
  return null;
}

export function injectPiSDK() {
  if (document.querySelector('script[src="' + PI_SDK_URL + '"]')) return;
  const script = document.createElement("script");
  script.src = PI_SDK_URL;
  script.onload = () => {
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: PI_SANDBOX });
      _piInitCalled = true;
    }
  };
  document.head.appendChild(script);
}

export function initPi() {
  const pi = getPi();
  if (!pi) {
    console.warn("Pi SDK not detected. Running in dev sandbox mode.");
    return false;
  }
  if (!_piInitCalled) {
    pi.init({ version: "2.0", sandbox: PI_SANDBOX });
    _piInitCalled = true;
  }
  return true;
}

export function authenticatePioneer() {
  const scopes = ["payments", "username"];

  if (!getPi()) {
    return Promise.resolve({
      accessToken: "dev_token_" + Date.now(),
      user: { uid: "dev_uid", username: "dev_user" },
    });
  }

  return getPi()
    .authenticate(scopes, onIncompletePaymentFound)
    .then(function (auth) {
      return auth;
    })
    .catch(function (error) {
      console.error("Pi authentication failed:", error);
      throw error;
    });
}

function onIncompletePaymentFound(payment) {
  console.warn("Incomplete payment detected. Syncing with backend...", payment.identifier);

  fetch("/api/payment/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentId: payment.identifier,
      txid: payment.transaction ? payment.transaction.txid : null,
      debug: "cancel",
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log("Incomplete payment resolved:", data))
    .catch((err) => console.error("Failed to sync incomplete payment:", err));
}

export function launchPurchase(amount, memo, gameMetadata) {
  const paymentData = {
    amount: amount,
    memo: memo,
    metadata: gameMetadata || {},
  };

  if (!getPi()) {
    console.log("[Sandbox] Payment created:", paymentData);
    return fetch("/api/payment/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: "dev_payment_" + Date.now() }),
    })
      .then((res) => res.json())
      .then(() => {
        return fetch("/api/payment/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: "dev_payment_" + Date.now(),
            txid: "dev_tx_" + Date.now(),
          }),
        });
      })
      .then((res) => res.json());
  }

  const paymentCallbacks = {
    onReadyForServerApproval: (paymentId) => {
      console.log("Step 8b: Payment created. Requesting server approval for:", paymentId);
      fetch("/api/payment/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      }).catch((err) => console.error("Approval fetch failed:", err));
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      console.log("Step 8d: Transaction signed. Completing:", paymentId);
      fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, txid }),
      }).catch((err) => console.error("Completion fetch failed:", err));
    },
    onCancel: (paymentId) => {
      console.log("Payment canceled by Pioneer:", paymentId);
    },
    onError: (error, payment) => {
      console.error("Payment error:", error, payment);
    },
  };

  getPi().createPayment(paymentData, paymentCallbacks);
}

export function getBalance() {
  const pi = getPi();
  if (pi && pi.getBalances) {
    return new Promise((resolve, reject) => {
      pi.getBalances(
        (result) => resolve(result),
        (error) => reject(error)
      );
    });
  }
  return Promise.resolve([{ amount: 42, chain: "Pi Network" }]);
}
