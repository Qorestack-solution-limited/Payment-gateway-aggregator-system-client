import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="ml-[250px] flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
