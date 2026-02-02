import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Interior Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    text: "Absolutely stunning furniture quality! The attention to detail and craftsmanship is exceptional. My clients are always impressed with pieces from Curated Home Source.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Homeowner",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    text: "The Space Analyzer feature helped me completely transform my living room. The AI suggestions were spot-on and saved me weeks of decision-making!",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Real Estate Investor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    rating: 5,
    text: "I've furnished 12 properties with Curated Home Source. The bundle deals offer incredible value, and the furniture always arrives in perfect condition.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
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
    <section className="py-28 bg-muted/30 relative overflow-hidden" aria-labelledby="testimonials-heading">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-6">
            Client Stories
          </span>
          <h2 id="testimonials-heading" className="text-4xl md:text-6xl font-display font-bold mb-6">
            Loved by Thousands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Hear from our satisfied customers who transformed their homes
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={itemVariants}>
              <Card className="border-0 bg-card premium-card h-full relative overflow-hidden">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Quote className="h-5 w-5 text-accent" />
                </div>
                
                <CardContent className="p-8 pt-10">
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-accent text-accent"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-muted-foreground mb-8 leading-relaxed font-light text-lg">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border">
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="absolute inset-0 rounded-full ring-2 ring-accent/20 ring-offset-2 ring-offset-background" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-lg">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-12 lg:gap-24 mt-20 pt-12 border-t border-border"
        >
          {[
            { value: "15,000+", label: "Happy Customers" },
            { value: "4.9/5", label: "Average Rating" },
            { value: "50,000+", label: "5-Star Reviews" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-light">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
