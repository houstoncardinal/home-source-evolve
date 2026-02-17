import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Collections } from "@/components/Collections";
import { BestSellers } from "@/components/BestSellers";
import { ProductBundles } from "@/components/ProductBundles";
import { Testimonials } from "@/components/Testimonials";
import { TrustBadges } from "@/components/TrustBadges";
import { LuxuryFeatures } from "@/components/LuxuryFeatures";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const trustIndicators = [
  { value: "500+", label: "Premium Products" },
  { value: "15K+", label: "Happy Customers" },
  { value: "4.9", label: "Average Rating" },
  { value: "10yr", label: "Warranty Available" },
];

const Index = () => {
  return (
    <div className="min-h-screen pb-20 lg:pb-0 bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-20 top-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full" />
        <div className="absolute right-[-120px] top-40 w-[520px] h-[520px] bg-primary/10 blur-3xl rounded-full" />
      </div>
      <Header />
      <main role="main">
        <Hero />
        
        {/* Trust indicators ribbon */}
        <div className="bg-gradient-to-b from-background to-muted/10 relative z-10">
          <TrustBadges />
          
          {/* Floating trust stats bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md border-b border-border/30 shadow-sm"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                {trustIndicators.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-display font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <Collections />
        </div>
        
        <div id="bestsellers" className="bg-background/90">
          <BestSellers />
        </div>
        
        <LuxuryFeatures />
        
        <div className="bg-gradient-to-b from-muted/20 via-background to-background">
          <ProductBundles />
          <Testimonials />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
