import React from "react";
import {
  FilterIcon,
  DownloadIcon,
  SearchIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  EyeIcon,
} from "lucide-react";
import { AppSidebar } from "../Components/AppSidebar";
import { AppHeader } from "../Components/AppHeader";
export function TransactionsPage() {
  const transactions = Array.from({
    length: 12,
  }).map((_, i) => ({
    id: `TX-${94821 - i}`,
    customer: [
      "Alice Smith",
      "Bob Jones",
      "Charlie Day",
      "Diana Prince",
      "Evan Wright",
    ][i % 5],
    email: [
      "alice@example.com",
      "bob@example.com",
      "charlie@example.com",
      "diana@example.com",
      "evan@example.com",
    ][i % 5],
    amount: `$${(Math.random() * 500).toFixed(2)}`,
    gateway: ["Stripe", "PayPal", "Adyen", "Square"][i % 4],
    status: ["success", "success", "failed", "pending", "success"][i % 5],
    date: "Aug 24, 2023",
    time: "14:30 PM",
  }));
  return (
    <>
      <AppHeader />
      <AppSidebar />
      <div className="p-8 max-w-7xl mx-auto">
        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, email..."
                className="w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent shadow-sm font-medium"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 shadow-sm transition-colors">
              <FilterIcon className="w-4 h-4" />
              Filters
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 shadow-sm transition-colors">
              <DownloadIcon className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E]"
                    />
                  </th>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E]"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 font-medium">
                      {tx.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1A1A1A]">
                        {tx.customer}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {tx.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1A1A1A]">
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                        {tx.gateway}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === "success" ? "bg-green-100 text-green-700" : tx.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
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
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      <div>{tx.date}</div>
                      <div className="text-xs">{tx.time}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-[#1A1A1A]">1</span> to{" "}
              <span className="font-bold text-[#1A1A1A]">12</span> of{" "}
              <span className="font-bold text-[#1A1A1A]">1,240</span> results
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                disabled>
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
