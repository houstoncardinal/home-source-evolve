import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const styleQuestions = [
  { id: "modern", label: "Modern & Minimalist", icon: "✨" },
  { id: "traditional", label: "Traditional & Classic", icon: "🏛️" },
  { id: "rustic", label: "Rustic & Cozy", icon: "🌲" },
  { id: "contemporary", label: "Contemporary & Chic", icon: "💎" },
  { id: "industrial", label: "Industrial & Urban", icon: "🏭" },
  { id: "bohemian", label: "Bohemian & Eclectic", icon: "🌸" },
];

const colorPalettes = [
  { id: "neutral", label: "Neutral & Warm", colors: ["#F5F5F0", "#D4C5B9", "#8B7E74"] },
  { id: "bold", label: "Bold & Vibrant", colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"] },
  { id: "cool", label: "Cool & Serene", colors: ["#A8DADC", "#457B9D", "#1D3557"] },
  { id: "earth", label: "Earth Tones", colors: ["#C9ADA7", "#9A8C98", "#6B4E71"] },
];

const suggestions = [
  {
    id: 1,
    name: "Living Room Luxury Bundle",
    description: "Complete modern living room set with sofa, coffee table, and accent chairs",
    price: 2499.99,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    items: ["Velvet Sofa", "Glass Coffee Table", "2x Accent Chairs", "Area Rug"],
    savings: 15,
  },
  {
    id: 2,
    name: "Bedroom Serenity Collection",
    description: "Transform your bedroom into a peaceful retreat",
    price: 1899.99,
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
    items: ["Platform Bed", "2x Nightstands", "Dresser", "Premium Mattress"],
    savings: 20,
  },
  {
    id: 3,
    name: "Dining Elegance Package",
    description: "Entertain in style with this complete dining set",
    price: 1699.99,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
    items: ["Dining Table", "6x Dining Chairs", "Buffet Cabinet", "Lighting Fixture"],
    savings: 18,
  },
];

export default function SpaceAnalyzer() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({
          title: "Image uploaded!",
          description: "Your space photo has been processed.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyle((prev) =>
      prev.includes(styleId)
        ? prev.filter((s) => s !== styleId)
        : [...prev, styleId]
    );
  };

  const handleAnalyze = () => {
    if (!uploadedImage) {
      toast({
        title: "Image required",
        description: "Please upload a photo of your space first.",
        variant: "destructive",
      });
      return;
    }
    if (selectedStyle.length === 0) {
      toast({
        title: "Style required",
        description: "Please select at least one style preference.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedPalette) {
      toast({
        title: "Color palette required",
        description: "Please select a color palette.",
        variant: "destructive",
      });
      return;
    }

    setShowSuggestions(true);
    toast({
      title: "✨ Analysis complete!",
      description: "We've curated perfect furniture suggestions for your space.",
    });
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main className="pt-[88px]" role="main">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-accent/5 via-background to-accent/10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-semibold px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Design Assistant
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Design Your Perfect Space
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Upload a photo of your room, answer a few style questions, and let our AI recommend
                the perfect furniture pieces and bundles tailored to your unique space.
              </p>
            </div>
          </div>
        </section>

        {/* Upload & Analysis Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Image Upload */}
              <Card className="border-2 border-dashed border-border hover:border-accent transition-colors duration-300 shadow-lg animate-fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload className="h-6 w-6 text-accent" />
                    Step 1: Upload Your Space
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="space-upload"
                    />
                    <label
                      htmlFor="space-upload"
                      className="flex flex-col items-center justify-center min-h-[300px] cursor-pointer rounded-lg border-2 border-dashed border-accent/30 hover:border-accent bg-accent/5 hover:bg-accent/10 transition-all duration-300"
                    >
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Your space"
                          className="max-h-[400px] rounded-lg shadow-xl"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Upload className="h-16 w-16 text-accent mx-auto mb-4" />
                          <p className="text-lg font-semibold mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Style Selection */}
              <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <CardTitle className="text-2xl">Step 2: Choose Your Style</CardTitle>
                  <p className="text-muted-foreground">Select one or more styles that resonate with you</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {styleQuestions.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedStyle.includes(style.id)
                            ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]"
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        }`}
                      >
                        <div className="text-3xl mb-2">{style.icon}</div>
                        <div className="font-semibold">{style.label}</div>
                        {selectedStyle.includes(style.id) && (
                          <Check className="h-5 w-5 text-accent absolute top-2 right-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Color Palette */}
              <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "200ms" }}>
                <CardHeader>
                  <CardTitle className="text-2xl">Step 3: Select Color Palette</CardTitle>
                  <p className="text-muted-foreground">Pick a color scheme for your furniture</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.id}
                        onClick={() => setSelectedPalette(palette.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          selectedPalette === palette.id
                            ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]"
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        }`}
                      >
                        <div className="flex gap-2 mb-3">
                          {palette.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="font-semibold">{palette.label}</div>
                        {selectedPalette === palette.id && (
                          <Check className="h-5 w-5 text-accent absolute top-4 right-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analyze Button */}
              <div className="text-center animate-fade-up" style={{ animationDelay: "300ms" }}>
                <Button
                  onClick={handleAnalyze}
                  size="lg"
                  className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-bold text-lg px-12 py-7 shadow-[0_8px_30px_rgba(var(--accent),0.3)] hover:shadow-[0_12px_40px_rgba(var(--accent),0.4)] transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-6 w-6" />
                  Analyze My Space & Get Suggestions
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Suggestions Section */}
        {showSuggestions && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <Badge className="mb-4 bg-accent text-accent-foreground font-semibold px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Personalized For You
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    Your Perfect Furniture Bundles
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Curated selections that match your style, space, and color preferences
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {suggestions.map((bundle, index) => (
                    <Card
                      key={bundle.id}
                      className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-scale-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-64 overflow-hidden bg-muted">
                        <img
                          src={bundle.image}
                          alt={bundle.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold px-3 py-1">
                          Save {bundle.savings}%
                        </Badge>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                          {bundle.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {bundle.description}
                        </p>

                        <div className="mb-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Includes:
                          </p>
                          <ul className="space-y-1">
                            {bundle.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-center">
                                <Check className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <span className="text-3xl font-bold text-primary">
                              ${bundle.price}
                            </span>
                            <p className="text-xs text-muted-foreground">Complete bundle</p>
                          </div>
                          <Link to="/products">
                            <Button
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              View Bundle
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
