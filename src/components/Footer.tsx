import { Facebook, Instagram, Twitter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const footerLinks = {
  shop: [
    { name: "All Collections", href: "/products" },
    { name: "Living Room", href: "/products?category=Living Room" },
    { name: "Bedroom", href: "/products?category=Bedroom" },
    { name: "Dining Room", href: "/products?category=Dining Room" },
    { name: "Office", href: "/products?category=Office" },
    { name: "Accessories", href: "/products?category=Accessories" },
  ],
  company: [
    { name: "Our Story", href: "#about" },
    { name: "Sustainability", href: "#sustainability" },
    { name: "Careers", href: "#careers" },
    { name: "Press", href: "#press" },
  ],
  support: [
    { name: "Shipping & Returns", href: "#shipping" },
    { name: "Care Guide", href: "#care" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact Us", href: "#contact" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.16),transparent_34%)]" />
      <div className="container mx-auto px-4 relative">
        {/* Newsletter Bar */}
        <div className="py-10 border border-primary-foreground/10 rounded-2xl px-6 md:px-10 bg-primary/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.6)]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary-foreground/60 mb-2">Join the list</p>
            <h3 className="font-display text-2xl font-semibold mb-1">Design dispatches and private offers</h3>
            <p className="text-primary-foreground/55 text-sm font-light">One concise email each week. No spam.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              type="email"
              placeholder="Your email"
              className="bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent w-full md:w-72"
            />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-6 shrink-0 rounded-full">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/" className="inline-block">
              <h4 className="text-xl font-display font-bold">Curated Home Source</h4>
            </Link>
            <p className="text-primary-foreground/55 text-sm font-light leading-relaxed max-w-xs">
              Furniture crafted for modern luxury—thoughtful materials, meticulous finishes, and timeless silhouettes.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <Button
                  key={index}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 rounded-full hover:bg-primary-foreground/10 hover:text-accent transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70 mb-5">Shop</h5>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/55 hover:text-primary-foreground transition-colors duration-300 text-sm font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70 mb-5">Company</h5>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/55 hover:text-primary-foreground transition-colors duration-300 text-sm font-light"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70 mb-5">Support</h5>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/55 hover:text-primary-foreground transition-colors duration-300 text-sm font-light"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Curated Home Source. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
