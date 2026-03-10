import React from "react";
import {
  UserIcon,
  LockIcon,
  CreditCardIcon,
  BellIcon,
  ShieldIcon,
} from "lucide-react";
import { AppSidebar } from "../Components/AppSidebar";
import { AppHeader } from "../Components/AppHeader";
export function SettingsPage() {
  return (
    <>
      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">
          Account Settings
        </h2>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <div className="w-64 shrink-0 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-bold text-sm">
              <UserIcon className="w-4 h-4" /> Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
              <LockIcon className="w-4 h-4" /> Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
              <CreditCardIcon className="w-4 h-4" /> Billing
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
              <BellIcon className="w-4 h-4" /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
              <ShieldIcon className="w-4 h-4" /> Team
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-8">
            {/* Profile Section */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">
                Personal Information
              </h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-[#C5E63D]/20 flex items-center justify-center text-[#1A1A1A] text-2xl font-bold border-2 border-[#C5E63D]">
                  JD
                </div>
                <div>
                  <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 shadow-sm transition-colors">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="john.doe@company.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">
                Password
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button className="px-6 py-2.5 bg-white border border-gray-200 text-[#1A1A1A] rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
