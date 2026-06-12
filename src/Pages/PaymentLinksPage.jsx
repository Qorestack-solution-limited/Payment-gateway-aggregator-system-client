import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon, CopyIcon, CheckIcon, Loader2Icon, TrashIcon,
  ToggleLeftIcon, ToggleRightIcon, ExternalLinkIcon, LinkIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import { api } from "../API/apiClient";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || window.location.origin;

const EMPTY_FORM = { title: "", description: "", amount: "", currency: "NGN", gatewayId: "", redirectUrl: "", maxUses: "" };

function getLinkUrl(slug) {
  return `${CLIENT_URL}/pay/${slug}`;
}

export function PaymentLinksPage() {
  const [links, setLinks] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [linksData, gwyData] = await Promise.all([
        api.get("/payment-links"),
        api.get("/gateways"),
      ]);
      setLinks(Array.isArray(linksData) ? linksData : []);
      setGateways(Array.isArray(gwyData) ? gwyData : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/payment-links", {
        title: form.title,
        description: form.description || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        currency: form.currency || "NGN",
        gatewayId: form.gatewayId || undefined,
        redirectUrl: form.redirectUrl || undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (link) => {
    await api.patch(`/payment-links/${link.id}`, { isActive: !link.isActive });
    load();
  };

  const deleteLink = async (id) => {
    if (!window.confirm("Delete this payment link?")) return;
    await api.delete(`/payment-links/${id}`);
    load();
  };

  const copyLink = (slug, id) => {
    navigator.clipboard.writeText(getLinkUrl(slug)).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fmt = (n, c = "NGN") => n != null
    ? `${c} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : "Variable";

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Payment Links</h2>
            <p className="text-sm text-gray-500 font-medium">Shareable links that let customers pay without any code</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
            <PlusIcon className="w-4 h-4" /> New Link
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm font-bold text-red-600">{error}</div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-5">Create Payment Link</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Starter Plan Payment"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Amount (leave blank for variable)</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white font-medium">
                    {["NGN","USD","GBP","EUR","GHS","KES","ZAR"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Gateway</label>
                  <select value={form.gatewayId} onChange={(e) => setForm((f) => ({ ...f, gatewayId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white font-medium">
                    <option value="">Auto-route via rules</option>
                    {gateways.filter((g) => g.status === "ACTIVE").map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Max Uses (blank = unlimited)</label>
                  <input type="number" min="1" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    placeholder="e.g. 100"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Redirect URL after payment</label>
                  <input type="url" value={form.redirectUrl} onChange={(e) => setForm((f) => ({ ...f, redirectUrl: e.target.value }))}
                    placeholder="https://yoursite.com/thank-you"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60">
                  {saving && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  Create Link
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Links grid */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => <LoadingSkeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <LinkIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-400">No payment links yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first link to start accepting payments without code.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-opacity ${link.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#1A1A1A] truncate">{link.title}</h3>
                      {!link.isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>}
                    </div>
                    <p className="text-sm font-bold text-[#22C55E] mb-2">{fmt(link.amount, link.currency)}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 truncate max-w-[280px]">
                        {getLinkUrl(link.slug)}
                      </code>
                      <button onClick={() => copyLink(link.slug, link.id)} className="text-gray-400 hover:text-[#22C55E] transition-colors p-1">
                        {copiedId === link.id ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                      </button>
                      <a href={getLinkUrl(link.slug)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1A1A1A] transition-colors p-1">
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-medium flex-wrap">
                      {link.gateway && <span>{link.gateway.name}</span>}
                      <span>{link.useCount} uses{link.maxUses ? ` / ${link.maxUses}` : ""}</span>
                      <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(link)} title={link.isActive ? "Deactivate" : "Activate"}
                      className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-lg hover:bg-gray-100 transition-colors">
                      {link.isActive
                        ? <ToggleRightIcon className="w-5 h-5 text-[#22C55E]" />
                        : <ToggleLeftIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => deleteLink(link.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
