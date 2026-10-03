/* =====================================================================
   CONFIG  -  EDIT ONLY THIS SECTION (and the resources list below it)
   ===================================================================== */
const CONFIG = {
  siteName: "My Notes",
  tagline: "Free notes, PDFs and apps. Choose a resource, finish 6 short steps and download.",
  logo: "images/logo.png",
  contactEmail: "you@example.com",

  /* GOOGLE SHEET: all resources come from this sheet. Share it as "Anyone with the link: Viewer".
     Columns (row 1): id, title, category, description, image, downloadurl */
  sheetId: "1RzZkw3LiC0ICwT-Gmp47potgY0OvWw2-iC9XsDeSNNQ",
  sheetName: "Sheet1",

  /* Seconds to wait on each step. One number per step (6 steps). */
  stepDurations: [30, 30, 30, 30, 30, 30],
  waitText: "Please wait {s} seconds before continuing.",
  stepText: [
    "Your resource is being prepared. Read the notes on this page while you wait.",
    "Step 2 is almost the same. Your progress is saved if you refresh.",
    "Halfway there. Keep this tab open.",
    "Two more steps after this one.",
    "Almost done. One more step after this.",
    "Last step. Your download link appears next."
  ],

  /* ADS: paste the key / size from your ad network for each place.
     host = domain of the invoke.js script. minWidth hides the ad on small screens. */
  ads: {
    top:          { host: "www.highperformanceformat.com", key: "cfd65b36b045c07cef9a05df77feefad", w: 320, h: 50 },
    belowHeading: { host: "www.highrevenueformat.com", key: "7999654a3a35eff45688cff161a625e9", w: 300, h: 250 },
    between:      { host: "www.highrevenueformat.com", key: "1c94fa584a396abc50c7723d0e098ed4", w: 468, h: 60, minWidth: 500 },
    aboveTimer:   { host: "www.highrevenueformat.com", key: "0c17a1d10fe847fc28802f322a670fb9", w: 320, h: 50 },
    belowTimer:   { host: "www.highrevenueformat.com", key: "faba2f7541fd81c5380c3ed9bc08d21a", w: 160, h: 300 },
    bottom:       { host: "www.highrevenueformat.com", key: "0796fee33dfc2504b467d46de6de2a99", w: 728, h: 90, minWidth: 760 }
  },

  /* Text of the extra pages. Each string is one paragraph. */
  pages: {
    about:      { title: "About", text: ["This site shares free study notes, PDFs and app files.", "Resources are added by the site owner. Replace this text with your own."] },
    contact:    { title: "Contact", text: ["Questions, broken links or removal requests? Send an email."] },
    privacy:    { title: "Privacy Policy", text: ["This site has no accounts. Your browser stores your theme and your step progress locally on your device.", "Advertising networks used on this site may use cookies or similar technology to show ads. Please read their privacy policies.", "Replace this text with your own policy before going live."] },
    disclaimer: { title: "Disclaimer", text: ["Files are shared for educational purposes. We try to keep them accurate but make no guarantees.", "External download links belong to their owners. Ads are shown by third parties."] },
    terms:      { title: "Terms", text: ["By using this site you agree to use the resources lawfully and at your own risk.", "We may change or remove resources at any time."] }
  }
};

/* RESOURCES are loaded from your Google Sheet (see CONFIG.sheetId). Nothing to edit here. */
let resources = [];

function parseCSV(t) {
  const rows = []; let r = [], c = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { r.push(c); c = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && t[i + 1] === "\n") i++; r.push(c); rows.push(r); r = []; c = ""; }
    else c += ch;
  }
  if (c || r.length) { r.push(c); rows.push(r); }
  return rows;
}
const slug = s => s.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
const firstUrl = s => (String(s).match(/https?:\/\/[^\s|\]\[,;"]+/) || [""])[0];

async function loadResources() {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(CONFIG.sheetName)}&_=${Date.now()}`;
  try {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch(url, { signal: ctl.signal }); clearTimeout(to);
    if (!res.ok) throw new Error("sheet");
    const [head, ...rows] = parseCSV(await res.text());
    const cols = head.map(x => x.trim().toLowerCase());
    const get = (row, k) => (row[cols.indexOf(k)] || "").trim();
    const seen = new Set(), list = [];
    for (const row of rows) {
      const title = get(row, "title"), dl = firstUrl(get(row, "downloadurl"));
      if (!title || !dl) continue;
      let id = slug(get(row, "id")) || slug(title) || "item";
      while (seen.has(id)) id += "-2";
      seen.add(id);
      list.push({ id, title, category: get(row, "category") || "General", description: get(row, "description"), image: firstUrl(get(row, "image")), downloadUrl: dl });
    }
    if (!list.length) throw new Error("empty");
    resources = list; store.set("res-cache", JSON.stringify(list));
  } catch {
    try { const c = JSON.parse(store.get("res-cache") || "null"); if (Array.isArray(c) && c.length) resources = c; } catch { /* no cache */ }
  }
}

/* =====================================================================
   APP CODE  -  no need to edit below this line
   ===================================================================== */
const app = document.getElementById("app");
let timer = null;

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== false && v != null) e.setAttribute(k, v);
  e.append(...kids.flat().filter(x => x != null));
  return e;
};
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } }
};
const dec = s => { try { return decodeURIComponent(s); } catch { return ""; } };
const safeUrl = u => { try { const x = new URL(u, location.href); return /^https?:$/.test(x.protocol) ? x.href : "#"; } catch { return "#"; } };

/* ---------- ads: each ad runs inside its own sandboxed iframe, only after its slot exists ---------- */
const adSlot = name => h("div", { class: "ad", id: "ad-" + name, "data-slot": name }, h("small", {}, "Advertisement"), h("div", { class: "ad-box" }));
function mountAds(root) {
  root.querySelectorAll(".ad:not([data-on])").forEach(el => {
    el.dataset.on = "1";
    const a = CONFIG.ads[el.dataset.slot];
    if (!a || !a.key || innerWidth < (a.minWidth || 0)) { el.hidden = true; return; }
    const box = el.querySelector(".ad-box");
    box.style.minHeight = a.h + "px";
    const f = h("iframe", { title: "Advertisement", width: a.w, height: a.h, loading: "lazy",
      sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" });
    f.srcdoc = `<body style="margin:0"><script>atOptions={'key':'${a.key}','format':'iframe','height':${a.h},'width':${a.w},'params':{}};<\/script><script src="https://${a.host}/${a.key}/invoke.js"><\/script></body>`;
    box.replaceChildren(f);
  });
}

/* ---------- building blocks ---------- */
const thumb = r => {
  const d = h("div", { class: "thumb" }, h("span", {}, (r.title || "?")[0]));
  if (r.image) { const i = h("img", { src: r.image, alt: "", loading: "lazy" }); i.onerror = () => i.remove(); d.append(i); }
  return d;
};
const card = r => h("article", { class: "card" }, thumb(r),
  h("div", { class: "cb" }, h("span", { class: "cat" }, r.category), h("h3", {}, r.title), h("p", {}, r.description),
    h("a", { class: "btn", href: "#/r/" + encodeURIComponent(r.id), "aria-label": "Get resource: " + r.title }, "Get resource")));
const cats = () => [...new Set(resources.map(r => r.category))].sort();

/* ---------- views ---------- */
function viewHome() {
  return [h("section", { class: "hero" }, h("h1", {}, CONFIG.siteName), h("p", {}, CONFIG.tagline), h("a", { class: "btn", href: "#/resources" }, "Browse resources")),
    /* ============ AD SLOT 3 (between content): CONFIG.ads.between ============ */
    adSlot("between"), h("h2", {}, "Latest resources"), resources.length ? h("div", { class: "grid" }, resources.slice(0, 6).map(card)) : h("p", { class: "empty" }, "No resources yet. Please check back soon.")];
}
function viewResources(cat) {
  const q = h("input", { type: "search", id: "q", placeholder: "Search resources", "aria-label": "Search resources" });
  const s = h("select", { id: "cat", "aria-label": "Filter by category" }, h("option", { value: "" }, "All categories"), cats().map(c => h("option", { value: c }, c)));
  if (cats().includes(cat)) s.value = cat;
  const g = h("div", { class: "grid" });
  const upd = () => {
    const t = q.value.trim().toLowerCase();
    const l = resources.filter(r => (!s.value || r.category === s.value) && (r.title + " " + r.description + " " + r.category).toLowerCase().includes(t));
    g.replaceChildren(...(l.length ? l.map(card) : [h("p", { class: "empty" }, "No resources match. Try another word or category.")]));
  };
  q.oninput = s.onchange = upd; upd();
  return [h("h1", {}, "Resources"), h("div", { class: "filters" }, q, s), g];
}
function viewCategories() {
  return [h("h1", {}, "Categories"), h("div", { class: "grid" }, cats().map(c => {
    const n = resources.filter(r => r.category === c).length;
    return h("a", { class: "tile", href: "#/resources/" + encodeURIComponent(c) }, h("h3", {}, c), h("small", {}, n + (n === 1 ? " resource" : " resources")));
  }))];
}
function viewPage(key) {
  const p = CONFIG.pages[key];
  const out = [h("h1", {}, p.title), h("div", { class: "prose" }, p.text.map(t => h("p", {}, t)))];
  if (key === "contact" && CONFIG.contactEmail) out[1].append(h("a", { class: "btn", href: "mailto:" + CONFIG.contactEmail }, "Email us"));
  return out;
}
function viewFlow(id) {
  const r = resources.find(x => x.id === id);
  if (!r) return [h("h1", {}, "Resource not found"), h("p", {}, "This link may be old."), h("a", { class: "btn", href: "#/resources" }, "Browse resources")];
  const total = CONFIG.stepDurations.length, key = "step:" + r.id;
  let n = Math.min(total + 1, Math.max(1, parseInt(store.get(key), 10) || 1));
  const box = h("div", { class: "flow" });

  const ready = () => [h("div", { class: "ready" }, h("h1", {}, "Your resource is ready"), thumb(r), h("h2", {}, r.title), h("p", {}, r.description),
    h("a", { class: "btn", href: safeUrl(r.downloadUrl), target: "_blank", rel: "noopener noreferrer" }, "Download / Open"))];

  const step = () => {
    const d = CONFIG.stepDurations[n - 1] || 30;
    const num = h("b", {}, d), ring = h("div", { class: "ring", role: "timer" }, num), note = h("p", { class: "note", "aria-live": "polite" });
    const btn = h("button", { class: "btn", type: "button", disabled: "" }, n < total ? "Continue" : "Get my resource");
    const end = Date.now() + d * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      num.textContent = left; ring.style.setProperty("--p", left / d * 100);
      note.textContent = left ? CONFIG.waitText.replace("{s}", left) : "Done. You can continue.";
      if (!left) { clearInterval(timer); btn.disabled = false; }
    };
    btn.onclick = () => { n++; store.set(key, n); draw(); scrollTo(0, 0); };
    timer = setInterval(tick, 250); tick();
    return [h("p", { class: "stepno" }, `Step ${n} of ${total}`), h("h1", {}, r.title),
      h("div", { class: "bar", role: "progressbar", "aria-label": "Progress", "aria-valuemin": 0, "aria-valuemax": total, "aria-valuenow": n - 1 }, h("i", { style: `width:${(n - 1) / total * 100}%` })),
      /* ===== AD SLOT 2 (below heading): CONFIG.ads.belowHeading ===== */
      adSlot("belowHeading"),
      h("p", { class: "info" }, CONFIG.stepText[n - 1] || ""),
      /* ===== AD SLOT 3 (between content): CONFIG.ads.between ===== */
      adSlot("between"),
      /* ===== AD SLOT 4 (above countdown): CONFIG.ads.aboveTimer ===== */
      adSlot("aboveTimer"),
      h("div", { class: "timerbox" }, ring, note, btn),
      /* ===== AD SLOT 5 (below countdown): CONFIG.ads.belowTimer ===== */
      adSlot("belowTimer")];
  };
  const draw = () => { clearInterval(timer); box.replaceChildren(...(n > total ? ready() : step())); mountAds(box); };
  draw();
  return [box];
}

/* ---------- router ---------- */
function render() {
  clearInterval(timer);
  const [route = "", arg = ""] = location.hash.replace(/^#\/?/, "").split("/");
  let title = "", view;
  if (route === "resources") { title = "Resources"; view = viewResources(dec(arg)); }
  else if (route === "categories") { title = "Categories"; view = viewCategories(); }
  else if (route === "r") { const r = resources.find(x => x.id === dec(arg)); title = r ? r.title : "Not found"; view = viewFlow(dec(arg)); }
  else if (Object.hasOwn(CONFIG.pages, route)) { title = CONFIG.pages[route].title; view = viewPage(route); }
  else view = viewHome();
  document.title = (title ? title + " | " : "") + CONFIG.siteName;
  app.replaceChildren(...view);
  mountAds(app);
  document.querySelectorAll(".top nav a").forEach(a => a.toggleAttribute("aria-current", a.getAttribute("href") === "#/" + route || (route === "" && a.getAttribute("href") === "#/")));
  if (!view[0].classList?.contains("flow")) scrollTo(0, 0);
}

/* ---------- start ---------- */
document.getElementById("siteName").textContent = CONFIG.siteName;
document.getElementById("copy").textContent = "© " + new Date().getFullYear() + " " + CONFIG.siteName;
const logo = document.getElementById("logo");
logo.src = CONFIG.logo; logo.onerror = () => logo.remove();
const root = document.documentElement;
root.dataset.theme = store.get("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.getElementById("theme").onclick = () => { root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; store.set("theme", root.dataset.theme); };
addEventListener("hashchange", render);
mountAds(document);
app.replaceChildren(h("p", { class: "empty" }, "Loading..."));
loadResources().then(render);
