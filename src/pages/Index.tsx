import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Collections } from "@/components/Collections";
import { BestSellers } from "@/components/BestSellers";
import { ProductBundles } from "@/components/ProductBundles";
import { Testimonials } from "@/components/Testimonials";
import { TrustBadges } from "@/components/TrustBadges";
import { LuxuryFeatures } from "@/components/LuxuryFeatures";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen pb-20 lg:pb-0 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-20 top-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full" />
        <div className="absolute right-[-120px] top-40 w-[520px] h-[520px] bg-primary/10 blur-3xl rounded-full" />
      </div>
      <Header />
      <main role="main">
        <Hero />
        <div className="bg-gradient-to-b from-background via-background/70 to-muted/20">
          <TrustBadges />
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
