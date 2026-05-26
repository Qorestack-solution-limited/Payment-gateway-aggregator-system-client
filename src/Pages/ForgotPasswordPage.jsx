import { Link } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, Loader2, MailIcon, CheckCircle2Icon } from "lucide-react";
import { baseUrl } from "../API/AuthApi";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok || res.status === 404) {
        // 404 treated as success to not reveal whether email exists
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 grid-cols-1">
      {/* Left — Form */}
      <div className="flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
            </div>
            <span className="font-black text-xl text-[#1A1A1A] tracking-tight">PayOrchestra</span>
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C5E63D]/20 flex items-center justify-center mb-5">
                  <MailIcon className="w-7 h-7 text-[#1A1A1A]" />
                </div>
                <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">
                  Forgot password?
                </h1>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  No worries. Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2Icon className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-3">
                Check your inbox
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-2 max-w-xs">
                We sent a password reset link to
              </p>
              <p className="font-bold text-[#1A1A1A] text-sm mb-8">{email}</p>
              <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 font-medium text-left mb-8">
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-[#22C55E] font-bold hover:underline">
                  try a different email
                </button>
                .
              </div>
            </div>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 font-bold hover:text-[#1A1A1A] transition-colors mt-6">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0d3a20] to-[#1a5c35] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(197,230,61,0.12) 0%, transparent 60%)" }}
        />
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">PayOrchestra</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
            Secure by design.
            <br />
            <span style={{ color: "#C5E63D" }}>Always.</span>
          </h2>
          <p className="text-white/60 font-medium text-base mb-10 max-w-xs leading-relaxed">
            Your account and payment data are protected with bank-grade encryption at every layer.
          </p>
          <div className="flex flex-col gap-4">
            {[
              "AES-256 encrypted credentials",
              "Tokens expire within 15 minutes",
              "Full audit log on every action",
              "SOC 2 Type II compliant",
            ].map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2Icon className="w-5 h-5 shrink-0" style={{ color: "#C5E63D" }} />
                <span className="text-white/80 font-medium text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-8 pt-8 border-t border-white/10">
          {[
            { label: "Uptime SLA", value: "99.99%" },
            { label: "Data centers", value: "3 regions" },
            { label: "Pen-tested", value: "Quarterly" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/50 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
