import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  image?: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, category, price")
        .ilike("name", `%${q}%`)
        .eq("in_stock", true)
        .limit(8);

      if (data) {
        const ids = data.map((p) => p.id);
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, url")
          .in("product_id", ids)
          .eq("is_primary", true);

        const imageMap = new Map(images?.map((i) => [i.product_id, i.url]));
        setResults(data.map((p) => ({ ...p, image: imageMap.get(p.id) })));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); }
  }, [open]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    navigate(`/product/${slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="border-0 focus-visible:ring-0 text-lg h-14"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !loading && (
            <p className="text-center text-muted-foreground py-8 text-sm">No products found</p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.slug)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              {r.image && (
                <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.category}</p>
              </div>
              <span className="text-sm font-semibold text-accent">
                {Number(r.price) > 0 ? `$${Number(r.price).toFixed(2)}` : "Contact"}
              </span>
            </button>
          ))}
          {query.length < 2 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Type at least 2 characters to search</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
