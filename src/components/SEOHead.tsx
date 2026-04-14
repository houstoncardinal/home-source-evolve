import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
}

function upsertMeta(attribute: "name" | "property", key: string, value: string) {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.querySelector(selector);

  if (existing) {
    existing.setAttribute("content", value);
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute(attribute, key);
  meta.setAttribute("content", value);
  document.head.appendChild(meta);
}

function upsertCanonical(href: string) {
  const existing = document.querySelector('link[rel="canonical"]');
  if (existing) {
    existing.setAttribute("href", href);
    return;
  }

  const link = document.createElement("link");
  link.setAttribute("rel", "canonical");
  link.setAttribute("href", href);
  document.head.appendChild(link);
}

export function SEOHead({ title, description, canonicalPath }: SEOHeadProps) {
  useEffect(() => {
    const resolvedTitle = title.includes("Curated Home Source")
      ? title
      : `${title} | Curated Home Source`;
    document.title = resolvedTitle;

    const canonicalUrl = canonicalPath
      ? new URL(canonicalPath, window.location.origin).toString()
      : window.location.href;

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    upsertMeta("property", "og:title", resolvedTitle);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", resolvedTitle);
    upsertCanonical(canonicalUrl);
  }, [title, description, canonicalPath]);

  return null;
}
