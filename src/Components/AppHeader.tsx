import React from "react";
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowUpRightIcon,
} from "lucide-react";
interface AppHeaderProps {
  title: string;
}
export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 bg-white">
      {/* Left: Currency Rate */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 font-medium">
          International Currency USD Rate
        </span>
        <ArrowUpRightIcon className="w-4 h-4 text-[#22C55E]" />
        <span className="text-[#22C55E] font-bold">5.68</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Anything"
            className="w-72 pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all shadow-sm placeholder-gray-400"
          />

          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F3F4F0]"></span>
          </button>

          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#1A1A1A] font-medium transition-colors">
            <span>EN</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#1A1A1A]">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
