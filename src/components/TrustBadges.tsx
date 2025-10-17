import { Shield, Truck, Award, HeadphonesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const badges = [
  {
    icon: Shield,
    title: "Secure Checkout",
    description: "256-bit SSL encryption protects your data",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $500 nationwide",
  },
  {
    icon: Award,
    title: "5-Year Warranty",
    description: "Premium protection on all furniture",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Expert help whenever you need it",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <Card
              key={index}
              className="border-0 bg-card/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4 shadow-[0_0_20px_rgba(var(--accent),0.15)]">
                  <badge.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
