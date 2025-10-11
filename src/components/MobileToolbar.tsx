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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        <Link to="/" aria-label="Home page">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col h-auto py-2 px-4 gap-1 ${
              isActive("/") ? "text-accent" : "text-foreground/70"
            }`}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium">Home</span>
          </Button>
        </Link>

        <Link to="/products" aria-label="Browse products">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col h-auto py-2 px-4 gap-1 ${
              isActive("/products") ? "text-accent" : "text-foreground/70"
            }`}
            aria-current={isActive("/products") ? "page" : undefined}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium">Shop</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col h-auto py-2 px-4 gap-1 text-foreground/70"
          aria-label="Search products"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">Search</span>
        </Button>

        <Link to="/cart" aria-label={`Shopping cart with ${totalItems} items`}>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col h-auto py-2 px-4 gap-1 relative ${
              isActive("/cart") ? "text-accent" : "text-foreground/70"
            }`}
            aria-current={isActive("/cart") ? "page" : undefined}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalItems > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground"
                aria-label={`${totalItems} items in cart`}
              >
                {totalItems}
              </Badge>
            )}
            <span className="text-xs font-medium">Cart</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col h-auto py-2 px-4 gap-1 text-foreground/70"
          aria-label="User account"
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">Account</span>
        </Button>
      </div>
    </nav>
  );
};
