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

export const Testimonials = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/40" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-14"
        >
          <span className="section-label mb-5">Testimonials</span>
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-5 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto font-light">
            Trusted by homeowners, designers, and property professionals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <div className="bg-white rounded-2xl p-7 border border-border/50 h-full flex flex-col hover:shadow-elevated transition-all duration-400">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-foreground/85 leading-relaxed font-light text-base italic flex-1 mb-6">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3 pt-5 border-t border-border">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-12 lg:gap-20 mt-16"
        >
          {[
            { value: "15,000+", label: "Happy Customers" },
            { value: "4.9", label: "Average Rating" },
            { value: "50,000+", label: "5-Star Reviews" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-light">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
