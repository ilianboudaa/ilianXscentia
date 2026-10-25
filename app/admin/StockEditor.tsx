"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function StockEditor({
  variant: v,
}: {
  variant: {
    id: string;
    sku: string;
    size: string;
    stock: number;
    name: string;
  };
}) {
  const [stock, setStock] = useState(v.stock),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const router = useRouter();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v.id, stock }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMessage("Enregistré");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="border border-stone-200 p-3 space-y-2" onSubmit={save}>
      <p className="text-sm">
        {v.name} · {v.size}
      </p>
      <div className="flex gap-2">
        <input
          aria-label={`Stock ${v.name} ${v.size}`}
          type="number"
          min={0}
          max={10000}
          required
          className="field"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />
        <button className="secondary" disabled={busy}>
          OK
        </button>
      </div>
      <p role="status" className="text-xs text-stone-500">
        {message || v.sku}
      </p>
    </form>
  );
}
