import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
const base = "http://127.0.0.1:3100";
const app = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "-p",
    "3100",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let output = "";
app.stdout.on("data", (d) => (output += d));
app.stderr.on("data", (d) => (output += d));
const ready = (async () => {
  for (let i = 0; i < 100; i++) {
    if (output.includes("Ready in")) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(output);
})();
process.on("exit", () => app.kill());
test("production routes, protected areas and command APIs", async (t) => {
  await ready;
  t.after(() => app.kill());
  await t.test("homepage reads the complete Supabase catalogue", async () => {
    const r = await fetch(base);
    assert.equal(r.status, 200);
    const s = await r.text();
    assert.match(s, /Vanille Étoilée/);
    assert.match(s, /Cerise Blanche/);
    assert.match(s, /Diagnostic/);
  });
  const products = JSON.parse(readFileSync("data/catalog.json", "utf8"));
  await t.test("all 20 original product pages exist", async () => {
    for (const p of products) {
      const r = await fetch(base + "/parfums/" + p.slug);
      assert.equal(r.status, 200, p.slug);
      const html = await r.text();
      assert.ok(
        html.includes(
          p.name.replaceAll("&", "&amp;").replaceAll("'", "&#x27;"),
        ),
        p.slug,
      );
    }
  });
  await t.test("unknown product is 404", async () =>
    assert.equal((await fetch(base + "/parfums/inexistant")).status, 404),
  );
  await t.test("account and admin redirect anonymous sessions", async () => {
    for (const path of ["/compte", "/admin"]) {
      const r = await fetch(base + path, { redirect: "manual" });
      assert.equal(r.status, 307);
      assert.match(r.headers.get("location"), /connexion/);
    }
  });
  await t.test("checkout rejects anonymous orders", async () => {
    const r = await fetch(base + "/api/commande", {
      method: "POST",
      headers: { origin: base, "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(r.status, 401);
  });
  await t.test("stock API rejects anonymous edits", async () => {
    const r = await fetch(base + "/api/admin/stock", {
      method: "PATCH",
      headers: { origin: base, "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(r.status, 401);
  });
  await t.test("cross-origin commands are refused", async () => {
    const r = await fetch(base + "/api/commande", {
      method: "POST",
      headers: {
        origin: "https://untrusted.example",
        "content-type": "application/json",
      },
      body: "{}",
    });
    assert.equal(r.status, 403);
  });
  await t.test("checkout and sign-in pages render", async () => {
    for (const p of ["/commande", "/connexion"])
      assert.equal((await fetch(base + p)).status, 200);
  });
});
