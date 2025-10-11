import { useState } from "react";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

const navigation = [
  { name: "Living Rooms", href: "#living" },
  { name: "Dining Rooms", href: "#dining" },
  { name: "Bedrooms", href: "#bedrooms" },
  { name: "Kitchen", href: "#kitchen" },
  { name: "Home Office", href: "#office" },
  { name: "Patio", href: "#patio" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" role="banner">
      {/* Promo Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium" role="alert">
        Buy More/Save More Sale - Up to 30% Off*
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4" role="navigation" aria-label="Main navigation">
          {/* Logo */}
          <div className="flex-1 lg:flex-none">
            <Link to="/" className="text-2xl font-bold tracking-tight" aria-label="Curated Home Source - Home">
              Curated Home Source
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <Button variant="ghost" size="icon" className="hover:bg-accent/10" aria-label="Search products">
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Link to="/cart" aria-label={`Shopping cart with ${totalItems} items`}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/10 relative">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground" aria-label={`${totalItems} items`}>
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-accent/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent/10 hover:text-accent rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
