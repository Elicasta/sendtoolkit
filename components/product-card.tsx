import Link from "next/link";
import type { Product } from "@/lib/products";

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="productCard">
      <div className="kicker">{product.eyebrow}</div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="productCardBottom">
        <strong className="price">{money(product.priceCents)}</strong>
        <Link className="button" href={"/products/" + product.slug}>
          View {product.slug === "core" ? "Core" : "Lite"}
        </Link>
      </div>
    </article>
  );
}
