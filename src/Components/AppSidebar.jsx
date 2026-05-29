import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboardIcon, ArrowLeftRightIcon, NetworkIcon,
  BarChart3Icon, Code2Icon, SettingsIcon, HelpCircleIcon, LogOutIcon,
} from "lucide-react";
import { selectUser, logoutSuccess } from "../store/slices/authSlice";
import {
  fetchPendingTransactionsCount,
  selectPendingTransactionsCount,
} from "../store/slices/transactionsSlice";

export function AppSidebar({ isOpen = false, onClose = () => {} }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const pendingCount = useSelector(selectPendingTransactionsCount);

  useEffect(() => {
    dispatch(fetchPendingTransactionsCount());
  }, [dispatch]);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  const role     = user?.role ?? "User";

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/login");
    onClose();
  };

  const navItems = [
    { to: "/dashboard",    label: "Dashboard",    icon: LayoutDashboardIcon, badge: null },
    { to: "/transactions", label: "Transactions", icon: ArrowLeftRightIcon,  badge: pendingCount },
    { to: "/gateways",     label: "Gateways",     icon: NetworkIcon,         badge: null },
    { to: "/analytics",    label: "Analytics",    icon: BarChart3Icon,       badge: null },
    { to: "/developer",    label: "Developer",    icon: Code2Icon,           badge: null },
    { to: "/settings",     label: "Settings",     icon: SettingsIcon,        badge: null },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-[250px] bg-white flex flex-col py-6 px-4 border-r border-gray-100 z-20 transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
        </div>
        <span className="font-bold text-lg text-[#1A1A1A]">PayOrchestra</span>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-full bg-[#C5E63D]/30 flex items-center justify-center text-[#1A1A1A] font-black text-sm border border-[#C5E63D]/40">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A1A] truncate">{fullName}</p>
          <p className="text-xs text-gray-500 truncate capitalize">{role.toLowerCase()}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#C5E63D] text-[#1A1A1A] font-semibold shadow-sm"
                  : "text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50"
              }`
            }>
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#1A1A1A]" : "text-gray-400"}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 mb-6 pt-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-[#1A1A1A] rounded-xl transition-colors text-sm font-medium">
          <HelpCircleIcon className="w-5 h-5 text-gray-400" />
          Get Help
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
          <LogOutIcon className="w-5 h-5 text-gray-400" />
          Log Out
        </button>
      </div>

      {/* Promo Card */}
      <div className="bg-gradient-to-br from-[#1A3D2E] to-[#2D5A3D] rounded-2xl p-5 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-1 mb-3 relative z-10">
          <div className="w-4 h-4 rounded-full bg-[#C5E63D] flex items-center justify-center">
            <div className="w-2 h-2 border border-[#1A1A1A] rounded-full" />
          </div>
          <span className="text-[#C5E63D] text-xs font-bold tracking-wide">PayOrchestra</span>
        </div>
        <p className="text-white text-sm font-medium leading-tight mb-16 relative z-10">
          {user?.organization?.name
            ? `${user.organization.name} — ${user.organization.plan} plan`
            : "Unified payments. Every gateway. One dashboard."}
        </p>
      </div>
    </aside>
  );
}
