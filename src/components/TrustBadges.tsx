import { Shield, Truck, Award, HeadphonesIcon, Star } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Truck, title: "Free White Glove Delivery", description: "Orders over $2,000" },
  { icon: Shield, title: "Secure Checkout", description: "SSL encrypted" },
  { icon: Award, title: "Quality Guarantee", description: "Premium craftsmanship" },
  { icon: Star, title: "4.9★ Rated", description: "15,000+ happy customers" },
  { icon: HeadphonesIcon, title: "Expert Support", description: "7 days a week" },
];

export const TrustBadges = () => {
  return (
    <section className="py-5 bg-white border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <badge.icon className="h-4 w-4 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">{badge.title}</p>
                <p className="text-[10px] text-muted-foreground">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
