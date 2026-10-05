import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { freeMiniPack, products } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell heroGrid">
          <div>
            <div className="kicker">The Client Firefighter</div>
            <h1>Know exactly what to <span>send.</span></h1>
            <p className="lede">
              The response system for uncomfortable client conversations. Find the situation,
              copy the response, send the next step.
            </p>
            <div className="actions">
              <Link className="button lime" href="/products/core">Get Core · $37</Link>
              <Link className="button ghost" href="/free/client-firefighter-mini">
                Get the free mini pack
              </Link>
            </div>
            <div className="proofRow">
              <span>150 responses</span>
              <span>Email + DM</span>
              <span>10 categories</span>
              <span>One-time purchase</span>
            </div>
          </div>
          <div className="systemPanel" aria-label="Emergency Finder preview">
            <div className="panelTop">
              <span>Emergency Finder</span>
              <span className="badge">8 crisis paths</span>
            </div>
            <div className="path"><small>01</small><strong>Client has not paid.</strong><code>LPF-01 → LPF-03 → LPF-04</code></div>
            <div className="path"><small>02</small><strong>Client added work.</strong><code>SCR-01 → SCR-09 → SCR-10</code></div>
            <div className="path"><small>03</small><strong>Client wants a discount.</strong><code>PPD-01 → PPD-07 → PPD-08</code></div>
            <div className="path"><small>04</small><strong>Client is disrespectful.</strong><code>DDC-01 → DDC-06 → DDC-07</code></div>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="shell">
          <div className="sectionHead">
            <div className="kicker light">The system</div>
            <div>
              <h2>Find it. Copy it. Send it.</h2>
              <p>No blank-page writing. The structure is already decided.</p>
            </div>
          </div>
          <div className="steps">
            <div><span>01</span><h3>Find.</h3><p>Pick the client situation.</p></div>
            <div><span>02</span><h3>Copy.</h3><p>Use the email or DM version.</p></div>
            <div><span>03</span><h3>Send.</h3><p>One boundary. One ask. One next step.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="sectionHead">
            <div className="kicker">Choose your level</div>
            <div>
              <h2>Start where the problem is.</h2>
              <p>Core is the full operating system. Lite is the smaller entry point.</p>
            </div>
          </div>
          <div className="productGrid">
            <ProductCard product={products.core} />
            <ProductCard product={products.lite} />
          </div>
        </div>
      </section>

      <section className="section limeSection">
        <div className="shell leadGrid">
          <div>
            <div className="kicker">Free mini pack</div>
            <h2>Use {freeMiniPack.templateCount} real responses before you buy.</h2>
            <p>{freeMiniPack.description}</p>
          </div>
          <div className="leadAction">
            <strong>$0</strong>
            <Link className="button" href="/free/client-firefighter-mini">Send me the free pack</Link>
          </div>
        </div>
      </section>
    </>
  );
}
