import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Loader2Icon, TrashIcon, GripVerticalIcon, ZapIcon } from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import { api } from "../API/apiClient";

const STRATEGIES = [
  { value: "PRIORITY",     label: "Priority",    desc: "Always use the specified gateway (highest priority first)" },
  { value: "SUCCESS_RATE", label: "Success Rate", desc: "Route to the gateway with the best success rate in the last hour" },
  { value: "ROUND_ROBIN",  label: "Round Robin",  desc: "Distribute load to the gateway with fewest recent transactions" },
];

const EMPTY_FORM = { name: "", priority: "0", strategy: "PRIORITY", currency: "", minAmount: "", maxAmount: "", gatewayId: "", fallbackGatewayId: "" };

export function RoutingPage() {
  const [rules, setRules] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simAmount, setSimAmount] = useState("");
  const [simCurrency, setSimCurrency] = useState("NGN");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesData, gwData] = await Promise.all([
        api.get("/routing"),
        api.get("/gateways"),
      ]);
      setRules(Array.isArray(rulesData) ? rulesData : []);
      setGateways(Array.isArray(gwData) ? gwData : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await api.post("/routing", {
        name: form.name,
        priority: Number(form.priority) || 0,
        strategy: form.strategy,
        currency: form.currency || undefined,
        minAmount: form.minAmount ? Number(form.minAmount) : undefined,
        maxAmount: form.maxAmount ? Number(form.maxAmount) : undefined,
        gatewayId: form.gatewayId || undefined,
        fallbackGatewayId: form.fallbackGatewayId || undefined,
      });
      setShowForm(false); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const toggleRule = async (rule) => {
    await api.patch(`/routing/${rule.id}`, { isActive: !rule.isActive });
    load();
  };

  const deleteRule = async (id) => {
    if (!window.confirm("Delete this routing rule?")) return;
    await api.delete(`/routing/${id}`);
    load();
  };

  const simulate = async () => {
    if (!simAmount) return;
    setSimulating(true); setSimResult(null);
    try {
      const res = await api.post("/routing/resolve", { amount: Number(simAmount), currency: simCurrency });
      const gw = gateways.find((g) => g.id === res.gatewayId);
      setSimResult({ gatewayId: res.gatewayId, name: gw?.name ?? res.gatewayId ?? "None" });
    } catch (e) { setSimResult({ error: e.message }); }
    finally { setSimulating(false); }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Routing Rules</h2>
            <p className="text-sm text-gray-500 font-medium">Control which gateway handles each transaction automatically</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
            <PlusIcon className="w-4 h-4" /> Add Rule
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-red-600">{error}</div>}

        {/* Simulator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ZapIcon className="w-4 h-4 text-[#C5E63D]" />
            <h3 className="text-sm font-bold text-[#1A1A1A]">Rule Simulator</h3>
            <p className="text-xs text-gray-400 font-medium">Test which gateway would be selected</p>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Amount</label>
              <input type="number" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} placeholder="1000"
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D] w-36" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Currency</label>
              <select value={simCurrency} onChange={(e) => setSimCurrency(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white">
                {["NGN","USD","GBP","EUR","GHS"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={simulate} disabled={simulating || !simAmount}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C5E63D] text-[#1A1A1A] rounded-xl text-sm font-bold hover:bg-[#b8d930] transition-colors disabled:opacity-60">
              {simulating && <Loader2Icon className="w-4 h-4 animate-spin" />}
              Simulate
            </button>
            {simResult && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${simResult.error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                {simResult.error ? simResult.error : `→ ${simResult.name}`}
              </div>
            )}
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-5">New Routing Rule</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Rule Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. NGN Large Transactions"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Priority (lower = higher)</label>
                  <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Strategy</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STRATEGIES.map((s) => (
                      <label key={s.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.strategy === s.value ? "border-[#C5E63D] bg-[#C5E63D]/5" : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" name="strategy" value={s.value} checked={form.strategy === s.value}
                          onChange={(e) => setForm((f) => ({ ...f, strategy: e.target.value }))} className="mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{s.label}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Currency filter (blank = all)</label>
                  <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white font-medium">
                    <option value="">All currencies</option>
                    {["NGN","USD","GBP","EUR","GHS","KES"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Min Amount</label>
                    <input type="number" min="0" value={form.minAmount} onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Max Amount</label>
                    <input type="number" min="0" value={form.maxAmount} onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))}
                      placeholder="∞"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium" />
                  </div>
                </div>
                {form.strategy === "PRIORITY" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Primary Gateway</label>
                      <select value={form.gatewayId} onChange={(e) => setForm((f) => ({ ...f, gatewayId: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white font-medium">
                        <option value="">Select gateway…</option>
                        {gateways.filter((g) => g.status === "ACTIVE").map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Fallback Gateway</label>
                      <select value={form.fallbackGatewayId} onChange={(e) => setForm((f) => ({ ...f, fallbackGatewayId: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white font-medium">
                        <option value="">None</option>
                        {gateways.filter((g) => g.status === "ACTIVE").map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-60">
                  {saving && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rules list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <LoadingSkeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <GripVerticalIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-400">No routing rules yet</p>
            <p className="text-sm text-gray-400 mt-1">Without rules, the first active gateway is used for every transaction.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-4 ${!rule.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">
                    {rule.priority}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#1A1A1A]">{rule.name}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#C5E63D]/20 text-[#5a8a00]">{rule.strategy}</span>
                      {!rule.isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-medium flex-wrap">
                      {rule.gateway && <span>→ {rule.gateway.name}</span>}
                      {rule.currency && <span>Currency: {rule.currency}</span>}
                      {rule.minAmount && <span>Min: {rule.minAmount}</span>}
                      {rule.maxAmount && <span>Max: {rule.maxAmount}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleRule(rule)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${rule.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
