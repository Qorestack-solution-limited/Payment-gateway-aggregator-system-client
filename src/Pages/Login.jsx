import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRightIcon, CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { authApi } from "../API/apiClient";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep]         = useState("credentials"); // "credentials" | "totp"
  const [loading, setLoading]   = useState(false);
  const [response, setResponse] = useState({ text: "", type: "" });

  const handleCredentials = async () => {
    if (!email || !password) {
      setResponse({ text: "Please fill in all fields.", type: "error" });
      return;
    }
    setLoading(true);
    setResponse({ text: "", type: "" });
    try {
      const result = await authApi.login({ email, password });
      if (result?.requiresTwoFactor) {
        setStep("totp");
        setResponse({ text: "", type: "" });
        return;
      }
      dispatch(loginSuccess({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken }));
      navigate("/dashboard");
    } catch (err) {
      const msg = String(err.message || "").toLowerCase();
      if (msg.includes("incorrect") || msg.includes("unauthorized")) {
        setResponse({ text: "Incorrect email or password.", type: "error" });
      } else {
        setResponse({ text: err.message || "Something went wrong.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async () => {
    if (!totpCode.trim()) {
      setResponse({ text: "Please enter the 6-digit code.", type: "error" });
      return;
    }
    setLoading(true);
    setResponse({ text: "", type: "" });
    try {
      const result = await authApi.login({ email, password, totpCode: totpCode.trim() });
      dispatch(loginSuccess({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken }));
      navigate("/dashboard");
    } catch (err) {
      setResponse({ text: err.message || "Invalid code.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === "credentials") handleCredentials();
    else handleTotp();
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

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">Welcome back</h1>
                <p className="text-gray-500 font-medium text-sm">Sign in to your account to continue</p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#1A1A1A]">Password</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-[#22C55E] hover:text-[#16a34a] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                  />
                </div>

                {response.text && (
                  <div className={`px-4 py-3 rounded-xl text-sm font-bold ${response.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                    {response.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRightIcon className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-sm text-center text-gray-500 font-medium mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="font-bold text-[#1A1A1A] hover:text-[#22C55E] transition-colors">Create one</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C5E63D]/20 flex items-center justify-center mb-5">
                  <ShieldCheckIcon className="w-7 h-7 text-[#5a8a00]" />
                </div>
                <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">Two-Factor Auth</h1>
                <p className="text-gray-500 font-medium text-sm">
                  Open your authenticator app and enter the 6-digit code for <span className="font-bold text-[#1A1A1A]">{email}</span>.
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Authenticator Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all"
                  />
                </div>

                {response.text && (
                  <div className="px-4 py-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                    {response.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify & Sign In</span><ArrowRightIcon className="w-4 h-4" /></>}
                </button>

                <button type="button" onClick={() => { setStep("credentials"); setTotpCode(""); setResponse({ text: "", type: "" }); }}
                  className="text-sm text-center text-gray-400 hover:text-gray-600 font-medium transition-colors">
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0d3a20] to-[#1a5c35] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(197,230,61,0.12) 0%, transparent 60%)" }} />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">PayOrchestra</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
            One dashboard.
            <br />
            <span style={{ color: "#C5E63D" }}>Every gateway.</span>
          </h2>
          <p className="text-white/60 font-medium text-base mb-10 max-w-xs leading-relaxed">
            Manage Stripe, PayPal, Adyen and more from a single unified platform.
          </p>
          <div className="flex flex-col gap-4">
            {["Intelligent payment routing", "Real-time analytics & reports", "Unified webhook management", "99.99% uptime SLA"].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <CheckCircle2Icon className="w-5 h-5 shrink-0" style={{ color: "#C5E63D" }} />
                <span className="text-white/80 font-medium text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-8 pt-8 border-t border-white/10">
          {[{ label: "Businesses", value: "10k+" }, { label: "Transactions / mo", value: "$2.4B" }, { label: "Uptime", value: "99.99%" }].map((s) => (
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

export default Login;
