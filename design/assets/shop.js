/* ============================================================
   QUELL — catalog-driven storefront rendering (design preview)
   Load BEFORE app.js so dynamic nodes exist when it binds.
   ============================================================ */
(() => {
  "use strict";

  const IMG_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image";
  const imgURL = (p, s) =>
    IMG_API +
    "?prompt=" +
    encodeURIComponent(
      "minimal studio product photograph, " + p +
      ", on warm beige seamless backdrop, soft diffused window light, gentle soft shadow, premium editorial e-commerce image, muted earthy palette, matte finish, high detail, no text"
    ) +
    "&image_size=" + (s || "square_hd");

  const USD = (n) => "$" + n.toLocaleString("en-US");

  const CATALOG = [
    {
      id: "lamp", name: "Ivoire Table Lamp", cat: "Lighting", price: 168,
      img: "hand-thrown ivory ceramic table lamp with pleated natural linen lampshade",
      img2: "close detail of ivory ceramic lamp base with woven linen shade texture",
      colors: [{ l: "Sand", h: "#D8C5A2" }, { l: "Smoke", h: "#6F6A5F" }],
      lede: "Thrown by hand and fired in small batches, this lamp holds a warm, low light that stays gentle deep into the evening.",
      material: "Glazed ceramic, natural linen shade. Dust with a dry cloth; keep the shade clear of direct heat."
    },
    {
      id: "candles", name: "Studio Candlesticks", cat: "Objects", price: 120,
      img: "trio of brushed brass candlesticks in three heights with subtle patina",
      img2: "macro of brushed brass candlestick surface with warm patina",
      colors: [{ l: "Brass", h: "#B08A50" }],
      lede: "Cast and hand-brushed, three quiet heights that gather light the way a table should — whether lit or not.",
      material: "Solid brass, hand-brushed finish. Polish sparingly; patina is part of the piece."
    },
    {
      id: "throw", name: "Oat Throw", cat: "Living", price: 240,
      img: "neatly folded undyed oat-colored cashmere throw blanket on soft surface",
      img2: "folded cashmere throw showing ribbed weave detail in oat tone",
      colors: [{ l: "Oat", h: "#C9B99B" }, { l: "Clay", h: "#A8643E" }],
      lede: "Undyed and unbleached, spun from Mongolian cashmere. Heavy enough to mean it, light enough to forget it's there.",
      material: "100% Mongolian cashmere, undyed. Dry clean or hand-wash cold; lay flat to dry."
    },
    {
      id: "espresso", name: "Morning Espresso Set", cat: "Table", price: 96,
      img: "pair of handmade speckled stoneware espresso cups on saucers",
      img2: "speckled stoneware espresso cup held in hand, top-down view",
      colors: [{ l: "Speckle", h: "#B7A98C" }, { l: "Oxblood", h: "#7A3B2C" }],
      lede: "Two cups, two saucers, one slow morning. The glaze settles differently on every piece — no two sets are identical.",
      material: "Hand-thrown stoneware, food-safe glaze. Dishwasher safe; hand-washing keeps the glaze brightest."
    },
    {
      id: "tray", name: "Oak Server", cat: "Objects", price: 84,
      img: "natural white oak serving tray with rounded edges and visible grain",
      img2: "oak serving tray edge detail showing visible wood grain",
      colors: [{ l: "Natural", h: "#C29B68" }],
      lede: "One board, cut and sanded until the grain reads like a map. Strong enough for a full breakfast, good-looking enough to skip it.",
      material: "Solid European white oak, natural oil finish. Re-oil yearly; wipe clean with a damp cloth."
    },
    {
      id: "carafe", name: "Cloud Carafe", cat: "Table", price: 58,
      img: "smoked glass carafe with thin glass stopper on warm background",
      img2: "smoked glass carafe with water pouring softly, condensation detail",
      colors: [{ l: "Smoke", h: "#4E524E" }, { l: "Clear", h: "#CFD6D2" }],
      lede: "Blown from a single gather of glass, its thin stopper sits so lightly it almost floats. Water has never looked this expensive.",
      material: "Hand-blown borosilicate glass. Hand-wash only; avoid thermal shock."
    }
  ];

  const byId = (id) => CATALOG.find((p) => p.id === id);

  /* ---------- card ---------- */
  const cardHTML = (p, i) => `
    <article class="card rv" style="--d:${i * 90}ms"
      data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-alt="${p.name}"
      data-variant="${p.colors[0].l}">
      <a class="card-media" href="product.html?id=${p.id}" aria-label="${p.name}">
        <img src="${imgURL(p.img)}" alt="${p.name}" loading="lazy">
      </a>
      <button class="quick" aria-label="Quick add ${p.name}">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 3v10M3 8h10"/></svg>
        Add
      </button>
      <div class="card-info">
        <div><a href="product.html?id=${p.id}" class="name">${p.name}</a>
        <div class="cat">${p.cat}</div></div>
        <span class="price">${USD(p.price)}</span>
      </div>
    </article>`;

  /* ---------- numbered editorial row ---------- */
  const rowHTML = (p, i) => `
    <a class="list-row rv" style="--d:${i * 80}ms" href="product.html?id=${p.id}">
      <span class="no">0${i + 1}</span>
      <div><h3>${p.name}</h3><div class="cat" style="margin-top:6px">${p.cat} · ${USD(p.price)}</div></div>
      <span class="meta"><span class="cat">From ${p.colors[0].l}</span>
        <span class="lnk">View<span class="ar">→</span></span></span>
    </a>`;

  /* ---------- PDP ---------- */
  const pdpHTML = (p) => {
    const dots = p.colors
      .map(
        (c, i) =>
          `<button class="chip swatch ${i === 0 ? "on" : ""}" data-val="${c.l}" style="background:${c.h}" aria-label="${c.l}"></button>`
      )
      .join("");
    const thumbs = [p.img, p.img2]
      .map(
        (src, i) =>
          `<button class="${i === 0 ? "on" : ""}" data-src="${imgURL(src)}" aria-label="View ${i + 1}">
             <img src="${imgURL(src)}" alt="" loading="lazy"></button>`
      )
      .join("");

    return `
    <div class="pdp" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-alt="${p.name}">
      <div class="pdp-media">
        <div class="thumbs">${thumbs}</div>
        <div class="stage"><img src="${imgURL(p.img)}" alt="${p.name}">
          <span class="zoom-hint">Drag in the full build</span>
        </div>
      </div>
      <div class="pdp-info">
        <span class="kicker">${p.cat} — Quell Studio</span>
        <h1>${p.name}</h1>
        <div class="price-row">
          <span class="price">${USD(p.price)}</span>
          <span class="tax">· duty &amp; tax included</span>
        </div>
        <p class="lede">${p.lede}</p>

        <div class="opt">
          <div class="opt-head"><span>Finish</span><span class="val">${p.colors[0].l}</span></div>
          <div class="chips">${dots}</div>
        </div>

        <div class="buy-row">
          <span class="qty"><button data-d="-1" aria-label="Decrease">−</button><span class="n">1</span><button data-d="1" aria-label="Increase">+</button></span>
          <button class="btn btn-dark btn-big" id="add-bag">Add to bag — ${USD(p.price)}</button>
        </div>
        <div class="trust">
          <span><svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><path d="M2 8.5 6 12.5 14 4"/></svg>In stock, ships in 48h</span>
          <span><svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><path d="M2 8.5 6 12.5 14 4"/></svg>30-day returns</span>
          <span><svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><path d="M2 8.5 6 12.5 14 4"/></svg>Insured freight</span>
        </div>

        <div class="acc">
          <details class="acc-item" open>
            <summary>Description<span class="pm"></span></summary>
            <div class="acc-body">${p.lede} Part of the Quell edit — considered once, kept for years. ${p.material.split(".")[0]}.</div>
          </details>
          <details class="acc-item">
            <summary>Material &amp; care<span class="pm"></span></summary>
            <div class="acc-body">${p.material}</div>
          </details>
          <details class="acc-item">
            <summary>Shipping &amp; duty<span class="pm"></span></summary>
            <div class="acc-body">Duty and import tax are included in the price you see (simulated environment). Orders over $200 ship complimentary; every parcel travels insured. Returns within 30 days.</div>
          </details>
        </div>
      </div>
    </div>`;
  };

  /* ---------- render by page ---------- */
  const editRoot = document.getElementById("edit-grid");
  if (editRoot) {
    ["lamp", "candles", "throw"].forEach((id, i) => {
      editRoot.insertAdjacentHTML("beforeend", cardHTML(byId(id), i));
    });
  }

  const listRoot = document.getElementById("new-list");
  if (listRoot) {
    ["espresso", "tray", "carafe"].forEach((id, i) => {
      listRoot.insertAdjacentHTML("beforeend", rowHTML(byId(id), i));
    });
  }

  const pdpRoot = document.getElementById("pdp-root");
  if (pdpRoot) {
    const params = new URLSearchParams(location.search);
    const p = byId(params.get("id")) || byId("lamp");
    document.title = p.name + " — QUELL";
    const crumb = document.getElementById("crumb");
    if (crumb) crumb.textContent = p.name;
    pdpRoot.insertAdjacentHTML("beforeend", pdpHTML(p));

    const rel = document.getElementById("related");
    if (rel) {
      const others = CATALOG.filter((x) => x.id !== p.id).slice(0, 4);
      others.forEach((o, i) => rel.insertAdjacentHTML("beforeend", cardHTML(o, i)));
    }
  }

  /* styles needed by JS-rendered bits */
  const st = document.createElement("style");
  st.textContent = ".card .name{font-family:var(--serif);font-size:20px;font-weight:380;line-height:1.2} .cat{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft)}";
  document.head.appendChild(st);
})();
