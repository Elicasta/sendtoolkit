import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell footerInner">
        <div>
          <strong>SendToolkit</strong>
          <p>Less rewriting. More running your business.</p>
        </div>
        <div className="footerLinks">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
