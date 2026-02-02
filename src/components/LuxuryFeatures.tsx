import { motion } from "framer-motion";
import { Crown, Palette, Gem, Truck, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "Exclusive Collections",
    description: "Access to limited edition pieces and designer collaborations available only to our members.",
  },
  {
    icon: Palette,
    title: "Personal Design Consultation",
    description: "Complimentary 1-on-1 sessions with our expert interior designers to curate your perfect space.",
  },
  {
    icon: Gem,
    title: "Premium Materials",
    description: "Only the finest materials sourced globally – Italian leather, solid hardwoods, and artisan fabrics.",
  },
  {
    icon: Truck,
    title: "White Glove Delivery",
    description: "Professional delivery and installation with room placement and packaging removal.",
  },
  {
    icon: Shield,
    title: "Lifetime Warranty",
    description: "Our commitment to quality backed by comprehensive coverage on all premium pieces.",
  },
  {
    icon: Clock,
    title: "Priority Support",
    description: "Dedicated account manager available around the clock for all your needs.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
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
    <section className="py-28 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 text-accent text-sm font-medium rounded-full mb-6">
            <Crown className="h-4 w-4" />
            VIP Experience
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            The Luxury Difference
          </h2>
          <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto font-light">
            Experience furniture shopping reimagined with exclusive services designed for the discerning homeowner
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative p-8 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/10 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/30 group-hover:shadow-glow transition-all duration-500">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-display font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-primary-foreground/60 font-light leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative corner */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent/20 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full shadow-glow hover:shadow-[0_0_60px_-8px_hsl(38_85%_55%_/_0.6)] transition-all duration-500 btn-shimmer">
            <Crown className="h-5 w-5" />
            Join VIP Club
          </button>
          <p className="text-primary-foreground/50 text-sm mt-4">
            Free to join • No commitment • Instant benefits
          </p>
        </motion.div>
      </div>
    </section>
  );
};
