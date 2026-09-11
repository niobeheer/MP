const ALLOWED = {
  allcamps: ["allcamps.nl", "www.allcamps.nl"],
};

function allowedDestination(provider, raw) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && (ALLOWED[provider] || []).includes(url.hostname) ? url : null;
  } catch (_error) {
    return null;
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default async request => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") || "";
  const destination = allowedDestination(provider, url.searchParams.get("url") || "");
  if (!destination) return new Response("Ongeldige partnerlink", {status: 400});

  let target = destination.href;
  let mode = "direct-fallback";
  if (provider === "allcamps") {
    const template = (process.env.ALLCAMPS_TRACKING_TEMPLATE || "").trim();
    if (template && template.includes("{url}")) {
      target = template.replaceAll("{url}", encodeURIComponent(destination.href));
      mode = "tradetracker";
    }
  }
  try {
    const parsed = new URL(target);
    if (parsed.protocol !== "https:") throw new Error("protocol");
  } catch (_error) {
    target = destination.href;
    mode = "direct-fallback";
  }
  // Netlify preserves the incoming query string on an HTTP redirect. That
  // would append provider/url to the Allcamps destination and can make the
  // landing page reject the request. Use a tiny noindex hand-off page so the
  // browser opens the exact partner URL instead.
  const scriptTarget = JSON.stringify(target).replaceAll("<", "\\u003c");
  const htmlTarget = escapeHtml(target);
  const body = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${htmlTarget}"><title>Doorsturen naar partner</title></head><body><p>Je wordt doorgestuurd naar Allcamps.</p><p><a href="${htmlTarget}" rel="nofollow sponsored">Ga verder naar Allcamps</a></p><script>location.replace(${scriptTarget});</script></body></html>`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-partner-provider": provider,
      "x-partner-tracking": mode,
      "x-robots-tag": "noindex, nofollow",
      "referrer-policy": "no-referrer",
    },
  });
};
