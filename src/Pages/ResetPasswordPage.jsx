import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRightIcon, Loader2, LockIcon, CheckCircle2Icon, AlertTriangleIcon } from "lucide-react";
import { baseUrl } from "../API/AuthApi";
import { useState } from "react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!password || !confirm) { setError("Please fill in both fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!token) { setError("Invalid or missing reset token."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => navigate("/login"), 3000);
      } else if (res.status === 400) {
        setError("This reset link has expired or already been used.");
      } else {
        setError("Something went wrong. Please request a new link.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return null;
    if (password.length < 6) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
    if (password.length < 8) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Good", color: "bg-[#22C55E]", width: "w-3/4" };
    return { label: "Strong", color: "bg-[#C5E63D]", width: "w-full" };
  })();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 grid-cols-1">
      {/* Left — Form */}
      <div className="flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
            </div>
            <span className="font-black text-xl text-[#1A1A1A] tracking-tight">PayOrchestra</span>
          </div>

          {!token ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                <AlertTriangleIcon className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-[#1A1A1A] mb-2">Invalid Link</h1>
              <p className="text-gray-500 text-sm font-medium mb-6">
                This reset link is missing a token. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                Request New Link
              </Link>
            </div>
          ) : !done ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C5E63D]/20 flex items-center justify-center mb-5">
                  <LockIcon className="w-7 h-7 text-[#1A1A1A]" />
                </div>
                <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">
                  Set new password
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                  Choose a strong password for your account.
                </p>
              </div>

              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                  />
                  {strength && (
                    <div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                      </div>
                      <p className="text-xs font-bold mt-1" style={{ color: strength.label === "Strong" ? "#1A1A1A" : undefined }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium ${
                      confirm && password !== confirm ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-500 font-bold">Passwords don't match</p>
                  )}
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2Icon className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-3">
                Password reset!
              </h1>
              <p className="text-gray-500 font-medium text-sm mb-6 max-w-xs">
                Your password has been updated successfully. Redirecting you to sign in…
              </p>
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                Go to Sign In
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
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
            Your security
            <br />
            <span style={{ color: "#C5E63D" }}>is our priority.</span>
          </h2>
          <p className="text-white/60 font-medium text-base max-w-xs leading-relaxed">
            Reset tokens are single-use, expire in 15 minutes, and are never stored in plain text.
          </p>
        </div>
        <div className="relative z-10 flex gap-8 pt-8 border-t border-white/10">
          {[
            { label: "Token TTL", value: "15 min" },
            { label: "Encryption", value: "AES-256" },
            { label: "Auth standard", value: "JWT RS256" },
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

export default ResetPasswordPage;
