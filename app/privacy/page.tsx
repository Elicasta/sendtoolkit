export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="legal shell">
      <div className="kicker">Legal</div>
      <h1>Privacy Policy</h1>
      <p>SendToolkit collects information needed to process purchases, deliver digital products, provide requested email content, prevent abuse, and measure storefront performance.</p>
      <p>Payment details are handled by Stripe. SendToolkit does not store full card numbers. Transactional and marketing email may be delivered through Resend. Storefront records may be stored in Supabase.</p>
      <p>Marketing emails include an unsubscribe mechanism. Transactional purchase and delivery messages may still be sent when needed to fulfill an order.</p>
      <p>Contact: hello@sendtoolkit.com</p>
    </section>
  );
}
