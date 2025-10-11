import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Collections } from "@/components/Collections";
import { BestSellers } from "@/components/BestSellers";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-[88px]">
        <Hero />
        <Collections />
        <BestSellers />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
