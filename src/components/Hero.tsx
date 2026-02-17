import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-living-room.jpg";

export const Hero = () => {
  const { scrollY } = useScroll();
  const ySlow = useTransform(scrollY, [0, 400], [0, -40]);
  const yFast = useTransform(scrollY, [0, 400], [0, -90]);

  return (
    <section className="relative min-h-[100vh] flex items-end overflow-hidden bg-background" aria-label="Hero section">
      {/* Parallax Layers */}
      <motion.div className="absolute inset-0 z-0" style={{ y: ySlow }}>
        <img
          src={heroImage}
          alt="Luxury modern living room with sophisticated furniture"
          className="w-full h-full object-cover scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </motion.div>
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: yFast }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute -left-24 top-10 w-[520px] h-[520px] bg-accent/25 blur-3xl rounded-full" />
        <div className="absolute right-[-180px] bottom-0 w-[420px] h-[420px] bg-white/10 blur-3xl rounded-full" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20 md:pb-28 pt-32">
        <div className="max-w-4xl">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 mb-8"
          >
            <Minus className="h-4 w-8 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Premium Furniture Collection
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold text-white mb-8 leading-[1.02] tracking-[-0.02em]"
          >
            Furniture Built
            <br />
            for Living Well
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/65 mb-12 leading-relaxed max-w-xl font-light"
          >
            Handpicked sofas, beds, dining sets and more from Happy Homes Industries.
            Quality craftsmanship delivered to your door.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link to="/products">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-semibold px-10 py-7 text-base rounded-full group shadow-lg hover:shadow-xl transition-all duration-500 btn-shimmer"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/products?category=Living Room">
              <Button
                size="lg"
                className="border border-white/25 bg-black/30 hover:bg-white/10 hover:border-white/40 text-white px-10 py-7 text-base rounded-full backdrop-blur-sm transition-all duration-500"
              >
                Living Room
              </Button>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex gap-10 sm:gap-16 mt-20 pt-8 border-t border-white/15"
          >
            {[
              { value: "500+", label: "Products" },
              { value: "15K+", label: "Customers" },
              { value: "4.9", label: "Rating" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl md:text-3xl font-display font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-xs text-white/45 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-3"
      >
        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] [writing-mode:vertical-lr]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent relative overflow-hidden">
          <motion.div
            className="w-full h-4 bg-accent"
            animate={{ y: [-16, 48] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};
