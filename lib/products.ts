export type ProductSlug = "core" | "lite";

export type Product = {
  sku: string;
  slug: ProductSlug;
  name: string;
  eyebrow: string;
  priceCents: number;
  description: string;
  forWho: string[];
  notFor: string[];
  includes: string[];
  cta: string;
};

export const products: Record<ProductSlug, Product> = {
  core: {
    sku: "client-firefighter-core",
    slug: "core",
    name: "The Client Firefighter",
    eyebrow: "Core system",
    priceCents: 3700,
    description: "The response system for uncomfortable client conversations. Find the situation, copy the response, send the next step.",
    forWho: [
      "Service business owners who invoice clients",
      "Photographers, freelancers, contractors, agencies, coaches, and consultants",
      "Anyone losing time rewriting the same difficult client messages"
    ],
    notFor: [
      "Businesses looking for legal advice or contract drafting",
      "People who want generic motivational scripts"
    ],
    includes: [
      "150 pre-written client responses",
      "Email and DM versions",
      "10 situation categories",
      "Emergency Finder with escalation paths",
      "Late-payment and ghosting follow-up sequences"
    ],
    cta: "Get Core"
  },
  lite: {
    sku: "client-firefighter-lite",
    slug: "lite",
    name: "Client Firefighter Lite",
    eyebrow: "Essential pack",
    priceCents: 1900,
    description: "The smaller response pack for owners who need the highest-frequency client situations covered without buying the full system yet.",
    forWho: [
      "New service businesses",
      "Solo operators who want the essential responses first",
      "Buyers who want a smaller starting point"
    ],
    notFor: [
      "Owners who want the full 150-response library",
      "Teams that need every escalation path"
    ],
    includes: [
      "The highest-frequency client situations",
      "Email and DM versions",
      "Simple situation-based organization",
      "Upgrade path to Core"
    ],
    cta: "Get Lite"
  }
};

export const freeMiniPack = {
  sku: "client-firefighter-mini",
  name: "Client Firefighter Mini Pack",
  priceCents: 0,
  templateCount: "10–12",
  description: "A free starter pack with real client-response templates you can use immediately."
};
