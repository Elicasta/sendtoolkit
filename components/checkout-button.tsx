"use client";

import { useRef, useState } from "react";

type Props = {
  sku: string;
  label: string;
  enabled: boolean;
};

export function CheckoutButton({ sku, label, enabled }: Props) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const attemptId = useRef<string | null>(null);

  async function startCheckout() {
    if (!enabled || loading) return;

    setLoading(true);
    setStatus("");

    if (!attemptId.current) attemptId.current = crypto.randomUUID();

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": attemptId.current
        },
        body: JSON.stringify({ sku })
      });

      const body = await response.json();

      if (!response.ok || !body.url) {
        throw new Error(body.error || "Checkout is unavailable.");
      }

      window.location.assign(body.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout is unavailable.");
      setLoading(false);
      attemptId.current = null;
    }
  }

  return (
    <>
      <button
        className="button lime full"
        type="button"
        disabled={!enabled || loading}
        onClick={startCheckout}
      >
        {loading ? "Opening secure checkout…" : enabled ? label : "Checkout connecting"}
      </button>
      {status ? <p className="checkoutStatus" role="status">{status}</p> : null}
    </>
  );
}
