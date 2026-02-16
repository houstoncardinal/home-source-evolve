import { useState, useEffect } from "react";
import { Menu, Search, ShoppingCart, X, User, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Collections", href: "/products" },
  { name: "Living Room", href: "/products?category=Living Room" },
  { name: "Bedroom", href: "/products?category=Bedroom" },
  { name: "Dining", href: "/products?category=Dining Room" },
  { name: "Office", href: "/products?category=Office" },
  { name: "Accessories", href: "/products?category=Accessories" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHomePage
          ? 'bg-background/95 backdrop-blur-xl shadow-elevated border-b border-border/50' 
          : 'bg-transparent'
      }`} 
      role="banner"
    >
      {/* Promo Banner */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-accent text-white text-center py-2 text-xs font-medium overflow-hidden tracking-wide"
            role="alert"
          >
            Complimentary White Glove Delivery on Orders Over $2,000
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4 lg:py-5" role="navigation" aria-label="Main navigation">
          {/* Logo */}
          <Link 
            to="/" 
            className={`font-display text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'
            }`}
            aria-label="Curated Home Source - Home"
          >
            <span className="hidden sm:inline">Curated Home Source</span>
            <span className="sm:hidden">CHS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative group rounded-full ${
                  scrolled || !isHomePage
                    ? 'text-foreground/70 hover:text-foreground hover:bg-muted'
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
              >
                {item.name}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hidden sm:flex rounded-full transition-colors ${
                scrolled || !isHomePage
                  ? 'hover:bg-muted text-foreground/70 hover:text-foreground'
                  : 'hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground'
              }`}
              aria-label="Search products"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hidden sm:flex rounded-full transition-colors ${
                scrolled || !isHomePage
                  ? 'hover:bg-muted text-foreground/70 hover:text-foreground'
                  : 'hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground'
              }`}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hidden sm:flex rounded-full transition-colors ${
                scrolled || !isHomePage
                  ? 'hover:bg-muted text-foreground/70 hover:text-foreground'
                  : 'hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground'
              }`}
              aria-label="Account"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Link to="/cart" aria-label={`Shopping cart with ${totalItems} items`}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative rounded-full transition-colors ${
                  scrolled || !isHomePage
                    ? 'hover:bg-muted text-foreground/70 hover:text-foreground'
                    : 'hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground'
                }`}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-2 border-background shadow-md">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden rounded-full transition-colors ${
                scrolled || !isHomePage
                  ? 'hover:bg-muted text-foreground'
                  : 'hover:bg-primary-foreground/10 text-primary-foreground'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background/98 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className="block px-4 py-3 text-lg font-medium text-foreground/80 hover:text-accent hover:bg-accent/5 rounded-xl transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="lg">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
