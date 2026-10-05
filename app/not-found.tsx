import Link from "next/link";

export default function NotFound() {
  return (
    <section className="legal shell">
      <div className="kicker">404</div>
      <h1>Nothing to send here.</h1>
      <p>The page you requested does not exist.</p>
      <Link className="button" href="/">Back to SendToolkit</Link>
    </section>
  );
}
