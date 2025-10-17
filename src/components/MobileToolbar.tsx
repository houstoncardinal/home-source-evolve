import { Home, Search, ShoppingCart, User, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

export const MobileToolbar = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Glass morphism card with premium effects */}
      <div className="mx-2 mb-2 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Accent glow at top */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
        
        <div className="flex items-center justify-around px-1 py-2">
          <Link to="/" aria-label="Home page" className="flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col h-auto py-3 px-2 gap-1 w-full rounded-xl transition-all duration-300 ${
                isActive("/") 
                  ? "text-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]" 
                  : "text-foreground/70 hover:text-accent hover:bg-accent/5 hover:shadow-[0_0_12px_rgba(var(--accent),0.1)]"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              <div className={`relative ${isActive("/") ? "animate-float" : ""}`}>
                <Home className="h-5 w-5" aria-hidden="true" />
                {isActive("/") && (
                  <div className="absolute inset-0 blur-md bg-accent/40 -z-10" />
                )}
              </div>
              <span className="text-[10px] font-semibold">Home</span>
            </Button>
          </Link>

          <Link to="/products" aria-label="Browse products" className="flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col h-auto py-3 px-2 gap-1 w-full rounded-xl transition-all duration-300 ${
                isActive("/products") 
                  ? "text-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]" 
                  : "text-foreground/70 hover:text-accent hover:bg-accent/5 hover:shadow-[0_0_12px_rgba(var(--accent),0.1)]"
              }`}
              aria-current={isActive("/products") ? "page" : undefined}
            >
              <div className={`relative ${isActive("/products") ? "animate-float" : ""}`}>
                <Menu className="h-5 w-5" aria-hidden="true" />
                {isActive("/products") && (
                  <div className="absolute inset-0 blur-md bg-accent/40 -z-10" />
                )}
              </div>
              <span className="text-[10px] font-semibold">Shop</span>
            </Button>
          </Link>

          <Link to="/space-analyzer" aria-label="Analyze your space" className="flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col h-auto py-3 px-2 gap-1 w-full rounded-xl transition-all duration-300 ${
                isActive("/space-analyzer") 
                  ? "text-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]" 
                  : "text-foreground/70 hover:text-accent hover:bg-accent/5 hover:shadow-[0_0_12px_rgba(var(--accent),0.1)]"
              }`}
              aria-current={isActive("/space-analyzer") ? "page" : undefined}
            >
              <div className={`relative ${isActive("/space-analyzer") ? "animate-float" : ""}`}>
                <Search className="h-5 w-5" aria-hidden="true" />
                {isActive("/space-analyzer") && (
                  <div className="absolute inset-0 blur-md bg-accent/40 -z-10" />
                )}
              </div>
              <span className="text-[10px] font-semibold">Design</span>
            </Button>
          </Link>

          <Link to="/cart" aria-label={`Shopping cart with ${totalItems} items`} className="flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col h-auto py-3 px-2 gap-1 w-full rounded-xl transition-all duration-300 relative ${
                isActive("/cart") 
                  ? "text-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]" 
                  : "text-foreground/70 hover:text-accent hover:bg-accent/5 hover:shadow-[0_0_12px_rgba(var(--accent),0.1)]"
              }`}
              aria-current={isActive("/cart") ? "page" : undefined}
            >
              <div className={`relative ${isActive("/cart") ? "animate-float" : ""}`}>
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {isActive("/cart") && (
                  <div className="absolute inset-0 blur-md bg-accent/40 -z-10" />
                )}
                {totalItems > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-accent text-accent-foreground shadow-[0_0_12px_rgba(var(--accent),0.6)] border-2 border-card font-bold animate-scale-in"
                    aria-label={`${totalItems} items in cart`}
                  >
                    {totalItems}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-semibold">Cart</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col h-auto py-3 px-2 gap-1 flex-1 rounded-xl transition-all duration-300 text-foreground/70 hover:text-accent hover:bg-accent/5 hover:shadow-[0_0_12px_rgba(var(--accent),0.1)]"
            aria-label="User account"
          >
            <div className="relative">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold">Account</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
