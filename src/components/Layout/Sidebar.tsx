import { NavLink } from "react-router";
import { Home, Settings, MoreVertical } from "lucide-react";

type MenuItem = {
  label: string;
  path: string;
};

const menu: MenuItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Inventory", path: "/inventory" },
  { label: "Locations", path: "/locations" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="flex p-6 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shadow-md mb-4">
          <Home className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h1 className="text-lg font-bold text-slate-900">Home Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your items</p>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg
              ${
                isActive
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 transition-colors"
              }
            `
            }
          >
            <Home className="w-5 h-5" />
            <span> {item.label}</span>
          </NavLink>
        ))}
        <div className="my-4 border-t border-slate-200 pt-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg
              ${
                isActive
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 transition-colors"
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
            src="/assets/inventory/user-avatar.png"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">John Smith</p>
            <p className="text-xs text-slate-500 truncate">john@example.com</p>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
