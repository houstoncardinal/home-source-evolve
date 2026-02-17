import { useState, useEffect, useRef } from "react";
import { Menu, Search, ShoppingCart, X, User, Heart, ChevronDown, Phone, Mail, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

// Mega menu categories
const catalogCategories = [
  {
    title: "Living Room",
    items: [
      { name: "Sofas & Couches", href: "/products?category=Living Room&subcategory=Sofas" },
      { name: "Sectionals", href: "/products?category=Living Room&subcategory=Sectionals" },
      { name: "Coffee Tables", href: "/products?category=Living Room&subcategory=Coffee Tables" },
      { name: "TV Stands", href: "/products?category=Living Room&subcategory=TV Stands" },
      { name: "Accent Chairs", href: "/products?category=Living Room&subcategory=Accent Chairs" },
      { name: "Recliners", href: "/products?category=Living Room&subcategory=Recliners" },
    ],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"
  },
  {
    title: "Bedroom",
    items: [
      { name: "Beds", href: "/products?category=Bedroom&subcategory=Beds" },
      { name: "Mattresses", href: "/products?category=Bedroom&subcategory=Mattresses" },
      { name: "Nightstands", href: "/products?category=Bedroom&subcategory=Nightstands" },
      { name: "Dressers", href: "/products?category=Bedroom&subcategory=Dressers" },
      { name: "Bedroom Sets", href: "/products?category=Bedroom&subcategory=Bedroom Sets" },
      { name: "Vanities", href: "/products?category=Bedroom&subcategory=Vanities" },
    ],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop"
  },
  {
    title: "Dining & Office",
    items: [
      { name: "Dining Tables", href: "/products?category=Dining Room&subcategory=Dining Tables" },
      { name: "Dining Chairs", href: "/products?category=Dining Room&subcategory=Dining Chairs" },
      { name: "Bar Stools", href: "/products?category=Dining Room&subcategory=Bar Stools" },
      { name: "Desks", href: "/products?category=Office&subcategory=Desks" },
      { name: "Office Chairs", href: "/products?category=Office&subcategory=Office Chairs" },
      { name: "Bookcases", href: "/products?category=Office&subcategory=Bookcases" },
    ],
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop"
  }
];

const mainNav = [
  { name: "Home", href: "/" },
  { name: "Catalog", href: "/products", hasMegaMenu: true },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setMobileCatalogOpen(false);
  }, [location.pathname]);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      role="banner"
    >
      {/* Top Info Bar */}
      <div className="bg-primary text-primary-foreground text-xs font-medium">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-6">
              <a href="tel:+18005551234" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">1-800-555-1234</span>
              </a>
              <a href="mailto:info@curatedhomesource.com" className="hidden md:flex items-center gap-1.5 hover:text-accent transition-colors">
                <Mail className="h-3.5 w-3.5" />
                <span>info@curatedhomesource.com</span>
              </a>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>Free White Glove Delivery on Orders $2,000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background shadow-sm">
        <div className="border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              {/* Logo */}
              <Link 
                to="/" 
                className="font-display text-xl lg:text-2xl font-bold tracking-tight text-foreground"
                aria-label="Curated Home Source - Home"
              >
                <span className="hidden sm:inline">Curated Home Source</span>
                <span className="sm:hidden">CHS</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
                {mainNav.map((item) => (
                  <div key={item.name} className="relative" ref={item.hasMegaMenu ? megaMenuRef : undefined}>
                    {item.hasMegaMenu ? (
                      <button
                        onMouseEnter={() => setMegaMenuOpen(true)}
                        onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200"
                      >
                        {item.name}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Actions with separator */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:block h-8 w-px bg-border/50" />
                
                <Link to="/products">
                  <Button className="hidden xl:flex bg-accent hover:bg-accent/90 text-white font-semibold rounded-full px-6">
                    Shop Now
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-muted text-foreground/70 hover:text-foreground"
                  aria-label="Search products"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-muted text-foreground/70 hover:text-foreground"
                    aria-label="Profile"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-muted text-foreground/70 hover:text-foreground"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Button>

                <Link to="/cart" aria-label={`Shopping cart with ${totalItems} items`}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-muted text-foreground/70 hover:text-foreground"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-white border-2 border-background shadow-md">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Mega Menu - Sleek & Compact */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 bg-white shadow-xl border-b border-gray-100"
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-4 gap-4">
                {catalogCategories.map((category, idx) => (
                  <div key={idx} className="group">
                    <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1">
                      {category.title}
                    </h4>
                    <ul className="space-y-1.5">
                      {category.items.slice(0, 5).map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            to={item.href}
                            className="text-xs text-gray-500 hover:text-amber-700 transition-colors duration-150"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                {/* Featured Column - Sleek Card */}
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Featured</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">New Arrivals</h4>
                  <p className="text-[10px] text-gray-500 mb-3">Spring Collection 2026</p>
                  <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium py-1.5 rounded-lg">
                    Shop Now
                  </Button>
                </div>
              </div>
              
              {/* Bottom Promo - Minimal */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    In Stock
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                    Free Delivery
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    10yr Warranty
                  </span>
                </div>
                <Link to="/products" className="text-[10px] font-semibold text-amber-700 hover:text-amber-800">
                  View All →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="container mx-auto px-4 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
              {mainNav.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.hasMegaMenu ? (
                    <div>
                      <button
                        onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-foreground hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${mobileCatalogOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileCatalogOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pr-4 py-2 space-y-4 bg-muted/30 rounded-xl mt-2 mx-2">
                              {catalogCategories.map((cat, catIdx) => (
                                <div key={catIdx}>
                                  <h4 className="font-semibold text-sm text-foreground mb-2">{cat.title}</h4>
                                  <ul className="space-y-1">
                                    {cat.items.slice(0, 4).map((subItem, subIdx) => (
                                      <li key={subIdx}>
                                        <Link
                                          to={subItem.href}
                                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                                        >
                                          {subItem.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              <Link
                                to="/products"
                                className="inline-flex items-center justify-center w-full py-3 text-sm font-semibold text-accent border border-accent/20 rounded-xl hover:bg-accent/5 transition-all"
                              >
                                View All Products
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="block px-4 py-3 text-base font-medium text-foreground hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="lg">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button className="flex-1 bg-accent hover:bg-accent/90" size="lg">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
                  <a href="tel:+18005551234" className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    <span>1-800-555-1234</span>
                  </a>
                  <a href="mailto:info@curatedhomesource.com" className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
