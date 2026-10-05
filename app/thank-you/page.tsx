import Link from "next/link";

export const metadata = { title: "Thank you" };

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <section className="productHero dark">
      <div className="shell">
        <div className="kicker light">Order received</div>
        <h1>Payment confirmation comes first.</h1>
        <p className="lede">
          This page will reveal product access only after the server verifies a paid Stripe Checkout session.
          Until delivery wiring is finished, no private product link is exposed here.
        </p>
        {session_id ? (
          <p className="sessionNote">Checkout session received. Delivery verification is still being connected.</p>
        ) : (
          <p className="sessionNote">No checkout session was provided.</p>
        )}
        <Link className="button lime" href="/">Back to SendToolkit</Link>
      </div>
    </section>
  );
}
