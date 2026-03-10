import React from "react";
import {
  PlusIcon,
  MoreVerticalIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  Settings2Icon,
  Trash2Icon,
  PowerIcon,
} from "lucide-react";
import { AppSidebar } from "../Components/AppSidebar";
import { AppHeader } from "../Components/AppHeader";
export function GatewaysPage() {
  const gateways = [
    {
      name: "Stripe",
      type: "Credit Card",
      status: "active",
      uptime: "99.99%",
      transactions: "8.4k",
      logo: "bg-[#1A1A1A]",
    },
    {
      name: "PayPal",
      type: "Wallet",
      status: "active",
      uptime: "99.95%",
      transactions: "2.1k",
      logo: "bg-blue-600",
    },
    {
      name: "Adyen",
      type: "Credit Card",
      status: "active",
      uptime: "99.98%",
      transactions: "945",
      logo: "bg-[#22C55E]",
    },
    {
      name: "Square",
      type: "POS / Card",
      status: "warning",
      uptime: "98.50%",
      transactions: "240",
      logo: "bg-gray-800",
    },
  ];

  return (
    <>
      <AppHeader />
      <AppSidebar />
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Connected Gateways
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Manage your payment providers and configurations
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
            <PlusIcon className="w-4 h-4" />
            Add Gateway
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gateway, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${gateway.logo} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                    {gateway.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] text-lg">
                      {gateway.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {gateway.type}
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-[#1A1A1A] rounded">
                    <MoreVerticalIcon className="w-5 h-5" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-6 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-10">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2">
                      <Settings2Icon className="w-4 h-4" /> Configure
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2">
                      <PowerIcon className="w-4 h-4" /> Disable
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 flex items-center gap-2">
                      <Trash2Icon className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${gateway.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {gateway.status === "active" ? (
                      <CheckCircle2Icon className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangleIcon className="w-3.5 h-3.5" />
                    )}
                    {gateway.status === "active"
                      ? "Operational"
                      : "Issues Detected"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">
                    Uptime (30d)
                  </span>
                  <span className="text-sm font-bold text-[#1A1A1A]">
                    {gateway.uptime}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Monthly Volume
                  </span>
                  <span className="text-sm font-bold text-[#1A1A1A]">
                    {gateway.transactions} txns
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                <button className="flex-1 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                  View Logs
                </button>
                <button className="flex-1 px-3 py-2.5 bg-white text-[#22C55E] rounded-xl text-sm font-bold hover:bg-green-50 transition-colors border border-green-200">
                  Settings
                </button>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <button className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-green-50/30 transition-all group h-full min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <PlusIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1 text-[#1A1A1A] group-hover:text-[#22C55E]">
              Connect Gateway
            </h3>
            <p className="text-sm text-center max-w-[200px] font-medium">
              Add a new payment provider to your orchestration layer
            </p>
          </button>
        </div>
      </div>
    </>
  );
}
