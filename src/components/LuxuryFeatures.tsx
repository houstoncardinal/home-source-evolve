import { motion } from "framer-motion";
import { Truck, Shield, Clock, Palette, Gem, Headphones } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Premium Materials",
    description: "Solid hardwoods, Italian leather, and artisan fabrics sourced from the finest suppliers.",
  },
  {
    icon: Palette,
    title: "Design Consultation",
    description: "Complimentary sessions with our interior designers to curate spaces uniquely yours.",
  },
  {
    icon: Truck,
    title: "White Glove Delivery",
    description: "Professional delivery with room placement, assembly, and packaging removal included.",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Every piece backed by our comprehensive warranty and hassle-free return policy.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most in-stock items ship within days. Track your order every step of the way.",
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
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export const LuxuryFeatures = () => {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-14"
        >
          <span className="section-label mb-5">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-5 mb-4">
            The Difference Is in the Details
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
            From material selection to doorstep delivery, every step is designed around you
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group p-7 rounded-2xl border border-border/60 bg-background hover:border-accent/30 hover:bg-secondary/30 transition-all duration-400"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors duration-300">
                <feature.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-light leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 p-8 rounded-2xl bg-secondary/50 border border-border/50"
        >
          {[
            { value: "500+", label: "Premium Products" },
            { value: "15K+", label: "Happy Customers" },
            { value: "4.9★", label: "Average Rating" },
            { value: "10yr", label: "Warranty Available" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
