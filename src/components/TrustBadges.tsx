import { Shield, Truck, Award, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Truck, title: "Free White Glove Delivery", description: "On orders over $2,000" },
  { icon: Shield, title: "Secure Checkout", description: "SSL encrypted payments" },
  { icon: Award, title: "Quality Guarantee", description: "Premium craftsmanship" },
  { icon: HeadphonesIcon, title: "Expert Support", description: "Dedicated assistance" },
];

export const TrustBadges = () => {
  return (
    <section className="py-6 bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground border-b border-white/5 shadow-2xl -mt-px">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-nowrap items-center justify-between gap-3"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className="flex items-center gap-2.5 whitespace-nowrap"
            >
              <div className="relative">
                <badge.icon className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <div className="absolute -inset-1 bg-accent/20 blur-sm rounded-full" />
              </div>
              <span className="text-[11px] font-semibold tracking-wide">{badge.title}</span>
              <span className="text-[10px] text-primary-foreground/50 hidden lg:inline">{badge.description}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
