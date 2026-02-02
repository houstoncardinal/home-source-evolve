import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const footerLinks = {
  shop: [
    { name: "All Collections", href: "/products" },
    { name: "Living Room", href: "/products?category=Living Room" },
    { name: "Bedroom", href: "/products?category=Bedroom" },
    { name: "Dining Room", href: "/products?category=Dining Room" },
    { name: "Office", href: "/products?category=Office" },
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
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary-foreground/10 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary-foreground/10 to-transparent" />
      
      <div className="container mx-auto px-4 py-20 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block">
              <h3 className="text-2xl font-display font-bold mb-6">Curated Home Source</h3>
            </Link>
            <p className="text-primary-foreground/70 mb-8 leading-relaxed font-light max-w-sm">
              Elevate your living space with our curated collection of premium
              furniture. Where timeless elegance meets contemporary design.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-sm">123 Design District, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-sm">+1 (888) 555-0123</span>
              </div>
            </div>

            {/* Social Links */}
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

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-6 text-lg">Shop</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/60 hover:text-accent transition-colors duration-300 text-sm font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-6 text-lg">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/60 hover:text-accent transition-colors duration-300 text-sm font-light"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-6 text-lg">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/60 hover:text-accent transition-colors duration-300 text-sm font-light"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-6 text-lg flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              Newsletter
            </h4>
            <p className="text-primary-foreground/60 mb-4 text-sm font-light">
              Subscribe for exclusive offers and design inspiration.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent"
              />
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold btn-shimmer group">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © 2024 Curated Home Source. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
