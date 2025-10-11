import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Collections } from "@/components/Collections";
import { BestSellers } from "@/components/BestSellers";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main className="pt-[88px]" role="main">
        <Hero />
        <Collections />
        <div id="bestsellers">
          <BestSellers />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
