import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
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
  const navigate = useNavigate();
  const { signOut, user } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const sidebarContent = (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-50",
        "bg-white border-r border-border/60 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.06)]",
        collapsed ? "w-[72px]" : "w-[264px]"
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        "flex items-center shrink-0 border-b border-border/40",
        collapsed ? "h-16 justify-center px-2" : "h-16 justify-between px-5"
      )}>
        {!collapsed ? (
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
              <Store className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-tight text-foreground">CHS Admin</span>
              <span className="block text-[10px] text-muted-foreground font-medium tracking-wide">COMMERCE SUITE</span>
            </div>
          </Link>
        ) : (
          <Link to="/admin">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Store className="h-4.5 w-4.5 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <p className="px-6 mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                {section.label}
              </p>
            )}
            {collapsed && <div className="mx-auto w-6 h-px bg-border/40 mb-2" />}
            <ul className="space-y-0.5 px-3">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group",
                        active
                          ? "bg-gradient-to-r from-amber-50 to-amber-50/40 text-amber-800 shadow-sm shadow-amber-100/50"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-amber-500 to-amber-600" />
                      )}
                      <item.icon className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        active ? "text-amber-600" : "text-muted-foreground/50 group-hover:text-foreground/70"
                      )} />
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
      <div className="p-3 border-t border-border/40 space-y-1.5 shrink-0">
        <Link
          to="/"
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "View Store" : undefined}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>

        {!collapsed && user && (
          <div className="px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-[11px] text-muted-foreground truncate font-medium">{user.email}</p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all flex-1",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2.5 rounded-xl text-muted-foreground/50 hover:bg-muted/50 hover:text-foreground transition-all"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden p-2.5 rounded-xl bg-white border border-border/60 text-foreground shadow-lg shadow-black/5"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop: always visible */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile: slide in */}
      {mobileOpen && <div className="lg:hidden">{sidebarContent}</div>}
    </>
  );
}
