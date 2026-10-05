import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, type ProductSlug } from "@/lib/products";

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
            <button className="button lime full" type="button" disabled>
              Checkout connecting
            </button>
            <small>Stripe Checkout will replace this disabled state before traffic goes live.</small>
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
