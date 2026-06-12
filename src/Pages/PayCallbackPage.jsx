import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2Icon, XCircleIcon, Loader2Icon, HomeIcon, ArrowRightIcon } from "lucide-react";
import { transactionsApi } from "../API/apiClient";

const fmt = (n, currency = "NGN") =>
  `${currency} ${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PayCallbackPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState("loading"); // loading | success | failed | error
  const [transaction, setTransaction] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const reference   = params.get("reference") || params.get("trxref") || params.get("tx_ref");
  const gatewayHint = params.get("gateway");
  const statusHint  = params.get("status");

  useEffect(() => {
    if (!reference) {
      setState("error");
      setErrorMsg("No transaction reference found in URL.");
      return;
    }

    // If gateway redirected with an explicit failed status, skip verify
    if (statusHint === "cancelled" || statusHint === "failed") {
      setState("failed");
      return;
    }

    async function verify() {
      try {
        // Find transaction by reference, then verify with provider
        const tx = await transactionsApi.getByReference(reference);
        if (!tx) throw new Error("Transaction not found");
        const verified = await transactionsApi.verify(tx.id);
        setTransaction(verified);
        setState(verified.status === "SUCCESS" ? "success" : verified.status === "FAILED" ? "failed" : "pending");
      } catch (err) {
        setErrorMsg(err.message || "Failed to verify transaction");
        setState("error");
      }
    }

    verify();
  }, [reference, statusHint]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-8 text-center">

        {/* Loading */}
        {state === "loading" && (
          <>
            <Loader2Icon className="w-12 h-12 text-gray-300 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Verifying Payment</h2>
            <p className="text-sm text-gray-500">Please wait while we confirm your transaction…</p>
          </>
        )}

        {/* Success */}
        {state === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2Icon className="w-9 h-9 text-[#22C55E]" />
            </div>
            <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">Payment Successful</h2>
            {transaction && (
              <>
                <p className="text-3xl font-black text-[#22C55E] my-4">
                  {fmt(transaction.amount, transaction.currency)}
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <code className="font-mono font-bold text-[#1A1A1A]">{transaction.reference}</code>
                  </div>
                  {transaction.customerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer</span>
                      <span className="font-bold text-[#1A1A1A]">{transaction.customerName}</span>
                    </div>
                  )}
                  {transaction.gateway?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gateway</span>
                      <span className="font-bold text-[#1A1A1A]">{transaction.gateway.name}</span>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-col gap-3">
              <Link to="/transactions" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                <ArrowRightIcon className="w-4 h-4" /> View Transactions
              </Link>
              <Link to="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                <HomeIcon className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </>
        )}

        {/* Failed */}
        {(state === "failed" || state === "pending") && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <XCircleIcon className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
              {state === "pending" ? "Payment Pending" : "Payment Not Completed"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {state === "pending"
                ? "Your payment is being processed. Check back shortly or view the transaction."
                : "The payment was not completed. No funds have been charged."}
            </p>
            {reference && (
              <p className="text-xs text-gray-400 font-mono mb-6">Ref: {reference}</p>
            )}
            <div className="flex flex-col gap-3">
              <Link to="/transactions" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                View Transactions
              </Link>
              <Link to="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                <HomeIcon className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </>
        )}

        {/* Error */}
        {state === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <XCircleIcon className="w-9 h-9 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
            <Link to="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              <HomeIcon className="w-4 h-4" /> Back to Dashboard
            </Link>
          </>
        )}

        {/* Branding */}
        <p className="text-xs text-gray-300 mt-8 font-medium">Powered by PayOrchestra</p>
      </div>
    </div>
  );
}
