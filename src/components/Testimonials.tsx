import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Interior Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    text: "The attention to detail and craftsmanship is exceptional. My clients are always impressed with pieces from Curated Home Source.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Homeowner",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    text: "Transformed my entire living room with their help. The design consultation was invaluable — everything fits perfectly.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Real Estate Investor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    rating: 5,
    text: "I've furnished 12 properties with CHS. The bundle deals offer incredible value, and delivery is always seamless.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export const Testimonials = () => {
  return (
    <section className="py-24 lg:py-32 bg-muted/20" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <span className="section-label mb-6">Testimonials</span>
          <h2 id="testimonials-heading" className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
            Trusted by homeowners, designers, and property professionals
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={itemVariants}>
              <Card className="border border-border/70 bg-card premium-card h-full shadow-[0_24px_70px_-48px_rgba(0,0,0,0.45)]">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-accent text-accent"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Verified</span>
                  </div>

                  <p className="text-foreground mb-8 leading-relaxed font-light text-lg italic">
                    “{testimonial.text}”
                  </p>

                  <div className="flex items-center gap-3 pt-6 border-t border-border mt-auto">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-16 lg:gap-24 mt-16"
        >
          {[
            { value: "15,000+", label: "Happy Customers" },
            { value: "4.9", label: "Average Rating" },
            { value: "50,000+", label: "5-Star Reviews" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-light">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
