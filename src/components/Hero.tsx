import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroChsBrand from "@/assets/hero-chs-brand.jpg";
import heroPromo from "@/assets/hero-promo.jpg";
import heroHouston from "@/assets/hero-houston.jpg";

const slides = [
  {
    image: heroChsBrand,
    alt: "Curated Home Source luxury furniture showroom",
    label: "Curated Home Source",
    heading: "Furniture Built\nfor Living Well",
    subheading: "Handpicked sofas, beds, dining sets and more. Quality craftsmanship delivered to your door.",
    cta: { text: "Shop Collection", href: "/products" },
    ctaSecondary: { text: "Living Room", href: "/products?category=Living Room" },
  },
  {
    image: heroPromo,
    alt: "Premium bedroom furniture sale",
    label: "Limited Time Offer",
    heading: "Up to 40% Off\nBedroom Sets",
    subheading: "Transform your bedroom with our premium collection. Complete sets including bed, dresser, mirror & nightstand.",
    cta: { text: "Shop Bedroom", href: "/products?category=Bedroom" },
    ctaSecondary: { text: "View All Deals", href: "/products" },
  },
  {
    image: heroHouston,
    alt: "Houston Texas skyline at sunset",
    label: "Proudly Serving Houston",
    heading: "Houston's Home\nFurniture Destination",
    subheading: "Locally owned and operated. Free delivery across the Greater Houston area on qualifying orders.",
    cta: { text: "Shop Now", href: "/products" },
    ctaSecondary: { text: "Contact Us", href: "/contact" },
  },
];

export const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-advance every 6s
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden bg-background" aria-label="Hero section">
      {/* Background slides */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 z-0"
        >
          <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-14 md:pb-20 pt-40 md:pt-48">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-accent" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  {slide.label}
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-[1.05] tracking-[-0.02em] whitespace-pre-line">
                {slide.heading}
              </h1>

              {/* Subheading */}
              <p className="text-base md:text-lg text-white/60 mb-10 leading-relaxed max-w-xl font-light">
                {slide.subheading}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link to={slide.cta.href}>
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-sm rounded-full group shadow-lg hover:shadow-xl transition-all duration-500 btn-shimmer"
                  >
                    {slide.cta.text}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to={slide.ctaSecondary.href}>
                  <Button
                    size="lg"
                    className="border border-white/25 bg-black/30 hover:bg-white/10 hover:border-white/40 text-white px-8 py-6 text-sm rounded-full backdrop-blur-sm transition-all duration-500"
                  >
                    {slide.ctaSecondary.text}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide controls */}
        <div className="flex items-center justify-between mt-12">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current ? "w-8 bg-accent" : "w-3 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
