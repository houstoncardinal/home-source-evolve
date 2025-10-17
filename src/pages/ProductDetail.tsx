import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, Check, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Pick<Database["public"]["Tables"]["product_images"]["Row"], "url" | "alt_text">;
type ProductColor = Database["public"]["Tables"]["product_colors"]["Row"];
type ProductTexture = Database["public"]["Tables"]["product_textures"]["Row"];
type ProductVariation = Database["public"]["Tables"]["product_variations"]["Row"];
type ProductFeature = Pick<Database["public"]["Tables"]["product_features"]["Row"], "feature">;

type Dimensions = {
  width?: string;
  height?: string;
  depth?: string;
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [textures, setTextures] = useState<ProductTexture[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchProductData();
    }
  }, [slug]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch images
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("url, alt_text")
        .eq("product_id", productData.id)
        .order("display_order");
      setImages(imagesData || []);

      // Fetch colors
      const { data: colorsData } = await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", productData.id)
        .order("display_order");
      if (colorsData && colorsData.length > 0) {
        setColors(colorsData);
        setSelectedColor(colorsData[0].id);
      }

      // Fetch textures
      const { data: texturesData } = await supabase
        .from("product_textures")
        .select("*")
        .eq("product_id", productData.id)
        .order("display_order");
      if (texturesData && texturesData.length > 0) {
        setTextures(texturesData);
        setSelectedTexture(texturesData[0].id);
      }

      // Fetch variations
      const { data: variationsData } = await supabase
        .from("product_variations")
        .select("*")
        .eq("product_id", productData.id)
        .order("display_order");
      if (variationsData && variationsData.length > 0) {
        setVariations(variationsData);
        setSelectedVariation(variationsData[0].id);
      }

      // Fetch features
      const { data: featuresData } = await supabase
        .from("product_features")
        .select("feature")
        .eq("product_id", productData.id)
        .order("display_order");
      setFeatures(featuresData || []);

    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (): number => {
    if (!product) return 0;
    const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    let finalPrice = basePrice;

    if (selectedColor) {
      const color = colors.find((c) => c.id === selectedColor);
      if (color) {
        const adj = typeof color.price_adjustment === 'string' ? parseFloat(color.price_adjustment) : color.price_adjustment;
        finalPrice += adj;
      }
    }

    if (selectedTexture) {
      const texture = textures.find((t) => t.id === selectedTexture);
      if (texture) {
        const adj = typeof texture.price_adjustment === 'string' ? parseFloat(texture.price_adjustment) : texture.price_adjustment;
        finalPrice += adj;
      }
    }

    if (selectedVariation) {
      const variation = variations.find((v) => v.id === selectedVariation);
      if (variation) {
        const adj = typeof variation.price_adjustment === 'string' ? parseFloat(variation.price_adjustment) : variation.price_adjustment;
        finalPrice += adj;
      }
    }

    return finalPrice;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const finalPrice = calculatePrice();
    const selectedColorObj = colors.find((c) => c.id === selectedColor);
    const selectedTextureObj = textures.find((t) => t.id === selectedTexture);
    const selectedVariationObj = variations.find((v) => v.id === selectedVariation);

    let itemName = product.name;
    if (selectedColorObj) itemName += ` - ${selectedColorObj.name}`;
    if (selectedTextureObj) itemName += ` (${selectedTextureObj.name})`;
    if (selectedVariationObj) itemName += ` - ${selectedVariationObj.value}`;

    addItem({
      id: `${product.id}-${selectedColor}-${selectedTexture}-${selectedVariation}`,
      name: itemName,
      price: finalPrice,
      image: images[0]?.url || "/placeholder.svg",
    }, quantity);

    toast.success(`${itemName} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const finalPrice = calculatePrice();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4 animate-fade-in">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                <img
                  src={images[selectedImageIndex]?.url || "/placeholder.svg"}
                  alt={images[selectedImageIndex]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <Badge className="absolute top-6 right-6 text-lg px-4 py-2 bg-accent text-accent-foreground shadow-xl">
                    {product.badge}
                  </Badge>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105",
                        selectedImageIndex === idx
                          ? "border-accent shadow-lg"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.alt_text || `${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-8 animate-fade-in">
              <div>
                {product.brand && (
                  <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 py-4 border-y border-border">
                <span className="text-5xl font-bold text-accent">
                  ${finalPrice.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-2xl text-muted-foreground line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-foreground">
                    Color: {colors.find((c) => c.id === selectedColor)?.name}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        disabled={!color.in_stock}
                        className={cn(
                          "relative w-14 h-14 rounded-full border-4 transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg",
                          selectedColor === color.id
                            ? "border-accent shadow-xl"
                            : "border-border hover:border-accent/50"
                        )}
                        style={{ backgroundColor: color.hex_code }}
                        title={color.name}
                      >
                        {selectedColor === color.id && (
                          <Check className="absolute inset-0 m-auto text-white drop-shadow-lg" size={24} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Texture/Material Selection */}
              {textures.length > 0 && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-foreground">
                    Material: {textures.find((t) => t.id === selectedTexture)?.name}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {textures.map((texture) => (
                      <button
                        key={texture.id}
                        onClick={() => setSelectedTexture(texture.id)}
                        disabled={!texture.in_stock}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed bg-card",
                          selectedTexture === texture.id
                            ? "border-accent shadow-lg bg-accent/5"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <div className="font-semibold text-foreground">{texture.name}</div>
                        {texture.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {texture.description}
                          </div>
                        )}
                        {texture.price_adjustment !== 0 && (
                          <div className="text-sm font-semibold text-accent mt-2">
                            {texture.price_adjustment > 0 ? '+' : ''}${texture.price_adjustment.toFixed(2)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size/Variation Selection */}
              {variations.length > 0 && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-foreground">
                    {variations[0].variation_type}: {variations.find((v) => v.id === selectedVariation)?.value}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variations.map((variation) => (
                      <button
                        key={variation.id}
                        onClick={() => setSelectedVariation(variation.id)}
                        disabled={!variation.in_stock}
                        className={cn(
                          "px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed bg-card",
                          selectedVariation === variation.id
                            ? "border-accent bg-accent text-accent-foreground shadow-lg"
                            : "border-border hover:border-accent/50 text-foreground"
                        )}
                      >
                        {variation.value}
                        {variation.price_adjustment !== 0 && (
                          <span className="ml-2 text-sm">
                            ({variation.price_adjustment > 0 ? '+' : ''}${variation.price_adjustment.toFixed(0)})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 border-2 hover:border-accent"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="text-2xl font-bold w-16 text-center text-foreground">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12 border-2 hover:border-accent"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - ${(finalPrice * quantity).toFixed(2)}
                </Button>
                <Link to="/cart" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full h-14 text-lg border-2 hover:border-accent">
                    View Cart
                  </Button>
                </Link>
              </div>

              {/* Product Information */}
              <Card className="bg-card/50 backdrop-blur border-2">
                <CardContent className="p-6 space-y-6">
                  {product.long_description && (
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.long_description}
                      </p>
                    </div>
                  )}

                  {features.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">Features</h3>
                      <ul className="space-y-2">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-muted-foreground">
                            <Check className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                            <span>{feature.feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.dimensions && (
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">Dimensions</h3>
                      <div className="grid grid-cols-3 gap-4 text-muted-foreground">
                        {(product.dimensions as Dimensions).width && (
                          <div>
                            <div className="text-sm text-muted-foreground/70">Width</div>
                            <div className="font-semibold">{(product.dimensions as Dimensions).width}</div>
                          </div>
                        )}
                        {(product.dimensions as Dimensions).depth && (
                          <div>
                            <div className="text-sm text-muted-foreground/70">Depth</div>
                            <div className="font-semibold">{(product.dimensions as Dimensions).depth}</div>
                          </div>
                        )}
                        {(product.dimensions as Dimensions).height && (
                          <div>
                            <div className="text-sm text-muted-foreground/70">Height</div>
                            <div className="font-semibold">{(product.dimensions as Dimensions).height}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {product.care_instructions && (
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">Care Instructions</h3>
                      <p className="text-muted-foreground">{product.care_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
