"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/providers/AppProvider";
export function ProfileForm({
  profile,
}: {
  profile: { id: string; full_name: string; phone: string | null };
}) {
  const [name, setName] = useState(profile.full_name || ""),
    [phone, setPhone] = useState(profile.phone || ""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const { refreshProfile } = useApp();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await createClient()
        .from("profiles")
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq("id", profile.id);
      if (error) throw error;
      await refreshProfile();
      setMessage("Profil enregistré.");
    } catch {
      setMessage("Enregistrement impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel space-y-4" onSubmit={save}>
      <h2 className="font-serif text-2xl text-[#76545a]">Mon profil</h2>
      <label className="block text-sm">
        Nom complet
        <input
          className="field mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={120}
          required
          autoComplete="name"
        />
      </label>
      <label className="block text-sm">
        Téléphone (facultatif)
        <input
          className="field mt-2"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={30}
          autoComplete="tel"
        />
      </label>
      <button disabled={busy} className="primary">
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
      <p role="status" className="text-xs">
        {message}
      </p>
    </form>
  );
}
