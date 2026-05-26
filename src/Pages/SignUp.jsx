import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  BuildingIcon,
  UserIcon,
  CreditCardIcon,
  CheckIcon,
  ZapIcon,
  ShieldIcon,
  HeadphonesIcon,
} from "lucide-react";
import { authApi } from "../API/apiClient";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₦0",
    period: "/mo",
    description: "Perfect for trying out PayOrchestra",
    icon: ZapIcon,
    color: "border-gray-200",
    highlight: false,
    features: ["1 gateway", "1,000 transactions/mo", "Basic analytics", "Community support"],
  },
  {
    id: "starter",
    name: "Starter",
    price: "₦15,000",
    period: "/mo",
    description: "For growing businesses",
    icon: CheckCircle2Icon,
    color: "border-[#C5E63D]",
    highlight: true,
    badge: "Most Popular",
    features: ["3 gateways", "10,000 transactions/mo", "Advanced analytics", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₦45,000",
    period: "/mo",
    description: "For scaling operations",
    icon: ShieldIcon,
    color: "border-gray-200",
    highlight: false,
    features: ["Unlimited gateways", "100,000 transactions/mo", "Full analytics suite", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    icon: HeadphonesIcon,
    color: "border-gray-200",
    highlight: false,
    features: ["Unlimited everything", "Custom SLA", "Dedicated account manager", "24/7 phone support"],
  },
];

const STEPS = [
  { id: 1, label: "Your Details", icon: UserIcon },
  { id: 2, label: "Company Info", icon: BuildingIcon },
  { id: 3, label: "Choose Plan", icon: CreditCardIcon },
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"];
const INDUSTRIES = [
  "E-commerce",
  "SaaS / Software",
  "Fintech",
  "Retail",
  "Healthcare",
  "Marketplace",
  "Other",
];

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
    companySize: "",
    industry: "",
    website: "",
    plan: "starter",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setResponse({ text: "Please fill in all required fields.", type: "error" });
        return false;
      }
      if (formData.password.length < 8) {
        setResponse({ text: "Password must be at least 8 characters.", type: "error" });
        return false;
      }
    }
    if (step === 2) {
      if (!formData.organizationName || !formData.companySize || !formData.industry) {
        setResponse({ text: "Please fill in all required fields.", type: "error" });
        return false;
      }
    }
    setResponse({ text: "", type: "" });
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const back = () => {
    setResponse({ text: "", type: "" });
    setStep((s) => s - 1);
  };

  const register = async () => {
    setLoading(true);
    try {
      await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
        companySize: formData.companySize,
        industry: formData.industry,
        website: formData.website,
        plan: formData.plan,
      });
      setResponse({ text: "Account created! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.message?.toLowerCase().includes("already")) {
        setResponse({ text: "An account with this email already exists.", type: "error" });
      } else {
        setResponse({ text: err.message || "Something went wrong. Please try again.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const brandPanelContent = {
    1: {
      heading: (
        <>
          Start your journey
          <br />
          <span style={{ color: "#C5E63D" }}>with PayOrchestra.</span>
        </>
      ),
      sub: "Join 10,000+ businesses managing all their payment gateways from one place.",
      bullets: [
        "Free 14-day trial — no credit card needed",
        "Connect your first gateway in minutes",
        "Full API access from day one",
        "Dedicated onboarding support",
      ],
    },
    2: {
      heading: (
        <>
          Built for teams
          <br />
          <span style={{ color: "#C5E63D" }}>of every size.</span>
        </>
      ),
      sub: "From indie startups to enterprise — PayOrchestra scales with your business.",
      bullets: [
        "20+ supported payment gateways",
        "150+ countries supported",
        "Custom routing rules per region",
        "SOC 2 Type II compliant",
      ],
    },
    3: {
      heading: (
        <>
          Transparent pricing,
          <br />
          <span style={{ color: "#C5E63D" }}>zero surprises.</span>
        </>
      ),
      sub: "Pick a plan and upgrade or downgrade anytime. No long-term contracts.",
      bullets: [
        "No hidden fees",
        "Cancel anytime",
        "Instant plan upgrades",
        "Volume discounts available",
      ],
    },
  };

  const panel = brandPanelContent[step];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 grid-cols-1">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0d3a20] to-[#1a5c35] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(197,230,61,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">PayOrchestra</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
            {panel.heading}
          </h2>
          <p className="text-white/60 font-medium text-base mb-10 max-w-xs leading-relaxed">
            {panel.sub}
          </p>
          <div className="flex flex-col gap-4">
            {panel.bullets.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2Icon className="w-5 h-5 shrink-0" style={{ color: "#C5E63D" }} />
                <span className="text-white/80 font-medium text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-8 pt-8 border-t border-white/10">
          {[
            { label: "Gateways", value: "20+" },
            { label: "Countries", value: "150+" },
            { label: "Setup time", value: "< 5 min" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/50 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col justify-center items-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
            </div>
            <span className="font-black text-xl text-[#1A1A1A] tracking-tight">PayOrchestra</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                        done
                          ? "bg-[#C5E63D] text-[#1A1A1A]"
                          : active
                          ? "bg-[#1A1A1A] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                      {done ? <CheckIcon className="w-4 h-4" /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        active ? "text-[#1A1A1A]" : done ? "text-[#22C55E]" : "text-gray-400"
                      }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                        step > s.id ? "bg-[#C5E63D]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1 — Personal Details */}
          {step === 1 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => { e.preventDefault(); next(); }}>
              <div className="mb-2">
                <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-1">
                  Your details
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                  Create your personal login credentials
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "First Name", name: "firstName", placeholder: "John" },
                  { label: "Last Name", name: "lastName", placeholder: "Doe" },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">{f.label}</label>
                    <input
                      type="text"
                      name={f.name}
                      placeholder={f.placeholder}
                      value={formData[f.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#1A1A1A]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#1A1A1A]">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
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
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm mt-1">
                Continue
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <p className="text-sm text-center text-gray-500 font-medium">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-[#1A1A1A] hover:text-[#22C55E] transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* Step 2 — Company Info */}
          {step === 2 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => { e.preventDefault(); next(); }}>
              <div className="mb-2">
                <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-1">
                  Company info
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                  Tell us about your organization
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#1A1A1A]">Organization Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="Acme Inc."
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Company Size <span className="text-red-400">*</span></label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all font-medium text-gray-700 bg-white">
                    <option value="" disabled>Select size</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>{s} employees</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1A1A1A]">Industry <span className="text-red-400">*</span></label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all font-medium text-gray-700 bg-white">
                    <option value="" disabled>Select industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#1A1A1A]">
                  Website <span className="text-gray-400 font-medium">(optional)</span>
                </label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all placeholder-gray-400 font-medium"
                />
              </div>

              {response.text && (
                <div className={`px-4 py-3 rounded-xl text-sm font-bold ${response.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                  {response.text}
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-200 text-[#1A1A1A] rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">
                  Continue
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Choose Plan */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="mb-2">
                <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-1">
                  Choose your plan
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                  Upgrade or cancel anytime — no long-term contracts
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => {
                  const selected = formData.plan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, plan: plan.id }))}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                        selected
                          ? "border-[#C5E63D] bg-[#C5E63D]/5"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}>
                      {plan.badge && (
                        <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-[#C5E63D] text-[#1A1A1A] text-xs font-black rounded-full">
                          {plan.badge}
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-[#1A1A1A]">{plan.name}</span>
                        {selected && (
                          <div className="w-5 h-5 rounded-full bg-[#C5E63D] flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-[#1A1A1A]" />
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="text-xl font-black text-[#1A1A1A]">{plan.price}</span>
                        {plan.period && (
                          <span className="text-xs text-gray-400 font-medium">{plan.period}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-3">{plan.description}</p>
                      <ul className="flex flex-col gap-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <CheckIcon className="w-3 h-3 text-[#22C55E] mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-600 font-medium leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {response.text && (
                <div className={`px-4 py-3 rounded-xl text-sm font-bold ${response.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                  {response.text}
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-200 text-[#1A1A1A] rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={register}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 font-medium">
                By creating an account you agree to our{" "}
                <span className="text-[#1A1A1A] font-bold cursor-pointer hover:text-[#22C55E] transition-colors">Terms of Service</span>
                {" "}and{" "}
                <span className="text-[#1A1A1A] font-bold cursor-pointer hover:text-[#22C55E] transition-colors">Privacy Policy</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
