import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import diningImage from "@/assets/dining-collection.jpg";
import bedroomImage from "@/assets/bedroom-collection.jpg";
import officeImage from "@/assets/office-collection.jpg";
import patioImage from "@/assets/patio-collection.jpg";
import kitchenImage from "@/assets/kitchen-collection.jpg";

const collections = [
  {
    title: "Dining Rooms",
    description: "Where memories are made",
    image: diningImage,
    id: "dining",
    category: "Dining Room",
    featured: true,
  },
  {
    title: "Bedrooms",
    description: "Your sanctuary of rest",
    image: bedroomImage,
    id: "bedrooms",
    category: "Bedroom",
    featured: false,
  },
  {
    title: "Home Office",
    description: "Productivity meets elegance",
    image: officeImage,
    id: "office",
    category: "Office",
    featured: false,
  },
  {
    title: "Patio",
    description: "Outdoor luxury living",
    image: patioImage,
    id: "patio",
    category: "Patio",
    featured: false,
  },
  {
    title: "Kitchen",
    description: "The heart of your home",
    image: kitchenImage,
    id: "kitchen",
    category: "Kitchen",
    featured: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export const Collections = () => {
  return (
    <section id="collections" className="py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-6">
            Curated Spaces
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 gold-underline inline-block">
            Collections
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Discover thoughtfully designed furniture for every room in your home
          </p>
        </motion.div>

        {/* Collections Grid - Asymmetric Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              className={index === 0 ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
            >
              <Link to={`/products?category=${collection.category}`}>
                <Card
                  className={`group relative overflow-hidden bg-card border-0 cursor-pointer premium-card ${
                    index === 0 ? "h-[500px] lg:h-full" : "h-72 lg:h-80"
                  }`}
                >
                  {/* Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={collection.image}
                      alt={`${collection.title} furniture collection`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-primary-foreground">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Explore
                      </span>
                      <h3 className={`font-display font-bold mb-3 ${index === 0 ? "text-4xl lg:text-5xl" : "text-2xl lg:text-3xl"}`}>
                        {collection.title}
                      </h3>
                      <p className="text-sm text-primary-foreground/70 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-xs">
                        {collection.description}
                      </p>
                      <div className="inline-flex items-center gap-2 text-accent font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                        <span>View Collection</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  {/* Corner Accent */}
                  {index === 0 && (
                    <div className="absolute top-6 right-6 px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-full shadow-glow">
                      Featured
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
