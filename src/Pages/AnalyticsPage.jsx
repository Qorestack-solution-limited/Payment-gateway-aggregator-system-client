import React from "react";
import {
  DownloadIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import { AppSidebar } from "../Components/AppSidebar";
import { AppHeader } from "../Components/AppHeader";
export function AnalyticsPage() {
  return (
    <>
      <AppHeader />
      <AppSidebar />
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Analytics & Reports
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Deep dive into your payment performance
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 shadow-sm transition-colors">
              <CalendarIcon className="w-4 h-4" />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
              <DownloadIcon className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">
            Revenue Growth
          </h3>
          <div className="h-80 w-full bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-300 relative overflow-hidden">
            {/* Simulated Chart Line */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none">
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,250 Q100,200 200,220 T400,150 T600,180 T800,100 T1000,120 T1200,50 L1200,320 L0,320 Z"
                fill="url(#greenGradient)"
              />

              <path
                d="M0,250 Q100,200 200,220 T400,150 T600,180 T800,100 T1000,120 T1200,50"
                fill="none"
                stroke="#22C55E"
                strokeWidth="3"
              />
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-6 pb-3 text-xs font-bold text-gray-400">
              <span>Day 1</span>
              <span>Day 5</span>
              <span>Day 10</span>
              <span>Day 15</span>
              <span>Day 20</span>
              <span>Day 25</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">
              Transaction Volume by Gateway
            </h3>
            <div className="space-y-5">
              {[
                {
                  label: "Stripe",
                  value: "65%",
                  color: "bg-[#1A1A1A]",
                },
                {
                  label: "PayPal",
                  value: "20%",
                  color: "bg-blue-600",
                },
                {
                  label: "Adyen",
                  value: "10%",
                  color: "bg-[#22C55E]",
                },
                {
                  label: "Others",
                  value: "5%",
                  color: "bg-gray-400",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-bold text-[#1A1A1A]">
                    {item.label}
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{
                        width: item.value,
                      }}></div>
                  </div>
                  <span className="w-12 text-sm text-gray-500 font-medium text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">
              Key Performance Indicators
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">
                  Avg. Transaction Value
                </p>
                <p className="text-2xl font-bold text-[#1A1A1A]">$84.50</p>
                <span className="text-xs text-[#22C55E] font-bold flex items-center mt-2">
                  <TrendingUpIcon className="w-3 h-3 mr-1" /> +2.4%
                </span>
              </div>
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">
                  Refund Rate
                </p>
                <p className="text-2xl font-bold text-[#1A1A1A]">1.2%</p>
                <span className="text-xs text-[#22C55E] font-bold flex items-center mt-2">
                  <TrendingDownIcon className="w-3 h-3 mr-1" /> -0.1%
                </span>
              </div>
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">
                  Cart Abandonment
                </p>
                <p className="text-2xl font-bold text-[#1A1A1A]">24.8%</p>
                <span className="text-xs text-red-600 font-bold flex items-center mt-2">
                  <TrendingUpIcon className="w-3 h-3 mr-1" /> +1.2%
                </span>
              </div>
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">
                  Authorization Rate
                </p>
                <p className="text-2xl font-bold text-[#1A1A1A]">94.2%</p>
                <span className="text-xs text-[#22C55E] font-bold flex items-center mt-2">
                  <TrendingUpIcon className="w-3 h-3 mr-1" /> +0.5%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
