import { useState, useEffect, useRef } from "react";
import { Menu, Search, ShoppingCart, X, User, Heart, ChevronDown, Phone, Mail, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { SearchDialog } from "@/components/SearchDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

// Category navigation with mega-menu dropdowns
const navCategories: {
  name: string;
  href: string;
  columns?: { heading?: string; items: { name: string; href: string }[] }[];
}[] = [
  {
    name: "Living Room",
    href: "/products?category=Living Room",
    columns: [
      {
        items: [
          { name: "Living Room Sets", href: "/products?category=Living Room&subcategory=Living Room Sets" },
          { name: "Sectionals & Modulars", href: "/products?category=Living Room&subcategory=Sectionals" },
          { name: "Sleepers", href: "/products?category=Living Room&subcategory=Sleepers" },
          { name: "Leather Sets", href: "/products?category=Living Room&subcategory=Leather Sets" },
          { name: "Reclining Sets", href: "/products?category=Living Room&subcategory=Reclining Sets" },
          { name: "Shop All", href: "/products?category=Living Room" },
        ],
      },
      {
        items: [
          { name: "Sofas", href: "/products?category=Living Room&subcategory=Sofas" },
          { name: "Loveseats", href: "/products?category=Living Room&subcategory=Loveseats" },
          { name: "Ottomans", href: "/products?category=Living Room&subcategory=Ottomans" },
          { name: "TV Consoles", href: "/products?category=Living Room&subcategory=TV Consoles" },
          { name: "Coffee Tables", href: "/products?category=Living Room&subcategory=Coffee Tables" },
          { name: "Living Room Décor", href: "/products?category=Living Room&subcategory=Decor" },
        ],
      },
    ],
  },
  {
    name: "Bedroom",
    href: "/products?category=Bedroom",
    columns: [
      {
        items: [
          { name: "Bedroom Sets", href: "/products?category=Bedroom&subcategory=Bedroom Sets" },
          { name: "Dresser & Mirror", href: "/products?category=Bedroom&subcategory=Dressers" },
          { name: "Chests", href: "/products?category=Bedroom&subcategory=Chests" },
        ],
      },
      {
        items: [
          { name: "Nightstands", href: "/products?category=Bedroom&subcategory=Nightstands" },
          { name: "Accent Benches", href: "/products?category=Bedroom&subcategory=Accent Benches" },
          { name: "Vanity Sets", href: "/products?category=Bedroom&subcategory=Vanities" },
        ],
      },
    ],
  },
  {
    name: "Dining Room",
    href: "/products?category=Dining Room",
    columns: [
      {
        heading: "Dining Essentials",
        items: [
          { name: "Dining Room Sets", href: "/products?category=Dining Room&subcategory=Dining Room Sets" },
          { name: "Dining Tables", href: "/products?category=Dining Room&subcategory=Dining Tables" },
          { name: "Dining Chairs", href: "/products?category=Dining Room&subcategory=Dining Chairs" },
          { name: "Dining Stools", href: "/products?category=Dining Room&subcategory=Bar Stools" },
        ],
      },
      {
        heading: "Storage & Entertaining",
        items: [
          { name: "Accent Benches", href: "/products?category=Dining Room&subcategory=Accent Benches" },
          { name: "Hutches & Cabinets", href: "/products?category=Dining Room&subcategory=Hutches & Cabinets" },
          { name: "Bar Carts & Servers", href: "/products?category=Dining Room&subcategory=Bar Carts & Servers" },
          { name: "Shop All", href: "/products?category=Dining Room" },
        ],
      },
    ],
  },
  {
    name: "Mattresses",
    href: "/products?category=Bedroom&subcategory=Mattresses",
    columns: [
      {
        heading: "Shop by Size",
        items: [
          { name: "Twin & Twin XL", href: "/products?category=Bedroom&subcategory=Mattresses&size=Twin" },
          { name: "Full Mattresses", href: "/products?category=Bedroom&subcategory=Mattresses&size=Full" },
          { name: "Queen Mattresses", href: "/products?category=Bedroom&subcategory=Mattresses&size=Queen" },
          { name: "King Mattresses", href: "/products?category=Bedroom&subcategory=Mattresses&size=King" },
          { name: "Cali King", href: "/products?category=Bedroom&subcategory=Mattresses&size=CalKing" },
          { name: "Sheets & Pillows", href: "/products?category=Bedroom&subcategory=Bedding" },
        ],
      },
      {
        heading: "Shop by Brand",
        items: [
          { name: "Tempur-Pedic", href: "/products?category=Bedroom&subcategory=Mattresses&brand=Tempur-Pedic" },
          { name: "Beautyrest", href: "/products?category=Bedroom&subcategory=Mattresses&brand=Beautyrest" },
          { name: "Sealy", href: "/products?category=Bedroom&subcategory=Mattresses&brand=Sealy" },
          { name: "Serta", href: "/products?category=Bedroom&subcategory=Mattresses&brand=Serta" },
        ],
      },
      {
        heading: "Shop by Budget",
        items: [
          { name: "Under $599", href: "/products?category=Bedroom&subcategory=Mattresses&maxPrice=599" },
          { name: "Under $1,499", href: "/products?category=Bedroom&subcategory=Mattresses&maxPrice=1499" },
          { name: "Under $2,400", href: "/products?category=Bedroom&subcategory=Mattresses&maxPrice=2400" },
          { name: "Premium & Luxury", href: "/products?category=Bedroom&subcategory=Mattresses&minPrice=2400" },
        ],
      },
    ],
  },
  {
    name: "Kids & Teens",
    href: "/products?category=Kids & Teens",
    columns: [
      {
        items: [
          { name: "Kids Beds", href: "/products?category=Kids & Teens&subcategory=Kids Beds" },
          { name: "Bedroom Sets", href: "/products?category=Kids & Teens&subcategory=Bedroom Sets" },
          { name: "Bunks & Trundles", href: "/products?category=Kids & Teens&subcategory=Bunks & Trundles" },
          { name: "Loft Beds", href: "/products?category=Kids & Teens&subcategory=Loft Beds" },
        ],
      },
      {
        heading: "Storage & Study",
        items: [
          { name: "Dresser & Mirror", href: "/products?category=Kids & Teens&subcategory=Dressers" },
          { name: "Chests", href: "/products?category=Kids & Teens&subcategory=Chests" },
          { name: "Nightstands", href: "/products?category=Kids & Teens&subcategory=Nightstands" },
          { name: "Desks & Vanities", href: "/products?category=Kids & Teens&subcategory=Desks" },
        ],
      },
    ],
  },
  {
    name: "Home Office",
    href: "/products?category=Office",
    columns: [
      {
        items: [
          { name: "Desks", href: "/products?category=Office&subcategory=Desks" },
          { name: "Office Chairs", href: "/products?category=Office&subcategory=Office Chairs" },
          { name: "Bookcases", href: "/products?category=Office&subcategory=Bookcases" },
          { name: "File Cabinets", href: "/products?category=Office&subcategory=File Cabinets" },
          { name: "Shop All", href: "/products?category=Office" },
        ],
      },
    ],
  },
  {
    name: "Patio",
    href: "/products?category=Patio",
    columns: [
      {
        items: [
          { name: "Patio Sets", href: "/products?category=Patio&subcategory=Patio Sets" },
          { name: "Outdoor Seating", href: "/products?category=Patio&subcategory=Outdoor Seating" },
          { name: "Outdoor Tables", href: "/products?category=Patio&subcategory=Outdoor Tables" },
          { name: "Shop All", href: "/products?category=Patio" },
        ],
      },
    ],
  },
  {
    name: "Décor & Accessories",
    href: "/products?category=Accessories",
    columns: [
      {
        items: [
          { name: "Wall Art", href: "/products?category=Accessories&subcategory=Wall Art" },
          { name: "Rugs", href: "/products?category=Accessories&subcategory=Rugs" },
          { name: "Lighting", href: "/products?category=Accessories&subcategory=Lighting" },
          { name: "Pillows & Throws", href: "/products?category=Accessories&subcategory=Pillows & Throws" },
          { name: "Shop All", href: "/products?category=Accessories" },
        ],
      },
    ],
  },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileSubMenu(null);
  }, [location.pathname]);

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      role="banner"
    >
      {/* ===== TOP BANNER ===== */}
      <div className="bg-primary text-primary-foreground text-xs font-medium">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              <a href="tel:+18323080140" className="hover:text-accent transition-colors">
                (832) 308-0140
              </a>
              <span className="mx-1.5 text-primary-foreground/40">|</span>
              <Mail className="h-3 w-3" />
              <a href="mailto:info@curatedhomesource.com" className="hover:text-accent transition-colors">
                info@curatedhomesource.com
              </a>
            </div>
            <div className="hidden sm:block font-semibold tracking-wide">
              Financing & Payment Plans Available
            </div>
          </div>
        </div>
      </div>

      {/* ===== MID HEADER: Logo – Search – Actions ===== */}
      <div className={`bg-background border-b border-border/40 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="font-display text-xl lg:text-2xl font-bold tracking-tight text-foreground shrink-0" aria-label="Curated Home Source - Home">
              <span className="hidden sm:inline">Curated Home Source</span>
              <span className="sm:hidden">CHS</span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  placeholder="Search furniture, décor, and more..."
                  className="w-full rounded-full border-border/60 bg-muted/30 pl-10 pr-4 h-10 text-sm focus-visible:ring-accent"
                  onFocus={() => setSearchOpen(true)}
                  readOnly
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile search */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-muted text-foreground/70"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-muted text-foreground/70 hover:text-foreground gap-1.5">
                      <User className="h-4 w-4" />
                      <span className="hidden xl:inline text-xs">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.first_name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <User className="h-4 w-4 mr-2" />My Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                      <LogOut className="h-4 w-4 mr-2" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-full hover:bg-muted text-foreground/70 hover:text-foreground gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="hidden xl:inline text-xs">Sign In / Register</span>
                  </Button>
                </Link>
              )}

              <div className="hidden sm:block h-5 w-px bg-border/50" />

              {/* Wishlist */}
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted text-foreground/70 hover:text-foreground" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground border-2 border-background shadow-md">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart" aria-label={`Shopping cart with ${totalItems} items`}>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted text-foreground/70 hover:text-foreground">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-2 border-background shadow-md">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LOWER HEADER: Category Nav Bar ===== */}
      <div className="hidden lg:block bg-background border-b border-border/30">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-0" role="navigation" aria-label="Main navigation">
            {navCategories.map((cat) => (
              <div
                key={cat.name}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(cat.name)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={cat.href}
                  className={`flex items-center gap-1 px-3 xl:px-4 py-3 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                    activeDropdown === cat.name
                      ? "text-accent border-b-2 border-accent"
                      : "text-foreground/75 hover:text-foreground border-b-2 border-transparent"
                  }`}
                >
                  {cat.name}
                  {cat.columns && <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === cat.name ? "rotate-180" : ""}`} />}
                </Link>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* ===== DESKTOP MEGA-DROPDOWN ===== */}
      <AnimatePresence>
        {activeDropdown && navCategories.find((c) => c.name === activeDropdown)?.columns && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="hidden lg:block absolute left-0 right-0 bg-background shadow-xl border-b border-border/30 z-40"
            onMouseEnter={() => handleDropdownEnter(activeDropdown)}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="container mx-auto px-4 py-6">
              <div className={`grid gap-8 ${
                (navCategories.find((c) => c.name === activeDropdown)?.columns?.length ?? 1) >= 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
              } max-w-3xl`}>
                {navCategories
                  .find((c) => c.name === activeDropdown)
                  ?.columns?.map((col, idx) => (
                    <div key={idx}>
                      {col.heading && (
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          {col.heading}
                        </h4>
                      )}
                      <ul className="space-y-1.5">
                        {col.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              to={item.href}
                              className="block text-sm text-foreground/70 hover:text-accent transition-colors duration-150 py-0.5"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="max-h-[80vh] overflow-y-auto py-4 px-4 space-y-1">
              {navCategories.map((cat) => (
                <div key={cat.name}>
                  <button
                    onClick={() => {
                      if (cat.columns) {
                        setMobileSubMenu(mobileSubMenu === cat.name ? null : cat.name);
                      } else {
                        navigate(cat.href);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span>{cat.name}</span>
                    {cat.columns && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileSubMenu === cat.name ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  <AnimatePresence>
                    {mobileSubMenu === cat.name && cat.columns && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-2 space-y-3">
                          {cat.columns.map((col, idx) => (
                            <div key={idx}>
                              {col.heading && (
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-3">
                                  {col.heading}
                                </p>
                              )}
                              {col.items.map((item, i) => (
                                <Link
                                  key={i}
                                  to={item.href}
                                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-accent rounded-md transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Mobile bottom actions */}
              <div className="pt-4 mt-2 border-t border-border space-y-2">
                {user ? (
                  <div className="flex gap-2">
                    <Link to="/account" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <User className="mr-2 h-4 w-4" />Account
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full" size="sm">
                      <User className="mr-2 h-4 w-4" />Sign In / Register
                    </Button>
                  </Link>
                )}
                <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                  <a href="tel:+18323080140" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />(832) 308-0140
                  </a>
                  <a href="mailto:info@curatedhomesource.com" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />Email
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </motion.header>
  );
};
