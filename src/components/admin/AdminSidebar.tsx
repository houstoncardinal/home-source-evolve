import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Store,
  BarChart3,
  Tags,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Moon,
  Sun,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tags },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Price Scanner", href: "/admin/competitive-pricing", icon: Crosshair },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut, user } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-50 border-r",
        "bg-[#0c0f1a] border-[#1e2235] text-white",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center h-16 border-b border-[#1e2235] px-4 shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-tight">CHS Admin</span>
              <span className="block text-[10px] text-slate-500 font-medium">Commerce Suite</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Store className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative group",
                        active
                          ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-400"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
                      )}
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e2235] space-y-1 shrink-0">
        <Link
          to="/"
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "View Store" : undefined}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>

        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-[#1e2235]">
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors flex-1",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-slate-600 hover:bg-white/[0.04] hover:text-slate-400 transition-colors"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
