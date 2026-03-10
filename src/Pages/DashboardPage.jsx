import React from "react";
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  CreditCardIcon,
  UsersIcon,
  ActivityIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
import { AppSidebar } from "../Components/AppSidebar";
import { AppHeader } from "../Components/AppHeader";
export function DashboardPage() {
  return (
    <>
      <AppHeader />
      <AppSidebar />
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Revenue",
              value: "$124,592.00",
              change: "+12.5%",
              trend: "up",
              icon: CreditCardIcon,
              color: "lime",
            },
            {
              label: "Transactions",
              value: "14,205",
              change: "+8.2%",
              trend: "up",
              icon: ActivityIcon,
              color: "green",
            },
            {
              label: "Success Rate",
              value: "98.2%",
              change: "-0.4%",
              trend: "down",
              icon: CheckCircle2Icon,
              color: "blue",
            },
            {
              label: "Active Customers",
              value: "3,402",
              change: "+4.1%",
              trend: "up",
              icon: UsersIcon,
              color: "orange",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${stat.color === "lime" ? "bg-[#C5E63D]/20 text-[#1A1A1A]" : stat.color === "green" ? "bg-green-100 text-green-600" : stat.color === "blue" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <button className="text-gray-400 hover:text-[#1A1A1A]">
                  <MoreHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRightIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRightIcon className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  vs last month
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Revenue Overview
                </h3>
                <p className="text-sm text-gray-500">
                  Monthly revenue performance
                </p>
              </div>
              <select className="text-sm border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-[#1A1A1A] font-medium focus:ring-[#C5E63D] focus:border-[#C5E63D] outline-none">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-3 px-2">
              {[40, 65, 45, 80, 55, 70, 45, 60, 75, 50, 65, 85, 95, 75, 60].map(
                (h, i) => (
                  <div
                    key={i}
                    className="w-full bg-green-50 hover:bg-green-100 rounded-t-lg relative group cursor-pointer transition-colors"
                    style={{
                      height: `${h}%`,
                    }}>
                    <div
                      className="absolute bottom-0 w-full bg-[#22C55E] rounded-t-lg transition-all group-hover:bg-[#16a34a]"
                      style={{
                        height: `${h * 0.6}%`,
                      }}></div>
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      ${(h * 1240).toLocaleString()}
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A1A] rotate-45"></div>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="flex justify-between mt-6 text-xs font-medium text-gray-400 px-2">
              <span>Aug 1</span>
              <span>Aug 8</span>
              <span>Aug 15</span>
              <span>Aug 22</span>
              <span>Aug 29</span>
            </div>
          </div>

          {/* Gateway Performance */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">
              Gateway Performance
            </h3>
            <div className="space-y-8">
              {[
                {
                  name: "Stripe",
                  volume: "$84,230",
                  count: "8,420",
                  color: "bg-[#1A1A1A]",
                },
                {
                  name: "PayPal",
                  volume: "$24,500",
                  count: "2,105",
                  color: "bg-blue-600",
                },
                {
                  name: "Adyen",
                  volume: "$12,450",
                  count: "945",
                  color: "bg-[#22C55E]",
                },
                {
                  name: "Square",
                  volume: "$3,412",
                  count: "240",
                  color: "bg-gray-400",
                },
              ].map((gateway, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-[#1A1A1A]">
                      {gateway.name}
                    </span>
                    <span className="text-[#1A1A1A] font-bold">
                      {gateway.volume}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1.5">
                    <div
                      className={`h-2.5 rounded-full ${gateway.color}`}
                      style={{
                        width: `${80 - i * 15}%`,
                      }}></div>
                  </div>
                  <div className="text-xs text-gray-500 font-medium text-right">
                    {gateway.count} txns
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#1A1A1A]">
              Recent Transactions
            </h3>
            <button className="text-sm text-[#22C55E] hover:text-[#16a34a] font-bold">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold">
                <tr>
                  <th className="px-8 py-4">Transaction ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Gateway</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  {
                    id: "TX-94821",
                    customer: "Alice Smith",
                    amount: "$129.00",
                    gateway: "Stripe",
                    status: "success",
                    date: "Just now",
                  },
                  {
                    id: "TX-94820",
                    customer: "Bob Jones",
                    amount: "$49.00",
                    gateway: "PayPal",
                    status: "success",
                    date: "2 mins ago",
                  },
                  {
                    id: "TX-94819",
                    customer: "Charlie Day",
                    amount: "$249.00",
                    gateway: "Stripe",
                    status: "failed",
                    date: "5 mins ago",
                  },
                  {
                    id: "TX-94818",
                    customer: "Diana Prince",
                    amount: "$89.00",
                    gateway: "Adyen",
                    status: "pending",
                    date: "12 mins ago",
                  },
                  {
                    id: "TX-94817",
                    customer: "Evan Wright",
                    amount: "$12.00",
                    gateway: "Stripe",
                    status: "success",
                    date: "15 mins ago",
                  },
                ].map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-mono text-gray-600 font-medium">
                      {tx.id}
                    </td>
                    <td className="px-8 py-5 font-bold text-[#1A1A1A]">
                      {tx.customer}
                    </td>
                    <td className="px-8 py-5 font-bold text-[#1A1A1A]">
                      {tx.amount}
                    </td>
                    <td className="px-8 py-5 text-gray-600 font-medium">
                      {tx.gateway}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tx.status === "success" ? "bg-green-100 text-green-700" : tx.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {tx.status === "success" && (
                          <CheckCircle2Icon className="w-3.5 h-3.5" />
                        )}
                        {tx.status === "failed" && (
                          <XCircleIcon className="w-3.5 h-3.5" />
                        )}
                        {tx.status === "pending" && (
                          <ClockIcon className="w-3.5 h-3.5" />
                        )}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium">
                      {tx.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
