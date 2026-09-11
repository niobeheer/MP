// v40 compatibility endpoint. The former fuzzy name matcher was intentionally
// retired because it could connect unrelated foreign holiday homes to a Dutch
// camping. Profile offers now come from /data/provider-matches-v40.json.
export default async () => new Response(JSON.stringify({
  ok: false,
  retired: true,
  reason: "unsafe fuzzy matching removed in v40",
  matches: [],
}), {
  status: 410,
  headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"},
});
