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
    { name: "Our Story", href: "/about" },
    { name: "Sustainability", href: "#sustainability" },
    { name: "Careers", href: "#careers" },
    { name: "Press", href: "#press" },
  ],
  support: [
    { name: "Shipping & Returns", href: "#shipping" },
    { name: "Care Guide", href: "#care" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact Us", href: "/contact" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background pt-16 pb-10 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Newsletter */}
        <div className="py-10 border border-white/10 rounded-2xl px-6 md:px-10 bg-white/5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-14">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/50 mb-2">Join the list</p>
            <h3 className="font-display text-2xl font-semibold mb-1 text-background">Design dispatches & private offers</h3>
            <p className="text-white/50 text-sm font-light">One concise email each week. No spam.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="bg-white/5 border-white/15 text-background placeholder:text-white/30 focus:border-accent w-full md:w-72"
            />
            <Button className="bg-accent hover:bg-accent/90 text-white font-medium px-6 shrink-0 rounded-full">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 pb-14">
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/">
              <h4 className="text-xl font-display font-bold text-background">Curated Home Source</h4>
            </Link>
            <p className="text-white/50 text-sm font-light leading-relaxed max-w-xs">
              Furniture crafted for modern living — thoughtful materials, meticulous finishes, and timeless silhouettes.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <Button
                  key={index}
                  size="icon"
                  variant="ghost"
                  className="w-9 h-9 rounded-full hover:bg-white/10 hover:text-accent text-white/60 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {[
            { title: "Shop", links: footerLinks.shop },
            { title: "Company", links: footerLinks.company },
            { title: "Support", links: footerLinks.support },
          ].map((col) => (
            <div key={col.title}>
              <h5 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-5">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/55 hover:text-white transition-colors duration-200 text-sm font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Curated Home Source. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
