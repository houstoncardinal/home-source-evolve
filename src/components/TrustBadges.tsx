import { Shield, Truck, Award, HeadphonesIcon, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  {
    icon: Shield,
    title: "Secure Checkout",
    description: "256-bit SSL encryption",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $500",
  },
  {
    icon: Award,
    title: "5-Year Warranty",
    description: "Premium protection",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Concierge",
    description: "White glove service",
  },
  {
    icon: Gift,
    title: "Gift Wrapping",
    description: "Complimentary",
  },
  {
    icon: Sparkles,
    title: "Exclusive Access",
    description: "Members only sales",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-12 bg-secondary/50 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors duration-300">
                <badge.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
