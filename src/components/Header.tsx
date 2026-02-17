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

      {/* Mega Menu - Pure White Professional */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 bg-white shadow-2xl border-b border-gray-100"
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-4 gap-6">
                {catalogCategories.map((category, idx) => (
                  <div key={idx} className="group">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img 
                        src={category.image} 
                        alt={category.title}
                        className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 text-white font-display font-bold text-lg">
                        {category.title}
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            to={item.href}
                            className="text-sm text-gray-600 hover:text-amber-700 transition-colors duration-200 flex items-center justify-between group/link"
                          >
                            <span>{item.name}</span>
                            <span className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 text-amber-700">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/products?category=${category.title}`}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      View All
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                    </Link>
                  </div>
                ))}
                
                {/* Featured Column - Premium Card */}
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-5 border border-amber-100 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Featured</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-gray-900 mb-3">New Arrivals</h4>
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop" 
                      alt="Featured"
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <span className="text-white text-xs font-semibold">Spring Collection 2026</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">Discover our latest curated selection of premium furniture for modern living.</p>
                  <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm py-2.5 rounded-xl">
                    Shop Now
                  </Button>
                </div>
              </div>
              
              {/* Bottom Promo - Clean & Professional */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">In Stock & Ready to Ship</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Free White Glove Delivery</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">10-Year Warranty</span>
                  </div>
                </div>
                <Link to="/products" className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                  Browse Full Catalog 
                  <ChevronDown className="h-4 w-4 -rotate-90" />
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
