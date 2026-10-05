import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, type ProductSlug } from "@/lib/products";
import { CheckoutButton } from "@/components/checkout-button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products[slug as ProductSlug];
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products[slug as ProductSlug];
  if (!product) notFound();

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(product.priceCents / 100);

  const checkoutEnabled = Boolean(
    process.env.STRIPE_SECRET_KEY &&
    (product.slug === "core" ? process.env.STRIPE_PRICE_CORE : process.env.STRIPE_PRICE_LITE)
  );

  return (
    <>
      <section className="productHero dark">
        <div className="shell productHeroGrid">
          <div>
            <div className="kicker light">{product.eyebrow}</div>
            <h1>{product.name}</h1>
            <p className="lede">{product.description}</p>
          </div>
          <aside className="buyCard">
            <div className="buyPrice">{price}</div>
            <p>One-time purchase.</p>
            <CheckoutButton
              sku={product.sku}
              label={product.cta + " · " + price}
              enabled={checkoutEnabled}
            />
            <small>
              Secure checkout is hosted by Stripe. Card and eligible wallet methods appear there.
            </small>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell detailGrid">
          <div>
            <div className="kicker">What is inside</div>
            <ul className="cleanList">
              {product.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <div className="kicker">Who it is for</div>
            <ul className="cleanList">
              {product.forWho.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="kicker blockGap">Not for</div>
            <ul className="cleanList muted">
              {product.notFor.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="shell offerStrip">
          <div>
            <div className="kicker light">Before you buy</div>
            <h2>Digital product. Clear terms.</h2>
          </div>
          <p>
            Review the <Link href="/refund-policy">refund policy</Link> and
            <Link href="/disclaimer"> disclaimer</Link> before purchase.
            SendToolkit templates are communication tools, not legal advice.
          </p>
        </div>
      </section>
    </>
  );
}
