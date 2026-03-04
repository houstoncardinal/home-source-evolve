import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
}

export function SEOHead({ title, description }: SEOHeadProps) {
  useEffect(() => {
    document.title = title.includes("Curated Home Source")
      ? title
      : `${title} | Curated Home Source`;

    const meta = document.querySelector('meta[name="description"]');
    if (description) {
      if (meta) {
        meta.setAttribute("content", description);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "description";
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
    }
  }, [title, description]);

  return null;
}
