import { freeMiniPack } from "@/lib/products";

export const metadata = {
  title: "Free Client Firefighter Mini Pack",
  description: "Get 10–12 client-response templates free."
};

export default function FreeMiniPackPage() {
  return (
    <section className="productHero dark">
      <div className="shell productHeroGrid">
        <div>
          <div className="kicker light">Free mini pack</div>
          <h1>Stop rewriting the same client problem.</h1>
          <p className="lede">
            Get {freeMiniPack.templateCount} real responses for late payments,
            scope creep, ghosting, price pushback, and difficult client moments.
          </p>
          <div className="proofRow darkProof">
            <span>No daily newsletter</span>
            <span>Instant delivery when email wiring goes live</span>
          </div>
        </div>
        <aside className="buyCard">
          <div className="buyPrice">$0</div>
          <label className="fieldLabel" htmlFor="lead-email">Email</label>
          <input className="field" id="lead-email" type="email" placeholder="you@business.com" disabled />
          <button className="button lime full" type="button" disabled>Lead delivery connecting</button>
          <small>The form is disabled until the database is connected, so we never pretend a signup worked.</small>
        </aside>
      </div>
    </section>
  );
}
