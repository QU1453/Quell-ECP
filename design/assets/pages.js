/* ============================================================
   QUELL — page rendering layer (design preview)
   Builds every page into <main id="pg"> based on body[data-page].
   Pages: home · shop · product · journal · cart · checkout ·
   account (hash routes: overview / orders / order/:no /
   wishlist / following / addresses / settings / support).
   Load AFTER i18n.js + data.js + layout.js, BEFORE app.js.
   ============================================================ */
(() => {
  "use strict";

  const D = window.QUELL_DATA;
  if (!D) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const t = (k, v) => (window.I18N ? I18N.m(k, v != null ? [v] : undefined) : k);
  const hh = (k) => (window.I18N ? I18N.hh(k) : k);
  const pick = (o) => D.pick(o);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const Q = () => window.quell;
  const S = () => window.quell.state;
  const money = (usd) => window.quell.money(usd);

  const page = document.body.dataset.page || "home";
  const params = new URLSearchParams(location.search);

  /* ---------- images (same API as app.js) ---------- */
  const IMG_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image";
  const scene = (subject, extra) =>
    IMG_API + "?prompt=" + encodeURIComponent(
      "minimal studio product photograph, " + subject +
      ", on warm beige seamless backdrop, soft diffused window light, gentle soft shadow, premium editorial e-commerce image, muted earthy palette, matte finish, high detail, no text" + (extra || "")
    ) + "&image_size=";
  const IMG = (p, s) => scene(p) + (s || "square_hd");

  /* ---------- misc helpers ---------- */
  const locale = () => { const l = window.I18N ? I18N.get() : "en"; return l === "zh" || l === "zh-CN" ? "zh-CN" : l === "ja" ? "ja-JP" : "en-US"; };
  const fmtDate = (iso) => { try { return new Date(iso.replace(" ", "T")).toLocaleDateString(locale(), { year: "numeric", month: "short", day: "numeric" }); } catch (e) { return iso; } };
  const shipCost = (method, sub) => (method === "exp" ? 18 : sub >= 200 ? 0 : 12);

  const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6l-5.8 3 1.1-6.4L2.6 9.6l6.5-.9z"/></svg>';
  const HEART = '<svg class="heart-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-7.4-4.6-9.3-9.3A5.2 5.2 0 0 1 12 6.9a5.2 5.2 0 0 1 9.3 4c-1.9 4.7-9.3 9.3-9.3 9.3z"/></svg>';
  const PLANE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 3.2 2.9 10.4l6.2 2.4 2.3 6.3z"/><path d="M9.1 12.8 21.5 3.2"/></svg>';
  const I = {
    home: '<svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.3-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.7-9 9-9 9z"/></svg>',
    shop: '<svg viewBox="0 0 24 24"><path d="M4 9h16l-1.2 11H5.2z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4z"/></svg>'
  };

  /* ---------- transient state (survives re-renders) ---------- */
  let coAddr = null, coShip = "std", coPay = "card", addrOpen = false, coDone = null, coBusy = false;
  let chatLog = [{ who: "bot", k: "sup.hello" }];
  let chatReply = 0;
  let playTimers = [];
  const clearTimers = () => { playTimers.forEach(clearTimeout); playTimers = []; };

  /* ============================================================
     SHARED BUILDERS
     ============================================================ */
  const shead = (kick, title, link) =>
    '<div class="sec-head rv"><div><span class="kicker">' + kick + "</span><h2>" + title + "</h2></div>" +
    (link ? '<a class="lnk magnet" href="' + link.href + '"><span>' + link.label + '</span><span class="ar">→</span></a>' : "") + "</div>";

  const pageHead = (kick, titleHTML, sub) =>
    '<section class="pagehead"><div class="wrap">' +
    '<span class="kicker rv">' + kick + "</span>" +
    '<h1 class="rv" style="--d:70ms">' + titleHTML + "</h1>" +
    (sub ? '<p class="ph-sub rv" style="--d:140ms">' + sub + "</p>" : "") +
    "</div></section>";

  const emptyBox = (title, sub, href, cta) =>
    '<div class="emptybox rv"><div class="glyph">∅</div><p class="eb-t">' + title + "</p>" +
    '<p class="eb-s">' + sub + "</p>" +
    (cta ? '<a class="btn btn-dark magnet" href="' + href + '">' + cta + "</a>" : "") + "</div>";

  const priceHTML = (p) => p.oldPrice
    ? '<span class="price now">' + money(p.price) + '</span><s class="price was">' + money(p.oldPrice) + "</s>"
    : '<span class="price">' + money(p.price) + "</span>";

  const badgeHTML = (p) => {
    if (p.oldPrice) return '<span class="badge b-sale">−' + Math.round((1 - p.price / p.oldPrice) * 100) + "%</span>";
    if (p.isNew) return '<span class="badge b-new">' + t("badge.new") + "</span>";
    if (p.isHot) return '<span class="badge b-hot">' + t("badge.hot") + "</span>";
    return "";
  };

  const card = (p, i) => {
    const mk = D.makerById(p.maker);
    const on = Q() && Q().inWl(p.id);
    return '<article class="card rv" style="--d:' + ((i % 4) * 60) + 'ms" data-pid="' + p.id + '">' +
      '<div class="card-media">' +
        '<a class="card-link" href="product.html?id=' + p.id + '" aria-label="' + esc(pick(p.name)) + '">' +
          '<img class="im a" src="' + IMG(p.img) + '" alt="' + esc(pick(p.name)) + '" loading="lazy">' +
          '<img class="im b" src="' + IMG(p.img2) + '" alt="" loading="lazy" aria-hidden="true">' +
        "</a>" +
        badgeHTML(p) +
        '<button class="wish' + (on ? " on" : "") + '" data-wl="' + p.id + '" aria-label="wishlist">' + HEART + "</button>" +
        '<button class="quick" data-pid="' + p.id + '">' + t("ui.quickadd") + "</button>" +
      "</div>" +
      '<div class="card-info">' +
        '<div class="ci-row"><a class="ci-name" href="product.html?id=' + p.id + '">' + esc(pick(p.name)) + "</a>" + priceHTML(p) + "</div>" +
        '<div class="ci-row sub"><a class="ci-maker" href="shop.html?maker=' + p.maker + '">' + mk.name + '</a><span class="ci-rate">' + STAR + esc(p.rating) + "</span></div>" +
      "</div>" +
    "</article>";
  };

  const grid = (list) => '<div class="grid">' + list.map(card).join("") + "</div>";

  const makerCard = (m, i) => {
    const on = Q() && Q().followsMk(m.id);
    return '<article class="mkcard rv" style="--d:' + ((i % 3) * 90) + 'ms">' +
      '<a class="mk-img" href="shop.html?maker=' + m.id + '">' +
        '<img src="' + IMG(m.img, "portrait_4_3") + '" alt="' + esc(m.name) + '" loading="lazy">' +
        "<span>" + t("pdp.since", m.since) + "</span></a>" +
      '<div class="mk-body">' +
        '<div class="mk-row"><a class="mk-name" href="shop.html?maker=' + m.id + '">' + esc(m.name) + "</a>" +
          '<button class="flw' + (on ? " on" : "") + '" data-follow="' + m.id + '"><span class="fl-lab">' + (on ? t("ui.following") : t("ui.follow")) + "</span></button></div>" +
        '<p class="mk-craft">' + esc(pick(m.craft)) + " · " + esc(pick(m.city)) + ", " + esc(pick(m.country)) + "</p>" +
        '<p class="mk-blurb">' + esc(pick(m.blurb)) + "</p>" +
        '<a class="lnk" href="shop.html?maker=' + m.id + '"><span>' + t("makers.shop") + '</span><span class="ar">→</span></a>' +
      "</div>" +
    "</article>";
  };

  const jcard = (a, i, big) =>
    '<a class="jcard rv' + (big ? " big" : "") + '" style="--d:' + (i * 90) + 'ms" href="journal.html?id=' + a.id + '">' +
      '<span class="jc-img"><img src="' + IMG(a.img, big ? "landscape_4_3" : "portrait_4_3") + '" alt="" loading="lazy"></span>' +
      '<span class="jc-body"><span class="jc-k smallcaps">' + esc(pick(a.k)) + "</span>" +
      '<span class="jc-t">' + esc(pick(a.t)) + "</span>" +
      '<span class="jc-d">' + esc(pick(a.de)) + "</span>" +
      '<span class="jc-m">' + t("journal.read", a.min) + ' <i class="ar">→</i></span></span>' +
    "</a>";

  const acc = (head, body, open) =>
    '<div class="acc' + (open ? " open" : "") + '"><button class="acc-h" data-acc type="button"><span>' + head + "</span><i></i></button>" +
    '<div class="acc-b"><div class="acc-bi"><p>' + body + "</p></div></div></div>";

  const addrText = (a) => esc(a.name) + " · " + esc(pick(a.street)) + ", " + esc(pick(a.city)) + " " + esc(a.zip) + " · " + esc(a.phone);

  const addrForm = () => {
    const f = (n, key, req, sel) =>
      '<label class="field"><span>' + t(key) + "</span>" +
      (sel ? '<select name="' + n + '" required>' + sel.map((o) => '<option value="' + o[0] + '">' + o[1] + "</option>").join("") + "</select>"
           : '<input name="' + n + '" type="text" required autocomplete="off">') +
      "</label>";
    const C = [["CN", "China 中国"], ["JP", "Japan 日本"], ["DK", "Denmark"], ["NO", "Norway"], ["IT", "Italy"], ["GB", "United Kingdom"], ["US", "United States"]];
    return '<form class="aform rv" id="addr-form">' +
      '<div class="aform-grid">' +
      f("name", "co.name") + f("phone", "co.phone") + f("country", "co.country", true, C) +
      f("region", "co.region") + f("city", "co.city") + f("zip", "co.zip") +
      '<label class="field wide"><span>' + t("co.street") + '</span><input name="street" type="text" required autocomplete="off"></label>' +
      "</div>" +
      '<div class="aform-ops"><button type="submit" class="btn btn-dark">' + t("co.saveAddr") + "</button>" +
      '<button type="button" class="btn btn-ghost" data-acancel>' + t("ui.cancel") + "</button></div>" +
    "</form>";
  };

  /* ============================================================
     HOME
     ============================================================ */
  const homePage = () => {
    const edit = ["lamp", "throw", "teapot", "mirror"].map(D.byId).filter(Boolean);
    const news = D.CATALOG.filter((p) => p.isNew);
    const sale = D.CATALOG.filter((p) => p.oldPrice);
    const hot = D.CATALOG.filter((p) => p.isHot).slice(0, 4);

    const saleRow = (p, i) =>
      '<a class="srow rv" style="--d:' + (i * 70) + 'ms" href="product.html?id=' + p.id + '">' +
        '<span class="sr-idx">0' + (i + 1) + "</span>" +
        '<span class="sr-img"><img src="' + IMG(p.img, "square") + '" alt="" loading="lazy"></span>' +
        '<span class="sr-main"><span class="sr-name">' + esc(pick(p.name)) + "</span>" +
          '<span class="sr-maker">' + D.makerById(p.maker).name + "</span></span>" +
        '<span class="sr-price"><s>' + money(p.oldPrice) + "</s><b>" + money(p.price) + "</b></span>" +
        '<span class="badge b-sale">−' + Math.round((1 - p.price / p.oldPrice) * 100) + "%</span>" +
        '<span class="sr-go">→</span>' +
      "</a>";

    return "" +
    /* ---- hero ---- */
    '<header class="hero"><div class="hero-grid wrap">' +
      '<div class="hero-copy">' +
        '<span class="kicker rv">' + t("hero.kicker") + "</span>" +
        '<h1 class="hero-title" data-split>' +
          '<span class="ln"><span>' + t("hero.l1") + "</span></span>" +
          '<span class="ln"><span>' + t("hero.l2") + "</span></span>" +
          '<span class="ln"><span class="em">' + t("hero.l3") + "</span></span>" +
        "</h1>" +
        '<p class="hero-copy-t rv" style="--d:520ms">' + t("hero.copy") + "</p>" +
        '<div class="rv" style="--d:620ms;margin-top:34px"><a class="btn btn-dark btn-big magnet" href="shop.html"><span>' + t("hero.explore") + '</span><span class="ar">→</span></a></div>' +
        '<div class="hero-meta rv" style="--d:720ms">' +
          '<div class="item"><span class="num"><i data-count="12">0</i></span><span class="lbl">' + t("meta.countries") + "</span></div>" +
          '<div class="item"><span class="num">48h</span><span class="lbl">' + t("meta.dispatch") + "</span></div>" +
          '<div class="item"><span class="num">30d</span><span class="lbl">' + t("meta.returns") + "</span></div>" +
        "</div>" +
      "</div>" +
      '<div class="hero-side rv" style="--d:200ms">' +
        '<div class="hero-media">' +
          '<img src="' + IMG("sculptural sand-toned ceramic vessel with undulating form standing on travertine block", "portrait_4_3") + '" alt="">' +
          '<span class="orbit" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs><text><textPath href="#circ">QUELL · DUTY INCLUDED · INSURED · QUIET ·</textPath></text></svg></span>' +
        "</div>" +
        '<span class="hero-caption">' + t("hero.caption") + "</span>" +
      "</div>" +
    "</div>" +
    '<span class="scroll-cue">' + t("cue.scroll") + '<i></i></span>' +
    "</header>" +

    /* ---- categories ---- */
    '<section class="sec" id="cats"><div class="wrap">' +
      shead(t("sec.catsK"), hh("cats.title"), { href: "shop.html", label: t("ui.viewAll") }) +
      '<div class="catstrip rv">' +
        '<a class="cattile all" href="shop.html"><span class="cl">' + t("shop.all") + '</span><span class="cn">' + D.CATALOG.length + "</span></a>" +
        D.CATS.map((c, i) =>
          '<a class="cattile" style="--d:' + (i * 50) + 'ms" href="shop.html?cat=' + c.id + '">' +
          '<img src="' + IMG(c.img, "square") + '" alt="" loading="lazy">' +
          '<span class="cl">' + esc(pick(c.l)) + '</span><span class="cn">' + D.CATALOG.filter((p) => p.cat === c.id).length + "</span></a>").join("") +
      "</div>" +
    "</div></section>" +

    /* ---- current edit ---- */
    '<section class="sec" id="edit"><div class="wrap">' +
      shead(t("sec.editK"), hh("sec.editTitle"), { href: "shop.html", label: t("ui.viewAll") }) +
      grid(edit) +
    "</div></section>" +

    /* ---- dark band ---- */
    '<section class="band"><div class="sec wrap band-grid">' +
      "<div>" +
        '<span class="kicker on-night rv">' + t("band.kicker") + "</span>" +
        '<p class="statement rv" style="--d:90ms">' + hh("band.statement") + "</p>" +
      "</div>" +
      '<div class="note rv" style="--d:180ms"><p>' + t("band.note1") + "</p>" +
      '<p style="margin-top:22px"><a class="btn btn-light magnet" href="shop.html?tab=sale"><span>' + t("tab.sale") + '</span><span class="ar">→</span></a></p></div>' +
    "</div>" +
    '<div class="ticker" aria-hidden="true"><div class="ticker-track"><span>Kyoto</span><span>Copenhagen</span><span>Bergen</span><span>Milan</span><span>Tuscany</span><span>Wales</span><span>Kyoto</span><span>Copenhagen</span><span>Bergen</span><span>Milan</span><span>Tuscany</span><span>Wales</span></div></div>' +
    "</section>" +

    /* ---- new in (horizontal) ---- */
    '<section class="sec" id="new"><div class="wrap">' +
      shead(t("sec.newK"), hh("sec.newTitle"), { href: "shop.html?tab=new", label: t("ui.viewAll") }) +
      '<div class="hscroll rv">' + news.map((p, i) => card(p, i)).join("") + "</div>" +
    "</div></section>" +

    /* ---- sale (editorial rows) ---- */
    '<section class="sec" id="sale" style="background:var(--card)"><div class="wrap">' +
      shead(t("sec.saleK"), hh("sec.saleTitle"), { href: "shop.html?tab=sale", label: t("ui.viewAll") }) +
      '<div class="srows">' + sale.map(saleRow).join("") + "</div>" +
    "</div></section>" +

    /* ---- hot ---- */
    '<section class="sec" id="hot"><div class="wrap">' +
      shead(t("sec.hotK"), hh("sec.hotTitle"), { href: "shop.html?tab=hot", label: t("ui.viewAll") }) +
      grid(hot) +
    "</div></section>" +

    /* ---- makers ---- */
    '<section class="sec" id="makers"><div class="wrap">' +
      shead(t("sec.makersK"), hh("sec.makersTitle")) +
      '<p class="sec-lead rv">' + t("makers.lead") + "</p>" +
      '<div class="mkgrid">' + D.MAKERS.map(makerCard).join("") + "</div>" +
    "</div></section>" +

    /* ---- values ---- */
    '<section class="sec" id="values"><div class="wrap">' +
      shead(t("sec.valuesK"), hh("sec.valuesTitle")) +
      '<div class="values">' +
        [["01", "v1t", "v1p"], ["02", "v2t", "v2p"], ["03", "v3t", "v3p"]].map((v, i) =>
          '<div class="value rv" style="--d:' + (i * 90) + 'ms"><span class="no">' + v[0] + "</span><h3>" + t(v[1]) + "</h3><p>" + t(v[2]) + "</p></div>").join("") +
      "</div>" +
    "</div></section>" +

    /* ---- journal ---- */
    '<section class="sec" id="journal"><div class="wrap">' +
      shead(t("sec.journalK"), hh("sec.journalTitle"), { href: "journal.html", label: t("ui.viewAll") }) +
      '<div class="jgrid">' + D.ARTICLES.slice(0, 3).map((a, i) => jcard(a, i)).join("") + "</div>" +
    "</div></section>" +

    /* ---- newsletter ---- */
    '<section class="sec news"><div class="wrap news-inner">' +
      "<div>" +
        '<span class="kicker rv">' + t("sec.newsK") + "</span>" +
        '<h2 class="rv" style="--d:70ms">' + hh("sec.newsTitle") + "</h2>" +
      "</div>" +
      '<div class="rv" style="--d:140ms">' +
        '<p class="news-note">' + t("news.note") + "</p>" +
        '<form class="form" id="news-form">' +
          '<input type="email" required name="email" placeholder="' + t("news.ph") + '" aria-label="email">' +
          '<button type="submit"><span>' + t("ui.subscribe") + '</span><span class="ar">→</span></button>' +
        "</form>" +
        '<p class="form-note">' + t("news.fine") + "</p>" +
      "</div>" +
    "</div></section>";
  };

  /* ============================================================
     SHOP
     ============================================================ */
  const shopPage = () => {
    const tab = params.get("tab") || "all";
    const q = (params.get("q") || "").trim();
    const cat = params.get("cat") || "";
    const makerId = params.get("maker") || "";
    const sort = params.get("sort") || "featured";

    let list = D.CATALOG.slice();
    if (tab === "new") list = list.filter((p) => p.isNew);
    else if (tab === "hot") list = list.filter((p) => p.isHot);
    else if (tab === "sale") list = list.filter((p) => p.oldPrice);
    else if (tab === "following") list = list.filter((p) => S().follows.includes(p.maker));
    if (cat) list = list.filter((p) => p.cat === cat);
    if (makerId) list = list.filter((p) => p.maker === makerId);
    if (q) {
      const n = q.toLowerCase();
      list = list.filter((p) => [pick(p.name), p.name.en, p.name.zh, p.name.ja, D.makerById(p.maker).name, pick(D.catById(p.cat).l)].join(" ").toLowerCase().includes(n));
    }
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

    const titleKey = { all: "shop.titleAll", new: "shop.titleNew", hot: "shop.titleHot", sale: "shop.titleSale", following: "shop.titleFollowing" }[tab] || "shop.titleAll";
    const mk = makerId ? D.makerById(makerId) : null;

    const tabs = ["all", "new", "hot", "sale", "following"].map((id) =>
      '<button type="button" class="stab' + (tab === id ? " on" : "") + '" data-tab="' + id + '">' + t("tab." + id) + "</button>").join("");

    const chips = '<button type="button" class="fchip' + (!cat ? " on" : "") + '" data-cf="">' + t("shop.all") + "</button>" +
      D.CATS.map((c) => '<button type="button" class="fchip' + (cat === c.id ? " on" : "") + '" data-cf="' + c.id + '">' + esc(pick(c.l)) + "</button>").join("");

    const sortSel = '<label class="sortwrap"><span class="smallcaps">' + t("shop.sort") + "</span>" +
      '<select class="sortsel" data-sort>' +
      [["featured", "sort.featured"], ["priceAsc", "sort.priceAsc"], ["priceDesc", "sort.priceDesc"], ["rating", "sort.rating"]].map((s) =>
        '<option value="' + s[0] + '"' + (sort === s[0] ? " selected" : "") + ">" + t(s[1]) + "</option>").join("") +
      "</select></label>";

    let body;
    if (list.length) body = grid(list);
    else if (q) body = emptyBox(t("shop.qNone").replace("%s", esc(q)), t("shop.qNoneSub"), "shop.html", t("shop.all"));
    else if (tab === "following") body = emptyBox(t("shop.empty"), t("shop.emptySub"), "index.html#makers", t("fl.discover"));
    else body = emptyBox(t("shop.empty"), t("shop.emptySub"), "shop.html", t("shop.all"));

    return pageHead(q ? t("shop.q", esc(q)) : t("shop.count", list.length), hh(titleKey)) +
      '<section class="shopbar"><div class="wrap shopbar-in">' +
        '<div class="stabs">' + tabs + "</div>" +
        '<div class="sfilters">' + chips + sortSel + "</div>" +
      "</div></section>" +
      (mk ? '<section class="wrap"><div class="mkban rv">' +
        '<img class="mkban-img" src="' + IMG(mk.img, "square") + '" alt="">' +
        '<div class="mkban-b"><span class="smallcaps">' + t("shop.makerHead") + "</span><h2>" + esc(mk.name) + "</h2>" +
        "<p>" + esc(pick(mk.city)) + " · " + t("pdp.since", mk.since) + " · " + esc(pick(mk.craft)) + "</p></div>" +
        '<div class="mkban-ops"><button class="flw' + (Q().followsMk(mk.id) ? " on" : "") + '" data-follow="' + mk.id + '"><span class="fl-lab">' + (Q().followsMk(mk.id) ? t("ui.following") : t("ui.follow")) + "</span></button>" +
        '<button type="button" class="mini" data-mclear>' + t("shop.clearMaker") + "</button></div></div></section>" : "") +
      '<section class="sec" style="padding-top:34px"><div class="wrap">' + body + "</div></section>";
  };

  /* ============================================================
     PRODUCT
     ============================================================ */
  const productPage = () => {
    const p = D.byId(params.get("id"));
    if (!p) return pageHead(t("page.shop"), t("pdp.notFound")) +
      '<section class="sec"><div class="wrap">' + emptyBox(t("pdp.notFound"), t("pdp.notFoundSub"), "shop.html", t("shop.all")) + "</div></section>";

    const mk = D.makerById(p.maker);
    const cat = D.catById(p.cat);
    const inWl = Q().inWl(p.id);
    const rel = D.CATALOG.filter((x) => x.id !== p.id && (x.cat === p.cat || x.maker === p.maker)).slice(0, 4);

    return "" +
    '<div class="crumbs wrap"><a href="index.html">' + t("bread.home") + "</a><span>/</span>" +
      '<a href="shop.html?cat=' + p.cat + '">' + esc(pick(cat.l)) + "</a><span>/</span><b>" + esc(pick(p.name)) + "</b></div>" +

    '<section class="pdp wrap" data-pid="' + p.id + '" data-ci="0">' +
      '<div class="pdp-media rv">' +
        '<div class="stage"><img src="' + IMG(p.img, "portrait_4_3") + '" alt="' + esc(pick(p.name)) + '"></div>' +
        '<div class="thumbs">' +
          '<button type="button" class="on" data-src="' + IMG(p.img, "portrait_4_3") + '"><img src="' + IMG(p.img, "square") + '" alt=""></button>' +
          '<button type="button" data-src="' + IMG(p.img2, "portrait_4_3") + '"><img src="' + IMG(p.img2, "square") + '" alt=""></button>' +
        "</div>" +
      "</div>" +

      '<div class="pdp-info">' +
        '<span class="kicker rv">' + esc(pick(cat.l)) + " · " + mk.name + "</span>" +
        '<h1 class="rv" style="--d:60ms">' + esc(pick(p.name)) + "</h1>" +
        '<div class="pdp-rate rv" style="--d:110ms">' + STAR + "<b>" + esc(p.rating) + "</b><span>·</span>" + t("pdp.reviews", p.reviews) + "</div>" +
        '<div class="pdp-price rv" style="--d:150ms">' + priceHTML(p) + '<span class="tax smallcaps">' + t("pdp.tax") + "</span></div>" +
        '<p class="pdp-lede rv" style="--d:190ms">' + esc(pick(p.lede)) + "</p>" +

        '<div class="opt rv" style="--d:230ms"><div class="opt-head"><span class="smallcaps">' + t("pdp.finish") + '</span><span class="val">' + esc(pick(p.colors[0].l)) + "</span></div>" +
          '<div class="swatches">' + p.colors.map((c, i) =>
            '<button type="button" class="chip swatch' + (i === 0 ? " on" : "") + '" data-val="' + esc(pick(c.l)) + '" data-i="' + i + '" style="--h:' + c.h + '" aria-label="' + esc(pick(c.l)) + '"><i style="background:' + c.h + '"></i></button>').join("") +
          "</div></div>" +

        '<div class="pdp-cta rv" style="--d:270ms">' +
          '<span class="qty"><button type="button" data-d="-1" aria-label="−"><i>−</i></button><span class="n">1</span><button type="button" data-d="1" aria-label="+"><i>+</i></button></span>' +
          '<button type="button" class="btn btn-dark btn-big magnet" id="add-bag"><span>' + t("pdp.addBag", money(p.price)) + "</span></button>" +
          '<button type="button" class="wish-big' + (inWl ? " on" : "") + '" data-wl="' + p.id + '" aria-label="wishlist">' + HEART + '<span>' + t("pdp.wish") + "</span></button>" +
        "</div>" +

        '<ul class="pdp-trust rv" style="--d:310ms">' +
          "<li>" + t("pdp.inStock") + "</li><li>" + t("pdp.returns") + "</li><li>" + t("pdp.insured") + "</li>" +
        "</ul>" +

        '<div class="pdp-accs rv" style="--d:350ms">' +
          acc(t("pdp.tabDesc"), esc(pick(p.lede)) + " " + t("pdp.descMore"), true) +
          acc(t("pdp.tabCare"), esc(pick(p.material))) +
          acc(t("pdp.tabShip"), t("pdp.shipBody")) +
        "</div>" +
      "</div>" +
    "</section>" +

    '<section class="sec"><div class="wrap mkban rv">' +
      '<img class="mkban-img" src="' + IMG(mk.img, "square") + '" alt="">' +
      '<div class="mkban-b"><span class="smallcaps">' + t("pdp.madeBy") + "</span><h2>" + esc(mk.name) + "</h2>" +
      "<p>" + esc(pick(mk.city)) + ", " + esc(pick(mk.country)) + " · " + t("pdp.since", mk.since) + "</p>" +
      '<p class="mkban-blurb">' + esc(pick(mk.blurb)) + "</p></div>" +
      '<div class="mkban-ops"><a class="lnk magnet" href="shop.html?maker=' + mk.id + '"><span>' + t("pdp.visit") + '</span><span class="ar">→</span></a></div>' +
    "</div></section>" +

    '<section class="sec" style="padding-top:0"><div class="wrap">' +
      shead(t("rel.k"), t("rel.title")) + grid(rel) +
    "</div></section>";
  };

  /* ============================================================
     JOURNAL
     ============================================================ */
  const journalPage = () => {
    const id = params.get("id");
    const a = id ? D.ARTICLES.find((x) => x.id === id) : null;

    if (a) {
      const more = D.ARTICLES.filter((x) => x.id !== a.id).slice(0, 2);
      return "" +
      '<article class="article">' +
        '<div class="wrap">' +
          '<a class="crumb-back rv" href="journal.html">← ' + t("journal.back") + "</a>" +
          '<span class="kicker rv" style="--d:60ms">' + esc(pick(a.k)) + "</span>" +
          '<h1 class="art-title rv" style="--d:120ms">' + esc(pick(a.t)) + "</h1>" +
          '<p class="art-dek rv" style="--d:180ms">' + esc(pick(a.de)) + " · " + t("journal.read", a.min) + "</p>" +
        "</div>" +
        '<div class="wrap"><div class="art-hero rv" style="--d:220ms"><img src="' + IMG(a.img, "landscape_16_9") + '" alt=""></div>' +
        '<div class="art-body">' + pick(a.body).map((pp, i) => '<p class="rv" style="--d:' + (i * 60) + 'ms">' + esc(pp) + "</p>").join("") + "</div>" +
        '<p class="art-end rv">' + t("journal.end") + "</p>" +
        '<div class="art-more"><div class="wrap">' +
          shead(t("sec.journalK"), t("journal.more")) +
          '<div class="jgrid">' + more.map((x, i) => jcard(x, i)).join("") + "</div>" +
        "</div></div></div>" +
      "</article>";
    }

    const [f, ...rest] = D.ARTICLES;
    return pageHead(t("sec.journalK"), hh("journal.title")) +
      '<section class="sec"><div class="wrap">' +
        '<div class="jfeat">' + jcard(f, 0, true) + "</div>" +
        '<div class="jgrid" style="margin-top:26px">' + rest.map((x, i) => jcard(x, i)).join("") + "</div>" +
      "</div></section>";
  };

  /* ============================================================
     CART
     ============================================================ */
  const cartPage = () => {
    const bag = S().bag;
    const n = bag.reduce((s, l) => s + l.qty, 0);
    const sub = bag.reduce((s, l) => s + (D.byId(l.pid) ? D.byId(l.pid).price * l.qty : 0), 0);
    const ship = shipCost("std", sub);

    if (!bag.length) {
      const reco = D.CATALOG.filter((p) => p.isHot).slice(0, 4);
      return pageHead(t("cart.count", 0), hh("cart.title")) +
        '<section class="sec"><div class="wrap">' + emptyBox(t("cart.empty"), t("cart.emptySub"), "shop.html", t("cart.browse")) +
        '<div style="margin-top:84px">' + shead(t("cart.recoK"), t("cart.recoTitle")) + grid(reco) + "</div></div></section>";
    }

    const line = (l, i) => {
      const p = D.byId(l.pid); if (!p) return "";
      const c = p.colors[l.ci] || p.colors[0];
      return '<div class="cline rv" style="--d:' + (i * 60) + 'ms" data-pid="' + l.pid + '" data-ci="' + l.ci + '">' +
        '<a class="cl-thumb" href="product.html?id=' + l.pid + '"><img src="' + IMG(p.img, "square") + '" alt=""></a>' +
        '<div class="cl-main"><a class="cl-name" href="product.html?id=' + l.pid + '">' + esc(pick(p.name)) + "</a>" +
          '<span class="cl-var">' + esc(pick(c.l)) + " · " + money(p.price) + "</span>" +
          '<div class="cl-ops"><span class="cqty"><button type="button" data-d="-1" data-pid="' + l.pid + '" data-ci="' + l.ci + '" aria-label="−">−</button><span class="n">' + l.qty + '</span><button type="button" data-d="1" data-pid="' + l.pid + '" data-ci="' + l.ci + '" aria-label="+">+</button></span>' +
          '<button type="button" class="cl-rm" data-rm data-pid="' + l.pid + '" data-ci="' + l.ci + '">' + t("cart.remove") + "</button></div></div>" +
        '<div class="cl-price"><b>' + money(p.price * l.qty) + "</b></div>" +
      "</div>";
    };

    const reco = D.CATALOG.filter((p) => p.isHot && !bag.some((l) => l.pid === p.id)).slice(0, 4);

    return pageHead(t("cart.count", n), hh("cart.title")) +
      '<section class="sec"><div class="wrap cart-grid">' +
        '<div class="cart-lines">' + bag.map(line).join("") + "</div>" +
        '<aside class="cart-sum rv">' +
          '<p class="smallcaps sum-t">' + t("cart.summary") + "</p>" +
          '<div class="sum-row"><span>' + t("cart.subtotal") + "</span><b>" + money(sub) + "</b></div>" +
          '<div class="sum-row"><span>' + t("cart.shipping") + "</span><b>" + (ship ? money(ship) : t("cart.free")) + "</b></div>" +
          '<div class="sum-row"><span>' + t("cart.duty") + "</span><b>" + t("cart.included") + "</b></div>" +
          '<div class="sum-row total"><span>' + t("cart.total") + "</span><b>" + money(sub + ship) + "</b></div>" +
          '<a class="btn btn-dark btn-big magnet" href="checkout.html"><span>' + t("cart.checkout") + '</span><span class="ar">→</span></a>' +
          '<p class="sum-note">' + t("cart.note") + "</p>" +
        "</aside>" +
      "</div>" +
      (reco.length ? '<div style="margin-top:84px">' + shead(t("cart.recoK"), t("cart.recoTitle")) + grid(reco) + "</div>" : "") +
      "</div></section>";
  };

  /* ============================================================
     CHECKOUT
     ============================================================ */
  const checkoutPage = () => {
    if (coDone) return coSuccess(coDone);

    const bag = S().bag;
    if (!bag.length) return pageHead(t("page.checkout"), hh("co.titleBig")) +
      '<section class="sec"><div class="wrap">' + emptyBox(t("co.empty"), t("co.emptySub"), "shop.html", t("cart.browse")) + "</div></section>";

    if (!coAddr) { const def = S().addrs.find((a) => a.def) || S().addrs[0]; coAddr = def ? def.id : null; }

    const sub = bag.reduce((s, l) => s + (D.byId(l.pid) ? D.byId(l.pid).price * l.qty : 0), 0);
    const ship = shipCost(coShip, sub);
    const total = sub + ship;
    const itemCount = bag.reduce((s, l) => s + l.qty, 0);

    const coStep = (n, key, inner) =>
      '<section class="co-step rv"><header class="cs-h"><span class="cs-n">' + n + "</span><h2>" + t(key) + "</h2></header>" +
      '<div class="cs-b">' + inner + "</div></section>";

    const opt = (name, val, checked, title, note, price) =>
      '<label class="co-opt"><input type="radio" name="' + name + '" value="' + val + '"' + (checked ? " checked" : "") + ">" +
      '<span class="co-opt-in"><span class="co-txt"><b>' + title + "</b><span>" + note + "</span></span>" + (price ? '<b class="co-p">' + price + "</b>" : "") + "</span></label>";

    const miniLine = (l) => {
      const p = D.byId(l.pid); if (!p) return "";
      return '<div class="mini-line"><img src="' + IMG(p.img, "square") + '" alt=""><span>' + esc(pick(p.name)) + " ×" + l.qty + "</span><b>" + money(p.price * l.qty) + "</b></div>";
    };

    const addrOpts = S().addrs.map((a) =>
      '<label class="co-opt"><input type="radio" name="co-addr" value="' + a.id + '"' + (coAddr === a.id ? " checked" : "") + ">" +
      '<span class="co-opt-in"><span class="co-txt"><b>' + esc(a.name) + (a.def ? ' <i class="pill pill-soft">' + t("addr.default") + "</i>" : "") + "</b><span>" + addrText(a) + "</span></span></span></label>").join("");

    return pageHead(t("page.checkout") + " · " + t("co.items", itemCount), hh("co.titleBig")) +
      '<section class="sec"><div class="wrap co-grid">' +
        '<div class="co-main">' +

          coStep("01", "co.s1",
            addrOpts +
            '<button type="button" class="co-add" data-aadd>+ ' + t("co.newAddr") + "</button>" +
            (addrOpen ? addrForm() : "")) +

          coStep("02", "co.s2",
            opt("co-ship", "std", coShip === "std", t("co.std"), t("co.stdNote"), shipCost("std", sub) ? money(12) : t("cart.free")) +
            opt("co-ship", "exp", coShip === "exp", t("co.exp"), t("co.expNote"), money(18))) +

          coStep("03", "co.s3",
            opt("co-pay", "card", coPay === "card", t("co.card"), t("co.cardNote")) +
            opt("co-pay", "wallet", coPay === "wallet", t("co.wallet"), t("co.walletNote"))) +

          coStep("04", "co.s4",
            '<div class="co-review">' + bag.map(miniLine).join("") + "</div>" +
            '<p class="co-reviewnote">' + t("co.reviewNote") + "</p>") +
        "</div>" +

        '<aside class="co-side">' +
          '<div class="co-side-in rv">' +
            '<p class="smallcaps sum-t">' + t("cart.summary") + " · " + t("co.items", itemCount) + "</p>" +
            '<div class="sum-row"><span>' + t("cart.subtotal") + "</span><b>" + money(sub) + "</b></div>" +
            '<div class="sum-row"><span>' + t("cart.shipping") + "</span><b>" + (ship ? money(ship) : t("cart.free")) + "</b></div>" +
            '<div class="sum-row"><span>' + t("cart.duty") + "</span><b>" + t("cart.included") + "</b></div>" +
            '<div class="sum-row total"><span>' + t("cart.total") + "</span><b>" + money(total) + "</b></div>" +
            '<button type="button" class="btn btn-dark btn-big magnet" id="co-place"><span>' + t("co.place", money(total)) + "</span></button>" +
            '<p class="sum-note">' + t("co.terms") + "</p>" +
          "</div>" +
        "</aside>" +
      "</div></section>";
  };

  const coSuccess = (o) => {
    const eta = new Date(Date.now() + (o.ship === "exp" ? 4 : 10) * 864e5)
      .toLocaleDateString(locale(), { month: "long", day: "numeric" });
    const count = o.items.reduce((s, i) => s + i.qty, 0);
    const total = o.items.reduce((s, i) => s + (D.byId(i.pid) ? D.byId(i.pid).price * i.qty : 0), 0) + shipCost(o.ship, 0);
    return '<section class="cos"><div class="wrap cos-in"><div class="cos-card">' +
      '<svg class="cos-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="29"/><path d="M20 33.5 28.5 42 45 23"/></svg>' +
      '<span class="kicker">' + t("page.checkout") + "</span>" +
      "<h1>" + t("co.done") + "</h1>" +
      '<p class="cos-no">' + o.no + "</p>" +
      '<p class="cos-sub">' + t("co.doneSub") + "</p>" +
      '<div class="cos-meta">' +
        "<div><span>" + t("co.items") + "</span><b>" + count + "</b></div>" +
        "<div><span>" + t("ord.total") + "</span><b>" + money(total) + "</b></div>" +
        "<div><span>" + t("co.eta") + "</span><b>" + eta + "</b></div>" +
      "</div>" +
      '<div class="cos-cta">' +
        '<a class="btn btn-dark magnet" href="account.html#/order/' + o.no + '"><span>' + t("co.track") + '</span><span class="ar">→</span></a>' +
        '<a class="btn btn-ghost magnet" href="shop.html"><span>' + t("co.continue") + "</span></a>" +
      "</div>" +
    "</div></div></section>";
  };

  /* ============================================================
     ACCOUNT
     ============================================================ */
  const NAV = [
    ["", "acct.overview", "home"],
    ["orders", "acct.orders", "box"],
    ["wishlist", "acct.wishlist", "heart"],
    ["following", "acct.following", "shop"],
    ["addresses", "acct.addresses", "pin"],
    ["settings", "acct.settings", "gear"],
    ["support", "acct.support", "chat"]
  ];
  const hash = () => location.hash.replace(/^#\/?/, "");
  const acctRoute = () => { const h = hash().split("/"); return { view: h[0] || "overview", arg: h[1] || "" }; };

  const ordTotal = (o) => o.items.reduce((s, it) => s + (D.byId(it.pid) ? D.byId(it.pid).price * it.qty : 0), 0);
  const ordStatus = (o) => o.events[o.events.length - 1];
  const ordPill = (o) => {
    const k = ordStatus(o).k;
    return '<span class="pill ' + (k === "done" ? "ok" : "run") + '">' + t("lg." + k) + "</span>";
  };
  const ordThumbs = (o) =>
    '<span class="oc-thumbs">' + o.items.map((it) => {
      const p = D.byId(it.pid); if (!p) return "";
      return '<a href="product.html?id=' + it.pid + '"><img src="' + IMG(p.img, "square") + '" alt=""><i>×' + it.qty + "</i></a>";
    }).join("") + "</span>";

  const accountPage = () => {
    const { view, arg } = acctRoute();
    const st = S();

    const side = '<nav class="a-nav">' + NAV.map((n) =>
      '<a href="account.html#/' + n[0] + '" class="' + (view === n[0] ? "on" : "") + '">' + I[n[2]] + "<span>" + t(n[1]) + "</span></a>").join("") + "</nav>";

    let title, kicker, body;

    if (view === "orders" || view === "order") {
      if (view === "order" && arg) {
        const o = st.orders.find((x) => x.no === arg);
        if (o) { kicker = t("acct.orders"); title = o.no; body = orderDetail(o); }
        else { kicker = t("acct.orders"); title = t("ord.notFound"); body = '<div class="wrap">' + emptyBox(t("ord.notFound"), "", "account.html#/orders", t("ord.back")) + "</div>"; }
      } else {
        kicker = t("acct.orders"); title = t("acct.orders");
        body = st.orders.length
          ? '<div class="wrap">' + st.orders.map(orderCard).join("") + "</div>"
          : '<div class="wrap">' + emptyBox(t("acct.noOrders"), t("acct.noOrdersSub"), "shop.html", t("acct.shopNow")) + "</div>";
      }
    } else if (view === "wishlist") {
      kicker = t("acct.wishlist"); title = hh("wl.title");
      const items = st.wl.map((id) => D.byId(id)).filter(Boolean);
      body = items.length
        ? '<div class="wrap acct-grid-wrap">' + grid(items) + "</div>"
        : '<div class="wrap">' + emptyBox(t("wl.empty"), t("wl.emptySub"), "shop.html", t("wl.browse")) + "</div>";
    } else if (view === "following") {
      kicker = t("acct.following"); title = hh("fl.title");
      const fol = st.follows.map((id) => D.makerById(id)).filter(Boolean);
      const rest = D.MAKERS.filter((m) => !st.follows.includes(m.id));
      body = '<div class="wrap">' +
        (fol.length ? '<div class="mkgrid">' + fol.map(makerCard).join("") + "</div>"
          : emptyBox(t("fl.empty"), t("fl.emptySub"), "index.html#makers", t("fl.discover"))) +
        (rest.length ? '<div style="margin-top:70px">' + shead(t("fl.discover"), t("sec.makersTitle")) + '<div class="mkgrid">' + rest.map(makerCard).join("") + "</div></div>" : "") +
        "</div>";
    } else if (view === "addresses") {
      kicker = t("acct.addresses"); title = hh("addr.title");
      body = '<div class="wrap addr-wrap">' +
        '<div class="adc-list">' + (st.addrs.length ? st.addrs.map(addrCard).join("") : emptyBox(t("addr.empty"), t("addr.emptySub"))) + "</div>" +
        '<div class="addr-side"><button type="button" class="btn btn-dark" data-aadd><span>+ ' + t("addr.add") + "</span></button>" +
        (addrOpen ? addrForm() : "") + "</div>" +
        "</div>";
    } else if (view === "settings") {
      kicker = t("acct.settings"); title = hh("set.title");
      body = settingsPage(st);
    } else if (view === "support") {
      kicker = t("acct.support"); title = hh("sup.title");
      body = supportPage();
    } else {
      kicker = t("acct.overview"); title = hh("acct.title");
      body = overviewPage(st);
    }

    return pageHead(kicker, title) +
      '<section class="sec acct"><div class="wrap acct-grid">' + side + '<div class="a-body">' + body + "</div></div></section>";
  };

  const orderCard = (o, i) =>
    '<article class="oc rv" style="--d:' + (i * 60) + 'ms">' +
      '<header class="oc-h"><div><b>' + o.no + "</b><span>" + fmtDate(o.iso) + "</span></div>" + ordPill(o) + "</header>" +
      '<div class="oc-m">' + ordThumbs(o) + "<span>" + t("ord.items", o.items.reduce((s, x) => s + x.qty, 0)) + "</span></div>" +
      '<footer class="oc-f"><b>' + money(ordTotal(o)) + '</b><a class="lnk" href="account.html#/order/' + o.no + '"><span>' + t("acct.track") + '</span><span class="ar">→</span></a></footer>' +
    "</article>";

  const orderDetail = (o) => {
    const a = S().addrs.find((x) => x.id === o.addr) || S().addrs[0];
    const mk = (l, v) => "<div><span>" + l + "</span><b>" + v + "</b></div>";
    return '<div class="wrap od">' +
      '<a class="crumb-back" href="account.html#/orders">← ' + t("ord.back") + "</a>" +
      '<div class="od-head rv"><h2>' + o.no + "</h2>" + ordPill(o) + "</div>" +
      '<div class="od-meta rv" style="--d:60ms">' +
        mk(t("ord.placed"), fmtDate(o.iso)) +
        mk(t("ord.items"), o.items.reduce((s, x) => s + x.qty, 0)) +
        mk(t("ord.total"), money(ordTotal(o))) +
        mk(t("ord.ship"), t("ship." + o.ship)) +
        mk(t("ord.pay"), t("pay." + o.pay)) +
      "</div>" +
      (a ? '<div class="od-addr rv" style="--d:100ms"><span class="smallcaps">' + t("ord.addr") + "</span><p>" + addrText(a) + "</p></div>" : "") +
      '<div class="od-items rv" style="--d:140ms">' + o.items.map((it) => {
        const p = D.byId(it.pid); if (!p) return "";
        return '<a class="oi-line" href="product.html?id=' + it.pid + '"><img src="' + IMG(p.img, "square") + '" alt="">' +
          "<span><b>" + esc(pick(p.name)) + "</b><i>" + esc(pick((p.colors[it.ci] || p.colors[0]).l)) + " ×" + it.qty + "</i></span><b>" + money(p.price * it.qty) + "</b></a>";
      }).join("") + "</div>" +
      '<div class="tlbox rv" style="--d:180ms">' +
        '<div class="tl-head"><span class="smallcaps">' + t("ord.timeline") + "</span>" +
        '<button type="button" class="btn btn-ghost playbtn" data-play>' + PLANE + "<span>" + t("ord.play") + "</span></button></div>" +
        '<div class="tl" data-cur="' + o.current + '">' +
          '<span class="tl-marker" aria-hidden="true">' + PLANE + "</span>" +
          D.LG_ORDER.map((k, i) => {
            const ev = o.events[i];
            return '<div class="tl-step' + (ev ? " lit" : "") + (i === o.current && ev ? " now" : "") + '">' +
              '<span class="tl-dot"><i></i></span>' +
              '<div class="tl-body"><span class="tl-k">' + t("lg." + k) + "</span>" +
              (ev ? '<span class="tl-meta">' + ev.iso + " · " + esc(pick(ev.loc)) + "</span>" : '<span class="tl-meta pend">' + t("ord.pending") + "</span>") +
              "</div></div>";
          }).join("") +
        "</div>" +
      "</div>" +
    "</div>";
  };

  const overviewPage = (st) => {
    const hour = new Date().getHours();
    const greet = hour < 12 ? t("acct.gm") : hour < 18 ? t("acct.ga") : t("acct.ge");
    const last = st.orders[0];
    const tiles = [["orders", "acct.orders", "box"], ["wishlist", "acct.wishlist", "heart"], ["following", "acct.following", "shop"], ["addresses", "acct.addresses", "pin"], ["settings", "acct.settings", "gear"], ["support", "acct.support", "chat"]];
    return '<div class="wrap ov">' +
      '<div class="ov-hello rv"><h2>' + greet + ", " + t("acct.name") + ".</h2>" +
      '<p>' + t("acct.member") + " · " + t("acct.memberNote") + "</p></div>" +
      '<div class="ov-stats">' +
        [["" + st.orders.length, "acct.statOrders"], ["" + st.wl.length, "acct.statWl"], ["" + st.follows.length, "acct.statFl"], ["" + st.addrs.length, "acct.statAddr"]].map((s, i) =>
          '<a class="ov-stat rv" style="--d:' + (i * 60) + 'ms" href="account.html#/' + (["orders", "wishlist", "following", "addresses"][i]) + '"><b>' + s[0] + "</b><span>" + t(s[1]) + "</span></a>").join("") +
      "</div>" +
      (last ? '<div class="ov-last rv"><div class="ov-last-h"><span class="smallcaps">' + t("acct.latest") + "</span>" + ordPill(last) + "</div>" +
        '<a class="ov-last-b" href="account.html#/order/' + last.no + '">' + ordThumbs(last) +
        '<span class="ov-last-i"><b>' + last.no + "</b><span>" + fmtDate(last.iso) + " · " + money(ordTotal(last)) + "</span></span>" +
        '<span class="ov-bar"><i style="width:' + Math.round(((last.current + 1) / D.LG_ORDER.length) * 100) + '%"></i></span>' +
        '<span class="lnk"><span>' + t("acct.track") + '</span><span class="ar">→</span></span></a></div>' : "") +
      '<div class="ov-quick rv"><span class="smallcaps">' + t("acct.quick") + "</span>" +
        '<div class="ov-tiles">' + tiles.map((x) =>
          '<a href="account.html#/' + x[0] + '">' + I[x[2]] + "<span>" + t(x[1]) + "</span></a>").join("") + "</div></div>" +
    "</div>";
  };

  const addrCard = (a, i) =>
    '<div class="adc rv' + (a.def ? " def" : "") + '" style="--d:' + (i * 60) + 'ms">' +
      '<div class="adc-h"><b>' + esc(a.name) + "</b>" + (a.def ? '<span class="pill pill-soft">' + t("addr.default") + "</span>" : "") + "</div>" +
      "<p>" + addrText(a) + "</p>" +
      '<div class="adc-ops">' + (!a.def ? '<button type="button" class="mini" data-adef="' + a.id + '">' + t("addr.setDefault") + "</button>" : "") +
      '<button type="button" class="mini danger" data-adel="' + a.id + '">' + t("addr.delete") + "</button></div>" +
    "</div>";

  const settingsPage = (st) => {
    const cur = st.set.cur || "USD";
    const lang = window.I18N ? I18N.get() : "en";
    const sw = (n, key, note) =>
      '<div class="set-row"><div><b>' + t(key) + "</b><span>" + t(note) + "</span></div>" +
      '<button type="button" class="switch' + (st.set[n] ? " on" : "") + '" data-n="' + n + '" aria-pressed="' + !!st.set[n] + '"><i></i></button></div>';
    return '<div class="wrap set">' +
      '<div class="set-block rv"><p class="smallcaps sum-t">' + t("set.cur") + '</p><p class="set-note">' + t("set.curNote") + "</p>" +
        '<div class="set-curs">' + [["USD", "$ USD"], ["CNY", "¥ CNY"], ["JPY", "¥ JPY"]].map((c) =>
          '<button type="button" class="curcard' + (cur === c[0] ? " on" : "") + '" data-cur="' + c[0] + '"><b>' + c[1] + "</b><span>" + (cur === c[0] ? "●" : "○") + "</span></button>").join("") + "</div></div>" +
      '<div class="set-block rv" style="--d:60ms"><p class="smallcaps sum-t">' + t("set.lang") + '</p><p class="set-note">' + t("set.langNote") + "</p>" +
        '<div class="set-langs">' + [["en", "English"], ["zh", "中文"], ["ja", "日本語"]].map((l) =>
          '<button type="button" class="curcard' + (lang.indexOf(l[0]) === 0 ? " on" : "") + '" data-slang="' + l[0] + '"><b>' + l[1] + "</b><span>" + (lang.indexOf(l[0]) === 0 ? "●" : "○") + "</span></button>").join("") + "</div></div>" +
      '<div class="set-block rv" style="--d:120ms"><p class="smallcaps sum-t">' + t("set.notif") + "</p>" +
        sw("n1", "set.n1", "set.n1n") + sw("n2", "set.n2", "set.n2n") + sw("n3", "set.n3", "set.n3n") + "</div>" +
      '<div class="set-block rv" style="--d:180ms"><p class="smallcaps sum-t">' + t("set.data") + '</p><p class="set-note">' + t("set.clearNote") + "</p>" +
        '<button type="button" class="btn btn-ghost danger-btn" data-clear><span class="clr-lab">' + t("set.clear") + "</span></button></div>" +
    "</div>";
  };

  const supportPage = () => {
    const faqs = D.FAQ.map((f, i) =>
      '<div class="acc rv" style="--d:' + (i * 50) + 'ms"><button class="acc-h" data-acc type="button"><span>' + t(f.q) + "</span><i></i></button>" +
      '<div class="acc-b"><div class="acc-bi"><p>' + t(f.a) + "</p></div></div></div>").join("");
    return '<div class="wrap sup">' +
      '<div class="sup-grid">' +
        '<div class="sup-faqs"><p class="smallcaps sum-t">' + t("sup.faq") + "</p>" + faqs + "</div>" +
        '<div class="sup-side">' +
          '<div class="chat rv">' +
            '<div class="chat-head"><span class="chat-dot"></span><div><b>' + t("sup.chat") + "</b><span>" + t("sup.chatNote") + "</span></div></div>" +
            '<div class="chat-log" id="chat-log">' + chatLog.map((m) => '<div class="msg ' + m.who + '">' + (m.raw ? esc(m.raw) : t(m.k)) + "</div>").join("") + "</div>" +
            '<form class="chat-form" id="chat-form"><input type="text" name="m" autocomplete="off" placeholder="' + t("sup.chatPh") + '" aria-label="chat"><button type="submit" aria-label="send"><svg viewBox="0 0 24 24"><path d="M21.5 3.2 2.9 10.4l6.2 2.4 2.3 6.3z"/><path d="M9.1 12.8 21.5 3.2"/></svg></button></form>' +
          "</div>" +
          '<div class="sup-meta rv" style="--d:90ms"><p class="smallcaps">Contact</p>' +
          '<p class="sup-mail">' + t("sup.email") + "</p><p>" + t("sup.hours") + "</p></div>" +
        "</div>" +
      "</div>" +
    "</div>";
  };

  /* ============================================================
     ROUTER + RENDER
     ============================================================ */
  const builders = { home: homePage, shop: shopPage, product: productPage, journal: journalPage, cart: cartPage, checkout: checkoutPage, account: accountPage };
  const route = () => (builders[page] || homePage)();

  const setTitle = () => {
    const map = {
      home: () => t("page.home"), shop: () => t("page.shop"), journal: () => t("page.journal"),
      cart: () => t("page.cart"), checkout: () => t("page.checkout"), account: () => t("page.account"),
      product: () => { const p = D.byId(params.get("id")); return p ? pick(p.name) + " — Quell" : t("page.shop"); }
    };
    document.title = (map[page] || map.home)();
  };

  const positionMarkers = () => {
    $$(".tl").forEach((tl) => {
      const steps = $$(".tl-step", tl);
      const s = steps[Math.min(+tl.dataset.cur, steps.length - 1)];
      const mk = $(".tl-marker", tl);
      if (mk && s) mk.style.top = (s.offsetTop + 7) + "px";
    });
  };

  const render = () => {
    const el = $("#pg");
    if (!el || !window.quell) { if (!el) return; }
    clearTimers();
    const el2 = $("#pg");
    if (!el2) return;
    el2.innerHTML = route();
    setTitle();
    if (window.quell) { quell.observe(); quell.splitAll(); }
    if (window.I18N && I18N.augment) I18N.augment();
    positionMarkers();
    const log = $("#chat-log");
    if (log) log.scrollTop = log.scrollHeight;
  };

  const onState = () => {
    if (page === "cart") render();
    else if (page === "checkout" && !coDone && !coBusy) render();
  };

  /* ============================================================
     TIMELINE PLAYBACK
     ============================================================ */
  const playTL = (tl) => {
    clearTimers();
    const steps = $$(".tl-step", tl);
    const cur = Math.min(+tl.dataset.cur, steps.length - 1);
    tl.classList.add("playing");
    steps.forEach((s) => s.classList.remove("lit"));
    const mk = $(".tl-marker", tl);
    if (mk) { mk.style.top = "7px"; }
    let i = 0;
    const stepFn = () => {
      if (i > cur) {
        tl.classList.remove("playing");
        tl.classList.add("played");
        if (Q()) Q().toast(t("t.playDone"));
        return;
      }
      steps[i].classList.add("lit");
      if (mk) mk.style.top = (steps[i].offsetTop + 7) + "px";
      i++;
      playTimers.push(setTimeout(stepFn, 640));
    };
    stepFn();
  };

  /* ============================================================
     DELEGATED EVENTS (bound once)
     ============================================================ */
  const qs = () => {
    const s = params.toString();
    return "shop.html" + (s ? "?" + s : "");
  };

  const onClick = (e) => {
    const el = e.target;

    /* shop tabs */
    const tab = el.closest("[data-tab]");
    if (tab && page === "shop") {
      e.preventDefault();
      const v = tab.dataset.tab;
      if (v === "all") params.delete("tab"); else params.set("tab", v);
      history.replaceState(null, "", qs());
      render();
      return;
    }

    /* shop category chips */
    const cf = el.closest("[data-cf]");
    if (cf && page === "shop") {
      const v = cf.dataset.cf;
      if (v) params.set("cat", v); else params.delete("cat");
      history.replaceState(null, "", qs());
      render();
      return;
    }

    /* clear maker filter */
    if (el.closest("[data-mclear]") && page === "shop") {
      params.delete("maker");
      history.replaceState(null, "", qs());
      render();
      return;
    }

    /* accordions */
    const ah = el.closest("[data-acc]");
    if (ah) { ah.closest(".acc").classList.toggle("open"); return; }

    /* cart qty / remove */
    const qb = el.closest(".cqty button");
    if (qb) {
      const l = S().bag.find((x) => x.pid === qb.dataset.pid && x.ci === +qb.dataset.ci);
      if (l) { l.qty = Math.max(1, l.qty + (+qb.dataset.d)); Q().persist("bag"); Q().renderBag(); render(); }
      return;
    }
    const rm = el.closest("[data-rm]");
    if (rm) {
      const st = S();
      st.bag = st.bag.filter((x) => !(x.pid === rm.dataset.pid && x.ci === +rm.dataset.ci));
      Q().persist("bag"); Q().renderBag(); render();
      return;
    }

    /* address form open / cancel */
    if (el.closest("[data-aadd]")) { addrOpen = true; render(); const f = $("#addr-form"); if (f) { const i = f.querySelector("input"); if (i) i.focus(); } return; }
    if (el.closest("[data-acancel]")) { addrOpen = false; render(); return; }

    /* address default / delete */
    const ad = el.closest("[data-adef]");
    if (ad) {
      const st = S();
      st.addrs.forEach((a) => { a.def = a.id === ad.dataset.adef; });
      Q().persist("addrs"); Q().toast(t("t.addrDefault"));
      render();
      return;
    }
    const dl = el.closest("[data-adel]");
    if (dl) {
      const st = S();
      st.addrs = st.addrs.filter((a) => a.id !== dl.dataset.adel);
      Q().persist("addrs"); Q().toast(t("t.addrDeleted"));
      render();
      return;
    }

    /* settings: notification switch */
    const sw = el.closest("[data-n]");
    if (sw) {
      const n = sw.dataset.n;
      const st = S();
      st.set[n] = !st.set[n];
      Q().persist("set");
      sw.classList.toggle("on", st.set[n]);
      sw.setAttribute("aria-pressed", String(!!st.set[n]));
      return;
    }

    /* settings: currency */
    const cu = el.closest("[data-cur]");
    if (cu) {
      S().set.cur = cu.dataset.cur;
      Q().persist("set"); Q().renderBag();
      render();
      Q().toast(t("set.cur"), cu.dataset.cur);
      return;
    }

    /* settings: language */
    const sl = el.closest("[data-slang]");
    if (sl && window.I18N) { I18N.set(sl.dataset.slang); return; }

    /* settings: clear data (two-step) */
    const cl = el.closest("[data-clear]");
    if (cl) {
      if (!cl.classList.contains("arm")) {
        cl.classList.add("arm");
        const lab = $(".clr-lab", cl);
        if (lab) lab.textContent = t("set.confirm");
        return;
      }
      Object.values(Q().LS).forEach((k) => { try { localStorage.removeItem(k); } catch (err) {} });
      try { localStorage.removeItem("quell-lang"); } catch (err) {}
      Q().toast(t("t.dataCleared"));
      setTimeout(() => location.reload(), 700);
      return;
    }

    /* order timeline play */
    const pb = el.closest("[data-play]");
    if (pb) { const tl = pb.closest(".tlbox").querySelector(".tl"); if (tl) playTL(tl); return; }

    /* place order */
    if (el.closest("#co-place")) {
      if (!coAddr) { addrOpen = true; render(); Q().toast(t("t.needAddr")); return; }
      coBusy = true;
      const st = S();
      const items = st.bag.map((l) => ({ pid: l.pid, ci: l.ci, qty: l.qty }));
      st.bag = [];
      Q().persist("bag");
      const o = Q().createOrder(items, coAddr, coShip, coPay);
      coDone = o; coBusy = false; addrOpen = false;
      Q().renderBag();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  };

  const onChange = (e) => {
    const el = e.target;
    if (el.matches("[data-sort]") && page === "shop") {
      params.set("sort", el.value);
      history.replaceState(null, "", qs());
      render();
      return;
    }
    if (page === "checkout" && (el.name === "co-addr" || el.name === "co-ship" || el.name === "co-pay")) {
      if (el.name === "co-addr") coAddr = el.value;
      else if (el.name === "co-ship") coShip = el.value;
      else coPay = el.value;
      render();
    }
  };

  const appendChat = (m) => {
    const log = $("#chat-log");
    if (!log) return;
    const d = document.createElement("div");
    d.className = "msg " + m.who;
    d.textContent = m.raw || t(m.k);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  };

  const onSubmit = (e) => {
    const f = e.target;

    if (f.id === "news-form") {
      e.preventDefault();
      f.reset();
      if (Q()) Q().toast(t("t.sub"), t("t.subSub"));
      return;
    }

    if (f.id === "addr-form") {
      e.preventDefault();
      const g = (n) => { const i = f.querySelector('[name="' + n + '"]'); return i ? i.value.trim() : ""; };
      const a = {
        id: "a" + Date.now().toString(36),
        name: g("name"), phone: g("phone"), country: f.querySelector('[name="country"]').value,
        region: { en: g("region"), zh: g("region"), ja: g("region") },
        city: { en: g("city"), zh: g("city"), ja: g("city") },
        street: { en: g("street"), zh: g("street"), ja: g("street") },
        zip: g("zip"), def: false
      };
      const st = S();
      if (!st.addrs.length) a.def = true;
      st.addrs.push(a);
      Q().persist("addrs");
      if (page === "checkout") coAddr = a.id;
      addrOpen = false;
      Q().toast(t("t.addrSaved"));
      render();
      return;
    }

    if (f.id === "chat-form") {
      e.preventDefault();
      const inp = f.querySelector("input");
      const v = (inp.value || "").trim();
      if (!v) return;
      inp.value = "";
      chatLog.push({ who: "me", raw: v });
      appendChat({ who: "me", raw: v });
      const log = $("#chat-log");
      const typing = document.createElement("div");
      typing.className = "msg bot typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      chatReply = (chatReply % 3) + 1;
      playTimers.push(setTimeout(() => {
        typing.remove();
        const m = { who: "bot", k: "sup.r" + chatReply };
        chatLog.push(m);
        appendChat(m);
      }, 1100));
      return;
    }
  };

  let bound = false;
  const bind = () => {
    if (bound) return;
    bound = true;
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("hashchange", () => { if (page === "account") { render(); } });
  };

  const boot = () => { bind(); render(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.quellPages = { render, onState };
})();
