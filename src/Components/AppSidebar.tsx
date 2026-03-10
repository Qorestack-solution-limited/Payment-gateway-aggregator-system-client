import React from "react";
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  NetworkIcon,
  BarChart3Icon,
  Code2Icon,
  SettingsIcon,
  HelpCircleIcon,
  ChevronDownIcon,
} from "lucide-react";
interface AppSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}
export function AppSidebar({ activePage, setActivePage }: AppSidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: ArrowLeftRightIcon,
      badge: "5",
    },
    {
      id: "gateways",
      label: "Gateways",
      icon: NetworkIcon,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3Icon,
      hasDropdown: true,
    },
    {
      id: "developer",
      label: "Developer",
      icon: Code2Icon,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-white flex flex-col py-6 px-4 border-r border-gray-100 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-[#C5E63D] flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#1A1A1A] rounded-full" />
        </div>
        <span className="font-bold text-lg text-[#1A1A1A]">PayOrchestra</span>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#1A1A1A] font-bold text-sm border border-gray-200">
          JD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A1A] truncate">John Doe</p>
          <p className="text-xs text-gray-500 truncate">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activePage === item.id ? "bg-[#C5E63D] text-[#1A1A1A] font-semibold shadow-sm" : "text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50"}`}>
            <item.icon
              className={`w-5 h-5 ${activePage === item.id ? "text-[#1A1A1A]" : "text-gray-400"}`}
            />

            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {item.hasDropdown && (
              <ChevronDownIcon className="w-4 h-4 ml-auto text-gray-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-1 mb-6 pt-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-[#1A1A1A] rounded-xl transition-colors">
          <HelpCircleIcon className="w-5 h-5 text-gray-400" />
          <span>Get Help</span>
        </button>
      </div>

      {/* Promo Card */}
      <div className="bg-gradient-to-br from-[#1A3D2E] to-[#2D5A3D] rounded-2xl p-5 relative overflow-hidden shadow-lg mt-auto">
        <div className="flex items-center gap-1 mb-3 relative z-10">
          <div className="w-4 h-4 rounded-full bg-[#C5E63D] flex items-center justify-center">
            <div className="w-2 h-2 border border-[#1A1A1A] rounded-full" />
          </div>
          <span className="text-[#C5E63D] text-xs font-bold tracking-wide">
            PayOrchestra
          </span>
        </div>
        <p className="text-white text-sm font-medium leading-tight mb-16 relative z-10">
          Download The App For
          <br />
          Convenience Anywhere
        </p>
        <div className="absolute bottom-[-10px] right-[-10px] w-32 h-40 transform rotate-[-15deg] translate-x-4 translate-y-4 opacity-90">
          <img
            src="/image.png"
            alt="Credit card"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </aside>
  );
}
