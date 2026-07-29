// Cloudflare Worker: Dynamic JSON-LD Schema Injector
// Deploy as a Worker Route on: www.danmackenzie.co.uk/*
// Proxies origin (Pixieset) HTML and injects sitewide + per-route JSON-LD before </head>

const SITE_URL = "https://www.danmackenzie.co.uk";
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

// ---------- Sitewide Organization ----------
function buildOrganization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    "name": "Dan Mackenzie",
    "url": SITE_URL,
    "logo": "https://assets.danmackenzie.co.uk/Logos/DM_Logo_FB.png",
    "description": "A thoughtful creative practice offering photography, digital support, and AI automation for founder-led brands and individuals.",
    "sameAs": [
      "https://www.instagram.com/danmackenz",
      "https://www.linkedin.com/in/danmacknzie"
    ],
    "areaServed": "GB",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Stroud",
      "addressRegion": "Gloucestershire",
      "addressCountry": "GB"
    }
  };
}

// ---------- Sitewide WebSite ----------
function buildWebSite() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    "url": `${SITE_URL}/`,
    "name": "Dan Mackenzie",
    "publisher": { "@id": ORG_ID },
    "inLanguage": "en-GB"
  };
}

// ---------- Route map ----------
// type: schema.org subtype for the page
// name: page title used in schema + breadcrumb label
// parent: path of parent for breadcrumb chain (null = top level under Home)
const routeMap = {
  "/": { type: "WebPage", name: "Home", parent: null },
  "/home": { type: "WebPage", name: "Home", parent: null },

  "/about": { type: "AboutPage", name: "About", parent: "/" },
  "/pricing": { type: "WebPage", name: "Pricing", parent: "/" },
  "/contact": { type: "ContactPage", name: "Contact", parent: "/" },

  "/services": { type: "CollectionPage", name: "Services", parent: "/" },
  "/services-photography-visuals": { type: "Service", name: "Photography & Visuals", parent: "/services" },
  "/services-web-digital": { type: "Service", name: "Web & Digital", parent: "/services" },
  "/services-ai-automation": { type: "Service", name: "AI & Automation", parent: "/services" },
  "/services-tech-support-mentoring": { type: "Service", name: "Tech Support & Mentoring", parent: "/services" },
  "/studio-tools": { type: "Service", name: "Studio Tools", parent: "/services" },

  "/portfolio": { type: "CollectionPage", name: "Portfolio", parent: "/" },
  "/gallery-people-culture": { type: "ImageGallery", name: "People & Culture", parent: "/portfolio" },
  "/gallery-brand-lifestyle": { type: "ImageGallery", name: "Brand & Lifestyle", parent: "/portfolio" },
  "/gallery-fine-art-prints": { type: "ImageGallery", name: "Fine Art & Prints", parent: "/portfolio" },

  "/faq": { type: "FAQPage", name: "FAQ", parent: "/" },
  "/process": { type: "WebPage", name: "Process", parent: "/" },
  "/prints": { type: "WebPage", name: "Prints", parent: "/" },
  "/clients": { type: "WebPage", name: "Clients", parent: "/" },
  "/newsletter": { type: "WebPage", name: "Newsletter", parent: "/" },
  "/blog": { type: "Blog", name: "The Zine", parent: "/" },

  "/policies": { type: "CollectionPage", name: "Policies", parent: "/" },
  "/disclaimer": { type: "WebPage", name: "Disclaimer", parent: "/policies" },
  "/terms-of-service": { type: "WebPage", name: "Terms of Service", parent: "/policies" },
  "/terms-of-sale": { type: "WebPage", name: "Terms of Sale", parent: "/policies" },
  "/terms-of-use": { type: "WebPage", name: "Terms of Use", parent: "/policies" },
  "/privacy-policy": { type: "WebPage", name: "Privacy Policy", parent: "/policies" },
  "/cookie-policy": { type: "WebPage", name: "Cookie Policy", parent: "/policies" },
  "/modern-slavery-statement": { type: "WebPage", name: "Modern Slavery Statement", parent: "/policies" },
  "/ai-ethics": { type: "WebPage", name: "AI Ethics", parent: "/policies" },
  "/copyright-licensing": { type: "WebPage", name: "Copyright & Licensing", parent: "/policies" },
  "/giveaway-terms": { type: "WebPage", name: "Giveaway Terms", parent: "/policies" },
  "/refunds-returns": { type: "WebPage", name: "Refunds & Returns", parent: "/policies" },
  "/accessibility-statement": { type: "WebPage", name: "Accessibility Statement", parent: "/policies" }
};

// ---------- Route resolver (handles trailing slash + raw/normalized paths) ----------
function resolveRoute(pathname) {
  const rawPath = pathname || "/";
  const normalizedPath = rawPath === "/" ? "/" : rawPath.replace(/\/+$/, "");
  return routeMap[rawPath] || routeMap[normalizedPath] || null;
}

// ---------- Breadcrumb builder (walks parent chain) ----------
function buildBreadcrumb(path) {
  const chain = [];
  let current = path;
  const seen = new Set();

  while (current && routeMap[current] && !seen.has(current)) {
    seen.add(current);
    chain.unshift({
      name: routeMap[current].name,
      url: current === "/" ? `${SITE_URL}/` : `${SITE_URL}${current}`
    });
    current = routeMap[current].parent;
  }

  // Ensure Home is always first if not already
  if (chain.length === 0 || chain[0].url !== `${SITE_URL}/`) {
    chain.unshift({ name: "Home", url: `${SITE_URL}/` });
  }

  return {
    "@type": "BreadcrumbList",
    "itemListElement": chain.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// ---------- Page node builder ----------
function buildPageNode(path, route) {
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const node = {
    "@type": route.type,
    "@id": `${url}#webpage`,
    "url": url,
    "name": `${route.name} | Dan Mackenzie`,
    "isPartOf": { "@id": SITE_ID },
    "about": { "@id": ORG_ID }
  };

  // Add type-specific enrichments
  if (route.type === "Service") {
    node.provider = { "@id": ORG_ID };
    node.areaServed = "GB";
    node.serviceType = route.name;
  }
  if (route.type === "ImageGallery" || route.type === "CollectionPage") {
    node.isPartOf = { "@id": SITE_ID };
  }
  if (route.type === "Blog") {
    node.publisher = { "@id": ORG_ID };
    // TODO: add author, datePublished, image when post metadata is available from origin
  }

  return node;
}

// ---------- Full JSON-LD graph for a given pathname ----------
function buildSchemaGraph(pathname) {
  const route = resolveRoute(pathname);
  if (!route) return null; // no schema for unmapped routes

  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  const graph = [
    buildOrganization(),
    buildWebSite(),
    buildPageNode(normalizedPath, route),
    buildBreadcrumb(normalizedPath)
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

// ---------- HTMLRewriter handler: injects <script> before </head> ----------
class HeadInjector {
  constructor(jsonLd) {
    this.jsonLd = jsonLd;
  }
  element(element) {
    if (this.jsonLd) {
      // Safely serialize JSON-LD and escape closing script sequences to avoid prematurely terminating the script tag
      const jsonText = JSON.stringify(this.jsonLd).replace(/<\/script>/gi, '\\u003C/script>');
      const scriptTag = `<script type="application/ld+json">${jsonText}</script>`;
      element.append(scriptTag, { html: true });
    }
  }
}

// ---------- Main fetch handler ----------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname || "/";

    // Fetch original response from origin (Pixieset)
    const originResponse = await fetch(request);

    // Only operate on successful HTML responses from origin (avoid injecting into error pages)
    const status = originResponse.status || 0;
    const contentType = originResponse.headers.get("content-type") || "";
    if (status < 200 || status >= 300 || !contentType.includes("text/html")) {
      return originResponse; // pass through non-HTML or non-2xx responses untouched
    }

    const jsonLd = buildSchemaGraph(pathname);

    if (!jsonLd) {
      return originResponse; // no matching route, serve unmodified
    }

    const rewritten = new HTMLRewriter()
      .on("head", new HeadInjector(jsonLd))
      .transform(originResponse);

    // Temporary debug header — confirms this Worker handled the request.
    // Remove once JSON-LD injection is confirmed working live.
    const response = new Response(rewritten.body, rewritten);
    response.headers.set("x-schema-worker", "active");
    return response;
  }
};