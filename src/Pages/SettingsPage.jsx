import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserIcon, LockIcon, CreditCardIcon, BellIcon,
  UsersIcon, Loader2Icon, CheckIcon, ZapIcon,
  MailIcon, SmartphoneIcon, AlertTriangleIcon,
  CheckCircle2Icon, ShieldCheckIcon, BuildingIcon,
  QrCodeIcon, ShieldOffIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  changePassword, clearPasswordMessage, clearProfileMessage,
  refreshCurrentUser, saveProfile, updateUserSuccess,
  selectPasswordLoading, selectPasswordMessage,
  selectProfileLoading, selectProfileMessage, selectUser,
} from "../store/slices/authSlice";
import { organizationApi, twoFactorApi, notifPrefsApi } from "../API/apiClient";

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: "FREE",
    label: "Free",
    price: "₦0",
    period: "forever",
    description: "Get started with the basics",
    features: ["1 gateway connection", "Up to 100 transactions/mo", "Basic dashboard", "Community support"],
    highlight: false,
  },
  {
    key: "STARTER",
    label: "Starter",
    price: "₦15,000",
    period: "per month",
    description: "Perfect for small businesses",
    features: ["2 gateway connections", "Up to 1,000 transactions/mo", "Basic analytics", "Email support"],
    highlight: false,
  },
  {
    key: "PRO",
    label: "Growth",
    price: "₦35,000",
    period: "per month",
    description: "For growing businesses",
    features: ["5 gateway connections", "Up to 10,000 transactions/mo", "Advanced analytics & reports", "Team management (5 seats)", "Priority support", "Custom webhooks", "CSV/Excel exports"],
    highlight: true,
  },
  {
    key: "ENTERPRISE",
    label: "Business",
    price: "₦75,000",
    period: "per month",
    description: "Unlimited enterprise needs",
    features: ["Unlimited gateways", "Unlimited transactions", "Custom integrations", "Unlimited team seats", "Dedicated account manager", "99.9% SLA", "White-label option", "CBN compliance reporting"],
    highlight: false,
    dark: true,
  },
];

// ─── Notification prefs defaults ─────────────────────────────────────────────
const DEFAULT_PREFS = {
  emailPayments:   true,
  emailAlerts:     true,
  emailSystem:     true,
  inAppPayments:   true,
  inAppAlerts:     true,
};

// ─── Reusable toggle ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-[#C5E63D]" : "bg-gray-200"
      }`}>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loadingProfile = useSelector(selectProfileLoading);
  const savingPwd = useSelector(selectPasswordLoading);
  const profileMsg = useSelector(selectProfileMessage);
  const pwdMsg = useSelector(selectPasswordMessage);
  const [tab, setTab] = useState("profile");
  const [initialized, setInitialized] = useState(false);

  // Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");

  // Security
  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [pwdValidationMsg, setPwdValidationMsg] = useState(null);

  // 2FA
  const [twoFaStep, setTwoFaStep]           = useState("idle"); // "idle"|"setup"|"confirm"|"disable"
  const [twoFaSecret, setTwoFaSecret]       = useState("");
  const [twoFaQrUrl, setTwoFaQrUrl]         = useState("");
  const [twoFaCode, setTwoFaCode]           = useState("");
  const [twoFaLoading, setTwoFaLoading]     = useState(false);
  const [twoFaMsg, setTwoFaMsg]             = useState(null);

  // Organization
  const [orgName, setOrgName]           = useState("");
  const [orgIndustry, setOrgIndustry]   = useState("");
  const [orgWebsite, setOrgWebsite]     = useState("");
  const [orgSize, setOrgSize]           = useState("");
  const [orgSaving, setOrgSaving]       = useState(false);
  const [orgMsg, setOrgMsg]             = useState(null);

  // Billing
  const [selectedPlan, setSelectedPlan]   = useState(null);
  const [upgradingPlan, setUpgradingPlan] = useState(false);
  const [planMsg, setPlanMsg]             = useState(null);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_PREFS);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Team
  const [members, setMembers]         = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await dispatch(refreshCurrentUser());
      setInitialized(true);
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setEmail(user.email ?? "");
    setSelectedPlan(user.organization?.plan ?? "FREE");
    if (user.notificationPreferences) {
      setNotifPrefs({ ...DEFAULT_PREFS, ...user.notificationPreferences });
    }
    setOrgName(user.organization?.name ?? "");
    setOrgIndustry(user.organization?.industry ?? "");
    setOrgWebsite(user.organization?.website ?? "");
    setOrgSize(user.organization?.companySize ?? "");
  }, [user]);

  useEffect(() => {
    if (!pwdValidationMsg) return;
    if (currentPwd && newPwd && confirmPwd) setPwdValidationMsg(null);
  }, [currentPwd, newPwd, confirmPwd, pwdValidationMsg]);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const data = await organizationApi.members();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "team") fetchMembers();
  }, [tab, fetchMembers]);

  const handleSaveProfile = async () => {
    dispatch(clearProfileMessage());
    await dispatch(saveProfile({ firstName, lastName }));
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdValidationMsg({ text: "All password fields are required.", ok: false });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdValidationMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (newPwd.length < 8) {
      setPwdValidationMsg({ text: "New password must be at least 8 characters.", ok: false });
      return;
    }
    setPwdValidationMsg(null);
    dispatch(clearPasswordMessage());
    const result = await dispatch(changePassword({ currentPassword: currentPwd, newPassword: newPwd }));
    if (changePassword.fulfilled.match(result)) {
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    }
  };

  const handleSaveOrg = async () => {
    setOrgSaving(true);
    setOrgMsg(null);
    try {
      await organizationApi.updateProfile({ name: orgName, industry: orgIndustry, website: orgWebsite, companySize: orgSize });
      setOrgMsg({ text: "Organization updated.", ok: true });
    } catch (err) {
      setOrgMsg({ text: err.message || "Failed to update.", ok: false });
    } finally {
      setOrgSaving(false);
    }
  };

  const handle2FASetup = async () => {
    setTwoFaLoading(true);
    setTwoFaMsg(null);
    try {
      const { secret, otpauthUrl } = await twoFactorApi.setup();
      setTwoFaSecret(secret);
      setTwoFaQrUrl(otpauthUrl);
      setTwoFaStep("setup");
    } catch (err) {
      setTwoFaMsg({ text: err.message || "Setup failed.", ok: false });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FAEnable = async () => {
    if (twoFaCode.length < 6) { setTwoFaMsg({ text: "Enter the 6-digit code.", ok: false }); return; }
    setTwoFaLoading(true);
    setTwoFaMsg(null);
    try {
      await twoFactorApi.enable(twoFaCode);
      dispatch(updateUserSuccess({ twoFactorEnabled: true }));
      setTwoFaStep("idle");
      setTwoFaCode("");
      setTwoFaMsg({ text: "Two-factor authentication is now enabled.", ok: true });
    } catch (err) {
      setTwoFaMsg({ text: err.message || "Invalid code.", ok: false });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (twoFaCode.length < 6) { setTwoFaMsg({ text: "Enter the 6-digit code.", ok: false }); return; }
    setTwoFaLoading(true);
    setTwoFaMsg(null);
    try {
      await twoFactorApi.disable(twoFaCode);
      dispatch(updateUserSuccess({ twoFactorEnabled: false }));
      setTwoFaStep("idle");
      setTwoFaCode("");
      setTwoFaMsg({ text: "Two-factor authentication disabled.", ok: true });
    } catch (err) {
      setTwoFaMsg({ text: err.message || "Invalid code.", ok: false });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleUpgradePlan = async (planKey) => {
    if (planKey === selectedPlan) return;
    setUpgradingPlan(true);
    setPlanMsg(null);
    try {
      await organizationApi.updatePlan(planKey);
      setSelectedPlan(planKey);
      setPlanMsg({ text: `Plan updated to ${PLANS.find(p => p.key === planKey)?.label}.`, ok: true });
    } catch (err) {
      setPlanMsg({ text: err.message || "Failed to update plan.", ok: false });
    } finally {
      setUpgradingPlan(false);
    }
  };

  const handleToggleNotifPref = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setPrefsSaving(true);
    try {
      await notifPrefsApi.save(updated);
    } catch { /* silent — optimistic update already applied */ } finally {
      setPrefsSaving(false);
    }
  };

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";

  const navItems = [
    { id: "profile",  label: "Profile",        icon: UserIcon },
    { id: "security", label: "Security",        icon: LockIcon },
    { id: "billing",  label: "Billing",         icon: CreditCardIcon },
    { id: "notifs",   label: "Notifications",   icon: BellIcon },
    { id: "team",     label: "Team",            icon: UsersIcon },
    { id: "org",      label: "Organization",    icon: BuildingIcon },
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-5 sm:mb-8">Account Settings</h2>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Tab nav — horizontal scroll on mobile, vertical on desktop */}
          <div className="lg:w-52 lg:shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
              {navItems.map((item) => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 lg:py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap shrink-0 lg:w-full ${
                      isActive
                        ? "bg-green-50 text-green-700 font-bold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Profile ── */}
            {tab === "profile" && (
              <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Personal Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#C5E63D]/20 flex items-center justify-center text-[#1A1A1A] text-2xl font-bold border-2 border-[#C5E63D]">
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{firstName} {lastName}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role?.toLowerCase() ?? "user"}</p>
                  </div>
                </div>

                {!initialized && loadingProfile ? (
                  <div className="space-y-4">
                    <LoadingSkeleton className="h-12" />
                    <LoadingSkeleton className="h-12" />
                    <LoadingSkeleton className="h-12" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">First Name</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Last Name</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Email Address</label>
                        <input type="email" value={email} readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 outline-none text-sm font-medium cursor-not-allowed" />
                        <p className="text-xs text-gray-400 mt-1.5 font-medium">Email cannot be changed here.</p>
                      </div>
                    </div>

                    {profileMsg && (
                      <div className={`mt-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${profileMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                        {profileMsg.ok && <CheckIcon className="w-4 h-4" />}
                        {profileMsg.text}
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                      <button onClick={handleSaveProfile} disabled={loadingProfile}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-60">
                        {loadingProfile && <Loader2Icon className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Security ── */}
            {tab === "security" && (
              <div className="space-y-5">
                {/* Change Password */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Change Password</h3>
                  <div className="space-y-5">
                    {[
                      { label: "Current Password", value: currentPwd, setter: setCurrentPwd },
                      { label: "New Password",      value: newPwd,    setter: setNewPwd },
                      { label: "Confirm New Password", value: confirmPwd, setter: setConfirmPwd },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">{label}</label>
                        <input type="password" value={value} onChange={(e) => setter(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm" />
                      </div>
                    ))}

                    {(pwdValidationMsg || pwdMsg) && (() => {
                      const msg = pwdValidationMsg || pwdMsg;
                      return (
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${msg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                          {msg.ok && <CheckIcon className="w-4 h-4" />}
                          {msg.text}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleChangePassword} disabled={savingPwd}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-60">
                      {savingPwd && <Loader2Icon className="w-4 h-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A]">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Add a second layer of security to your account.</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${user?.twoFactorEnabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  {twoFaMsg && (
                    <div className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${twoFaMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                      {twoFaMsg.ok ? <CheckCircle2Icon className="w-4 h-4" /> : <AlertTriangleIcon className="w-4 h-4" />}
                      {twoFaMsg.text}
                    </div>
                  )}

                  {/* Idle — not yet set up */}
                  {twoFaStep === "idle" && !user?.twoFactorEnabled && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#C5E63D]/20 flex items-center justify-center shrink-0">
                        <QrCodeIcon className="w-5 h-5 text-[#5a8a00]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium mb-4">
                          Use an authenticator app (Google Authenticator, Authy) to scan a QR code and generate time-based codes.
                        </p>
                        <button onClick={handle2FASetup} disabled={twoFaLoading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60">
                          {twoFaLoading && <Loader2Icon className="w-4 h-4 animate-spin" />}
                          Set Up 2FA
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Setup — show QR code */}
                  {twoFaStep === "setup" && (
                    <div className="space-y-5">
                      <p className="text-sm text-gray-600 font-medium">
                        Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
                      </p>
                      <div className="flex gap-6 items-start flex-wrap">
                        <div className="rounded-2xl border border-gray-200 p-3 bg-white shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFaQrUrl)}`}
                            alt="2FA QR Code"
                            className="w-[180px] h-[180px]"
                          />
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Manual entry key</p>
                            <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg block break-all">{twoFaSecret}</code>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Verification Code</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="000000"
                              maxLength={6}
                              value={twoFaCode}
                              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-lg font-mono tracking-[0.4em] text-center focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={handle2FAEnable} disabled={twoFaLoading || twoFaCode.length < 6}
                              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60">
                              {twoFaLoading && <Loader2Icon className="w-4 h-4 animate-spin" />}
                              Enable 2FA
                            </button>
                            <button onClick={() => { setTwoFaStep("idle"); setTwoFaCode(""); setTwoFaMsg(null); }}
                              className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enabled — offer to disable */}
                  {twoFaStep === "idle" && user?.twoFactorEnabled && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium mb-4">
                          Your account is protected with two-factor authentication.
                        </p>
                        <button onClick={() => { setTwoFaStep("disable"); setTwoFaCode(""); setTwoFaMsg(null); }}
                          className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
                          <ShieldOffIcon className="w-4 h-4" />
                          Disable 2FA
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Disable — confirm with code */}
                  {twoFaStep === "disable" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 font-medium">
                        Enter your current authenticator code to disable 2FA.
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                        className="w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-lg font-mono tracking-[0.4em] text-center focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none"
                      />
                      <div className="flex gap-3">
                        <button onClick={handle2FADisable} disabled={twoFaLoading || twoFaCode.length < 6}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                          {twoFaLoading && <Loader2Icon className="w-4 h-4 animate-spin" />}
                          Confirm Disable
                        </button>
                        <button onClick={() => { setTwoFaStep("idle"); setTwoFaCode(""); setTwoFaMsg(null); }}
                          className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Billing ── */}
            {tab === "billing" && (
              <div className="space-y-6">
                {/* Current plan banner */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Plan</p>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-black text-[#1A1A1A]">
                        {PLANS.find(p => p.key === selectedPlan)?.label ?? "Free"}
                      </p>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#C5E63D]/20 text-[#5a8a00]">Active</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{user?.organization?.name ?? "Your organization"}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#C5E63D]/10 flex items-center justify-center">
                    <ShieldCheckIcon className="w-7 h-7 text-[#5a8a00]" />
                  </div>
                </div>

                {planMsg && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${planMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                    {planMsg.ok ? <CheckCircle2Icon className="w-4 h-4" /> : <AlertTriangleIcon className="w-4 h-4" />}
                    {planMsg.text}
                  </div>
                )}

                {/* Plan cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PLANS.map((plan) => {
                    const isActive = selectedPlan === plan.key;
                    return (
                      <div
                        key={plan.key}
                        className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${
                          plan.dark
                            ? "border-[#1A4A2E] bg-gradient-to-br from-[#0B2518] to-[#1A4A2E] text-white"
                            : isActive
                              ? "border-[#C5E63D] bg-white shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300"
                        }`}>
                        {isActive && (
                          <div className="absolute -top-3 left-4">
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#C5E63D] text-[#0B2518]">
                              <CheckIcon className="w-3 h-3" /> Current Plan
                            </span>
                          </div>
                        )}
                        {plan.highlight && !isActive && (
                          <div className="absolute -top-3 left-4">
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#1A1A1A] text-white">
                              <ZapIcon className="w-3 h-3" /> Most Popular
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${plan.dark ? "text-[#C5E63D]/70" : "text-gray-400"}`}>
                            {plan.label}
                          </p>
                          <p className={`text-2xl font-black ${plan.dark ? "text-white" : "text-[#1A1A1A]"}`}>{plan.price}</p>
                          <p className={`text-xs font-medium ${plan.dark ? "text-white/50" : "text-gray-400"}`}>{plan.period}</p>
                        </div>

                        <ul className="space-y-1.5 mb-5 flex-1">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <CheckIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.dark ? "text-[#C5E63D]" : "text-[#5a8a00]"}`} />
                              <span className={`text-xs font-medium ${plan.dark ? "text-white/75" : "text-gray-600"}`}>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleUpgradePlan(plan.key)}
                          disabled={isActive || upgradingPlan}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-default ${
                            isActive
                              ? plan.dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-400"
                              : plan.dark
                                ? "bg-[#C5E63D] text-[#0B2518] hover:bg-[#d4f55a]"
                                : "bg-[#1A1A1A] text-white hover:bg-gray-800"
                          }`}>
                          {upgradingPlan && !isActive
                            ? <Loader2Icon className="w-3.5 h-3.5 animate-spin mx-auto" />
                            : isActive ? "Current Plan" : plan.key === "ENTERPRISE" ? "Contact Sales" : `Switch to ${plan.label}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-400 font-medium text-center">
                  All prices in Nigerian Naira (₦) · VAT inclusive · Cancel anytime
                </p>
              </div>
            )}

            {/* ── Notifications ── */}
            {tab === "notifs" && (
              <div className="space-y-5">
                {prefsSaving && (
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 px-1">
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Saving preferences…
                  </div>
                )}
                {/* Email preferences */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <MailIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">Email Notifications</p>
                      <p className="text-xs text-gray-500 font-medium">Receive updates in your inbox</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: "emailPayments", label: "Payment notifications", desc: "When a transaction is completed, failed, or refunded" },
                      { key: "emailAlerts",   label: "Gateway alerts",        desc: "When a gateway goes offline or recovers" },
                      { key: "emailSystem",   label: "System updates",        desc: "Account changes, security alerts, and platform news" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{label}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{desc}</p>
                        </div>
                        <Toggle checked={notifPrefs[key]} onChange={() => handleToggleNotifPref(key)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-app preferences */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[#C5E63D]/20 flex items-center justify-center">
                      <SmartphoneIcon className="w-4 h-4 text-[#5a8a00]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">In-App Notifications</p>
                      <p className="text-xs text-gray-500 font-medium">Shown in the bell icon on the dashboard</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: "inAppPayments", label: "Payment events",   desc: "Transaction completed, failed, or refunded" },
                      { key: "inAppAlerts",   label: "Gateway alerts",   desc: "Gateway status changes and connectivity issues" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{label}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{desc}</p>
                        </div>
                        <Toggle checked={notifPrefs[key]} onChange={() => handleToggleNotifPref(key)} />
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-medium text-center">
                  Preferences saved automatically · Stored locally on this device
                </p>
              </div>
            )}

            {/* ── Team ── */}
            {tab === "team" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A]">Team Members</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {user?.organization?.name ?? "Your organization"}
                    </p>
                  </div>
                  {!membersLoading && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      {members.length} member{members.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {membersLoading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
                          <div className="h-2 bg-gray-100 rounded animate-pulse w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <UsersIcon className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No team members found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user?.organizationId ? "Only you are in this organization." : "You are not part of an organization."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {members.map((member) => {
                      const isMe = member.id === user?.id;
                      const initials = `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`.toUpperCase();
                      return (
                        <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-[#C5E63D]/20 flex items-center justify-center text-[#1A1A1A] font-black text-sm border border-[#C5E63D]/30 shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#1A1A1A] truncate">
                                {member.firstName} {member.lastName}
                              </p>
                              {isMe && (
                                <span className="text-[10px] font-bold text-[#5a8a00] bg-[#C5E63D]/20 px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium truncate">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                              member.role === "ADMIN"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {member.role?.toLowerCase()}
                            </span>
                            <p className="text-xs text-gray-400 font-medium hidden sm:block">
                              Joined {new Date(member.createdAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-400 font-medium">
                    Team invitations are managed by your organization admin.
                  </p>
                </div>
              </div>
            )}

            {/* ── Organization ── */}
            {tab === "org" && (
              <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Organization Profile</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Organization Name</label>
                    <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Industry</label>
                    <select value={orgIndustry} onChange={(e) => setOrgIndustry(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium bg-white">
                      <option value="">Select industry…</option>
                      {["E-commerce", "Fintech", "SaaS", "Healthcare", "Education", "Logistics", "Real Estate", "Media", "Other"].map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Company Size</label>
                    <select value={orgSize} onChange={(e) => setOrgSize(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium bg-white">
                      <option value="">Select size…</option>
                      {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Website</label>
                    <input type="url" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)}
                      placeholder="https://yourcompany.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {orgMsg && (
                  <div className={`mt-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${orgMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                    {orgMsg.ok ? <CheckCircle2Icon className="w-4 h-4" /> : <AlertTriangleIcon className="w-4 h-4" />}
                    {orgMsg.text}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button onClick={handleSaveOrg} disabled={orgSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-60">
                    {orgSaving && <Loader2Icon className="w-4 h-4 animate-spin" />}
                    Save Organization
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
