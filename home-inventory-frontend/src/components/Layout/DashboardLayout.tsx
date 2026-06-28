import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
