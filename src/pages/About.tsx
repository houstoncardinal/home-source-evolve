import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Award, Users, Heart, Truck, Star, Shield, Clock, Leaf } from "lucide-react";

const stats = [
  { value: "15K+", label: "Happy Customers" },
  { value: "500+", label: "Premium Products" },
  { value: "10+", label: "Years Experience" },
  { value: "4.9", label: "Average Rating" },
];

const values = [
  {
    icon: Award,
    title: "Uncompromising Quality",
    description: "We partner only with the finest furniture manufacturers who share our commitment to exceptional craftsmanship and durable materials."
  },
  {
    icon: Heart,
    title: "Customer-Centric Approach",
    description: "Every decision we make is guided by what benefits our customers. Your satisfaction is not just our goal—it's our guarantee."
  },
  {
    icon: Shield,
    title: "Trusted Expertise",
    description: "With over a decade of experience in luxury furniture, our team provides knowledgeable guidance to help you find perfect pieces."
  },
  {
    icon: Truck,
    title: "White Glove Service",
    description: "From selection to delivery, we ensure a seamless experience with our premium white glove delivery service."
  }
];

const timeline = [
  { year: "2016", title: "Founded", description: "Started with a vision to transform how people shop for luxury furniture" },
  { year: "2018", title: "Expansion", description: "Expanded our collection to include 200+ premium furniture brands" },
  { year: "2020", title: "Digital Innovation", description: "Launched our online platform with virtual room consultation services" },
  { year: "2022", title: "National Reach", description: "Served over 10,000 customers across the United States" },
  { year: "2024", title: "Industry Leader", description: "Recognized as one of the top luxury furniture retailers in America" },
  { year: "2026", title: "Continued Growth", description: "Expanding our collection with sustainable and smart furniture options" },
];

const team = [
  { name: "James Mitchell", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop" },
  { name: "Sarah Chen", role: "Head of Curation", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" },
  { name: "Michael Roberts", role: "Design Director", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
  { name: "Emily Watson", role: "Customer Experience", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Crafting Beautiful
              <span className="text-accent"> Homes</span> Since 2016
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We believe that furniture is more than just functional pieces—it's the foundation of 
              meaningful living spaces where memories are made and comfort is cherished.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/70 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                To Transform Houses Into
                <span className="text-accent"> Dream Homes</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At Curated Home Source, we believe that everyone deserves to live in a space that 
                  reflects their style and values their comfort. Since 2016, we've been dedicated to 
                  sourcing the finest furniture from around the world.
                </p>
                <p>
                  Our curated collection represents the perfect balance of timeless elegance, modern 
                  functionality, and exceptional value. We work directly with master craftsmen and 
                  renowned manufacturers to bring you pieces that stand the test of time.
                </p>
                <p>
                  More than just a furniture store, we've become a trusted partner in our customers' 
                  journey to create homes that inspire and comfort. Every piece we offer is selected 
                  with your satisfaction and the longevity of your investment in mind.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop" 
                  alt="Luxury interior"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <p className="text-sm text-muted-foreground">Based on 15,000+ customer reviews</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Our Core Values
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              A Decade of Excellence
            </h2>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex gap-6 pb-10 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.year}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-full bg-border mt-4" />
                  )}
                </div>
                <div className="pb-10 last:pb-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Meet the People Behind Our Success
            </h2>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/5]">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-accent">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Ready to Transform Your Home?
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Browse our curated collection of premium furniture or get in touch with our 
              design consultants for personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/products" 
                className="inline-flex items-center justify-center px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-accent/25"
              >
                Shop Collection
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:bg-white/10 text-white font-semibold rounded-full transition-all"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
