import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export function PublicPayPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/pay/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.data) setLink(json.data);
        else setLoadError(json?.message || "Payment link not found");
      })
      .catch(() => setLoadError("Failed to load payment link"));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${BASE_URL}/pay/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          ...(link?.amount == null && form.amount ? { amount: Number(form.amount) } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Checkout failed");
      const data = json?.data ?? json;
      if (data?.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        navigate(`/pay/callback?reference=${data.reference}&status=success`);
      }
    } catch (err) {
      setSubmitError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-8 text-center">
        <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Link Unavailable</h2>
        <p className="text-sm text-gray-500">{loadError}</p>
        <p className="text-xs text-gray-300 mt-8">Powered by PayOrchestra</p>
      </div>
    </div>
  );

  if (!link) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2Icon className="w-8 h-8 text-gray-300 animate-spin" />
    </div>
  );

  const fixedAmount = link.amount != null;
  const fmt = (n) => `${link.currency} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">

        {/* Header */}
        <div className="bg-[#1A1A1A] rounded-t-2xl p-6 text-center">
          <p className="text-[#C5E63D] text-xs font-bold uppercase tracking-widest mb-1">{link.organization?.name}</p>
          <h1 className="text-xl font-black text-white">{link.title}</h1>
          {link.description && <p className="text-sm text-gray-400 mt-1">{link.description}</p>}
          {fixedAmount && (
            <p className="text-3xl font-black text-[#C5E63D] mt-3">{fmt(link.amount)}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Your Name</label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="jane@example.com"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
            />
          </div>

          {!fixedAmount && (
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Amount ({link.currency})</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 mt-2"
          >
            {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckCircle2Icon className="w-4 h-4" />}
            {submitting ? "Processing…" : `Pay${fixedAmount ? ` ${fmt(link.amount)}` : ""}`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-2">
            Secured by <span className="font-bold text-[#1A1A1A]">PayOrchestra</span>
          </p>
        </form>
      </div>
    </div>
  );
}
