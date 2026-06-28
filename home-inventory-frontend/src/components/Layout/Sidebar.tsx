import { NavLink } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Home, Settings, Package, MapPin, Tags, ChartSpline, LogOut, FolderOpen, User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getMe } from "@/api/users.api";
import { useAuth } from "@/hooks/useAuth";

type MenuItem = { label: string; path: string; icon: LucideIcon };

const menu: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Items", path: "/items", icon: Package },
  { label: "Locations", path: "/locations", icon: MapPin },
  { label: "Categories", path: "/categories", icon: FolderOpen },
  { label: "Labels", path: "/labels", icon: Tags },
  { label: "Reports", path: "/reports", icon: ChartSpline },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMe });

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="flex p-4 items-center border-b border-slate-200">
        <div className="flex items-center justify-center">
          <img src="/assets/figma/logo.png" alt="Home Inventory Logo" className="h-12 w-auto" />
        </div>
        <div className="ml-4 -mt-1">
          <h1 className="text-lg font-bold">Home Inventory</h1>
          <p className="text-xs text-slate-500">Manage your items</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-primary font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <div className="my-2 border-t border-slate-200 pt-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-200 p-3">
        <NavLink to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name ?? user?.username ?? "—"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); logout(); }}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </NavLink>
      </div>
    </aside>
  );
}
