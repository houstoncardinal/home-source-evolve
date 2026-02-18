import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-living-room.jpg";

export const Hero = () => {
  const { scrollY } = useScroll();
  const yImage = useTransform(scrollY, [0, 500], [0, -60]);
  const opacityOverlay = useTransform(scrollY, [0, 300], [0.55, 0.8]);

  return (
    <section
      className="relative min-h-[92vh] sm:min-h-screen flex items-center overflow-hidden bg-background"
      aria-label="Hero section"
    >
      {/* Parallax Image */}
      <motion.div className="absolute inset-0 z-0" style={{ y: yImage }}>
        <img
          src={heroImage}
          alt="Luxury modern living room with sophisticated furniture"
          className="w-full h-full object-cover scale-110"
          fetchPriority="high"
        />
        <motion.div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: opacityOverlay }}
        />
        {/* Warm gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/20" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="h-px w-8 bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Premium Furniture Collection
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-[1.05] tracking-[-0.02em]"
          >
            Furniture Built
            <br />
            <span className="text-accent">for Living Well</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg text-white/65 mb-10 leading-relaxed max-w-lg font-light"
          >
            Handpicked sofas, beds, dining sets and more from Happy Homes Industries.
            Quality craftsmanship delivered to your door.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Link to="/products" className="sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-base rounded-full group shadow-lg hover:shadow-xl transition-all duration-400 btn-shimmer"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/products?category=Living Room" className="sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-base rounded-full backdrop-blur-sm transition-all duration-400 hover:border-white/50"
              >
                Living Room
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex gap-8 sm:gap-14 mt-16 pt-8 border-t border-white/15"
          >
            {[
              { value: "500+", label: "Products" },
              { value: "15K+", label: "Customers" },
              { value: "4.9★", label: "Rating" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-0.5">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-white/45 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};
