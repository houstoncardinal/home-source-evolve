import { motion } from "framer-motion";
import { Truck, Shield, Clock, Palette, Gem, Headphones } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Premium Materials",
    description: "Solid hardwoods, Italian leather, and artisan fabrics sourced from the finest suppliers worldwide.",
  },
  {
    icon: Palette,
    title: "Design Consultation",
    description: "Complimentary sessions with our interior designers to curate spaces that feel uniquely yours.",
  },
  {
    icon: Truck,
    title: "White Glove Delivery",
    description: "Professional delivery with room placement, assembly, and packaging removal — all included.",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Every piece is backed by our comprehensive warranty and hassle-free return policy.",
  },
  {
    icon: Clock,
    title: "Quick Turnaround",
    description: "Most in-stock items ship within days, not weeks. Track your order every step of the way.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Our team is available to help with orders, styling advice, and after-sale care.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export const LuxuryFeatures = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.16),transparent_34%)]" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-accent/15 via-transparent to-transparent blur-3xl" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <span className="section-label mb-6 text-primary-foreground/80 border-primary-foreground/15 bg-primary-foreground/5">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-5">
            The Difference Is in the Details
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto font-light leading-relaxed">
            From material selection to doorstep delivery, every step is designed around you
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-stretch">
          <CardHighlight />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-6 rounded-xl border border-primary-foreground/15 bg-primary/60 backdrop-blur-sm hover:border-accent/50 transition-colors duration-400 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <feature.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/50">Premium</span>
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/60 font-light leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CardHighlight = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="relative overflow-hidden rounded-2xl border border-primary-foreground/10 bg-primary/50 backdrop-blur-sm p-10 flex flex-col justify-between shadow-[0_40px_120px_-60px_rgba(0,0,0,0.6)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-accent/30 blur-3xl" />
      <div className="relative z-10 space-y-6">
        <p className="text-xs uppercase tracking-[0.28em] text-primary-foreground/60">Signature care</p>
        <h3 className="text-3xl md:text-4xl font-display font-semibold leading-tight">
          Concierge-level service for every project
        </h3>
        <p className="text-primary-foreground/65 font-light leading-relaxed max-w-xl">
          Dedicated specialists manage sourcing, styling, delivery, and installation—ensuring a seamless experience from first moodboard to final placement.
        </p>
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-3 gap-5 text-left">
        {[
          { label: "Avg. delivery", value: "5-9 days" },
          { label: "Projects served", value: "2,800+" },
          { label: "On-time rate", value: "97%" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10">
            <div className="text-sm text-primary-foreground/60 uppercase tracking-[0.14em] mb-1">
              {stat.label}
            </div>
            <div className="text-xl font-semibold text-primary-foreground">{stat.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
