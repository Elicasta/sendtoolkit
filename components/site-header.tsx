import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <div className="shell headerInner">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">S</span>
          <span>SendToolkit</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/products/core">Core</Link>
          <Link href="/products/lite">Lite</Link>
          <Link href="/free/client-firefighter-mini">Free pack</Link>
        </nav>
        <Link className="button small" href="/products/core">Get Core · $37</Link>
      </div>
    </header>
  );
}
