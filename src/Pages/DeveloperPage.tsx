import React from "react";
import { CopyIcon, EyeIcon, RefreshCwIcon, TerminalIcon } from "lucide-react";
import { AppSidebar } from "../Components/AppSidebar";
import { AppHeader } from "../Components/AppHeader";
export function DeveloperPage() {
  return (
    <>
      <AppHeader />
      <AppSidebar />
      <div>
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* API Keys */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">API Keys</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Manage your secret keys for API access
                </p>
              </div>
              <button className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors">
                Generate New Key
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#1A1A1A]">
                      Production Key
                    </span>
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Created on Aug 12, 2023
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-mono text-gray-700 font-medium">
                    pk_live_****************4829
                  </code>
                  <button
                    className="p-2 text-gray-500 hover:text-[#22C55E] hover:bg-white rounded-lg transition-colors"
                    title="Copy">
                    <CopyIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-[#22C55E] hover:bg-white rounded-lg transition-colors"
                    title="Reveal">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#1A1A1A]">Test Key</span>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Created on Aug 12, 2023
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-mono text-gray-700 font-medium">
                    pk_test_****************9281
                  </code>
                  <button
                    className="p-2 text-gray-500 hover:text-[#22C55E] hover:bg-white rounded-lg transition-colors"
                    title="Copy">
                    <CopyIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-[#22C55E] hover:bg-white rounded-lg transition-colors"
                    title="Reveal">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">Webhooks</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Configure event notifications
                </p>
              </div>
              <button className="px-5 py-2.5 bg-white border border-gray-200 text-[#1A1A1A] rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">
                Add Endpoint
              </button>
            </div>

            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">Events</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Last Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-5 font-mono text-gray-600 font-medium">
                    https://api.myapp.com/webhooks/payment
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">
                      payment.*
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[#22C55E] font-bold">Enabled</span>
                  </td>
                  <td className="px-6 py-5 text-right text-gray-500 font-medium">
                    2 mins ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-5 font-mono text-gray-600 font-medium">
                    https://api.myapp.com/webhooks/refunds
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">
                      refund.*
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[#22C55E] font-bold">Enabled</span>
                  </td>
                  <td className="px-6 py-5 text-right text-gray-500 font-medium">
                    1 hour ago
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* API Playground */}
          <div className="bg-[#1A1A1A] rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-3 text-gray-300">
                <TerminalIcon className="w-4 h-4" />
                <span className="text-sm font-bold">API Playground</span>
              </div>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-[#22C55E]"></span>
              </div>
            </div>
            <div className="p-8 font-mono text-sm">
              <div className="flex gap-4 mb-6">
                <span className="text-[#22C55E] font-bold">POST</span>
                <span className="text-gray-300">
                  https://api.payorchestra.com/v1/payments
                </span>
              </div>
              <div className="text-gray-500 mb-3 font-medium">
                {" "}
                // Request Body
              </div>
              // Request Body
            </div>
            <pre className="text-blue-300">
              {`{
  "amount": 2500,
  "currency": "usd",
  "source": "tok_visa",
  "description": "Charge for order #1234"
}`}
            </pre>
            <div className="mt-8 flex justify-end">
              <button className="px-5 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-[#16a34a] flex items-center gap-2 font-bold transition-colors">
                <RefreshCwIcon className="w-4 h-4" />
                Test Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
