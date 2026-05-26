import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserIcon,
  LockIcon,
  CreditCardIcon,
  BellIcon,
  ShieldIcon,
  Loader2Icon,
  CheckIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  changePassword,
  clearPasswordMessage,
  clearProfileMessage,
  refreshCurrentUser,
  saveProfile,
  selectPasswordLoading,
  selectPasswordMessage,
  selectProfileLoading,
  selectProfileMessage,
  selectUser,
} from "../store/slices/authSlice";

export function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loadingProfile = useSelector(selectProfileLoading);
  const savingPwd = useSelector(selectPasswordLoading);
  const profileMsg = useSelector(selectProfileMessage);
  const pwdMsg = useSelector(selectPasswordMessage);
  const [tab, setTab] = useState("profile");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdValidationMsg, setPwdValidationMsg] = useState(null);

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
  }, [user]);

  useEffect(() => {
    if (!pwdValidationMsg) return;
    if (currentPwd && newPwd && confirmPwd) {
      setPwdValidationMsg(null);
    }
  }, [currentPwd, newPwd, confirmPwd, pwdValidationMsg]);

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
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    }
  };

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";

  const navItems = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "security", label: "Security", icon: LockIcon },
    { id: "billing", label: "Billing", icon: CreditCardIcon },
    { id: "notifs", label: "Notifications", icon: BellIcon },
    { id: "team", label: "Team", icon: ShieldIcon },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Account Settings</h2>

        <div className="flex gap-8">
          <div className="w-56 shrink-0 space-y-1">
            {navItems.map((item) => {
              const isActive = tab === item.id;
              const canSwitch = item.id === "profile" || item.id === "security";

              return (
                <button
                  key={item.id}
                  onClick={() => canSwitch && setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? "bg-green-50 text-green-700 font-bold"
                      : canSwitch
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-gray-400 cursor-default"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 space-y-8">
            {tab === "profile" && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Personal Information</h3>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#C5E63D]/20 flex items-center justify-center text-[#1A1A1A] text-2xl font-bold border-2 border-[#C5E63D]">
                    {initials}
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
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 outline-none text-sm font-medium cursor-not-allowed"
                        />
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
                      <button
                        onClick={handleSaveProfile}
                        disabled={loadingProfile}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-60"
                      >
                        {loadingProfile ? <Loader2Icon className="w-4 h-4 animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "security" && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Change Password</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>

                  {(pwdValidationMsg || pwdMsg) && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${(pwdValidationMsg || pwdMsg).ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                      {(pwdValidationMsg || pwdMsg).ok && <CheckIcon className="w-4 h-4" />}
                      {(pwdValidationMsg || pwdMsg).text}
                    </div>
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPwd}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-60"
                  >
                    {savingPwd ? <Loader2Icon className="w-4 h-4 animate-spin" /> : null}
                    Update Password
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
