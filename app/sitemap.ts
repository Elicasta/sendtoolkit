import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sendtoolkit.com";
  const paths = [
    "",
    "/products/core",
    "/products/lite",
    "/free/client-firefighter-mini",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/disclaimer"
  ];

  return paths.map((path) => ({
    url: base + path,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/products") ? 0.9 : 0.5
  }));
}
