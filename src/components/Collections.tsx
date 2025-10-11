import { Card } from "@/components/ui/card";
import diningImage from "@/assets/dining-collection.jpg";
import bedroomImage from "@/assets/bedroom-collection.jpg";
import officeImage from "@/assets/office-collection.jpg";
import patioImage from "@/assets/patio-collection.jpg";
import kitchenImage from "@/assets/kitchen-collection.jpg";

const collections = [
  {
    title: "Dining Rooms",
    description: "Gather in style",
    image: diningImage,
    id: "dining",
  },
  {
    title: "Bedrooms",
    description: "Rest in luxury",
    image: bedroomImage,
    id: "bedrooms",
  },
  {
    title: "Home Office",
    description: "Work with elegance",
    image: officeImage,
    id: "office",
  },
  {
    title: "Patio",
    description: "Outdoor comfort",
    image: patioImage,
    id: "patio",
  },
  {
    title: "Kitchen",
    description: "Cook in beauty",
    image: kitchenImage,
    id: "kitchen",
  },
];

export const Collections = () => {
  return (
    <section id="collections" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Curated Collections
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thoughtfully designed furniture for every room in your home
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <Card
              key={collection.id}
              id={collection.id}
              className="group relative overflow-hidden bg-card border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={collection.image}
                  alt={`${collection.title} furniture collection`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold mb-2">{collection.title}</h3>
                  <p className="text-sm text-primary-foreground/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {collection.description}
                  </p>
                  <div className="inline-flex items-center text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    Explore Collection
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
