import { NavLink } from "react-router";
import {
  Home,
  Settings,
  Package,
  MapPin,
  Tags,
  ChartSpline,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const menu: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Items", path: "/items", icon: Package },
  { label: "Locations", path: "/locations", icon: MapPin },
  { label: "Labels", path: "/labels", icon: Tags },
  { label: "Reports", path: "/reports", icon: ChartSpline },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="flex p-4  items-center border-b border-slate-200">
        <div className="flex items-center justify-center">
          <img
            src="/assets/figma/logo.png"
            alt="Home Inventory Logo"
            className="h-12 w-auto"
          />
        </div>
        <div className="ml-4 -mt-1">
          <h1 className="text-lg font-bold">Home Inventory</h1>
          <p className="text-xs text-slate-500">Manage your items</p>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg
          ${
            isActive
              ? "bg-blue-50 text-primary"
              : "hover:bg-slate-50 transition-colors"
          }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <div className="my-4 border-t border-slate-200 pt-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg
              ${
                isActive
                  ? "bg-blue-50 text-primary"
                  : " hover:bg-slate-50 transition-colors"
              }
            `
            }
          >
            <Settings className="w-5 h-5" />
            <span> Settings</span>
          </NavLink>
        </div>
      </nav>
      {/* User Profile */}
      <div className=" border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
          <img
            src="/assets/figma/user-icon.png"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">John Smith</p>
            <p className="text-xs text-slate-500 truncate">john@example.com</p>
          </div>
          <LogOut className="w-5 h-5" />
        </div>
      </div>
    </aside>
  );
}
