import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-[250px] flex flex-col min-h-screen">
        <AppHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
