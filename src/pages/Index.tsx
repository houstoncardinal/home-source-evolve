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
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main role="main">
        <Hero />
        <TrustBadges />
        <Collections />
        <div id="bestsellers">
          <BestSellers />
        </div>
        <LuxuryFeatures />
        <ProductBundles />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
