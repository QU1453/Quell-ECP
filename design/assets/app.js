/* ============================================================
   QUELL — shared interactions (design preview)
   i18n-aware · event-delegated for re-rendered dynamic content
   ============================================================ */
(() => {
  "use strict";

  const IMG_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image";
  const scene = (subject, extra = "") =>
    IMG_API +
    "?prompt=" +
    encodeURIComponent(
      "minimal studio product photograph, " + subject +
      ", on warm beige seamless backdrop, soft diffused window light, gentle soft shadow, premium editorial e-commerce image, muted earthy palette, matte finish, high detail, no text" + extra
    ) +
    "&image_size=";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n) => "$" + n.toLocaleString("en-US");
  const t = (k) => (window.I18N ? I18N.m(k) : k);

  /* ---------- image seeding ---------- */
  const seedImages = () => {
    $$("img[data-img]").forEach((img) => {
      const size = img.dataset.size || "square_hd";
      img.src = scene(img.dataset.img, img.dataset.extra || "") + size;
      img.alt = img.dataset.alt || img.dataset.img;
    });
    $$("[data-imgbg]").forEach((el) => {
      const size = el.dataset.size || "portrait_4_3";
      el.style.backgroundImage = "url('" + scene(el.dataset.imgbg, el.dataset.extra || "") + size + "')";
    });
  };

  /* ---------- chrome ---------- */
  const chrome = $(".chrome");
  const onScroll = () => {
    if (!chrome) return;
    const y = window.scrollY;
    chrome.classList.toggle("solid", y > 24);
    chrome.classList.toggle("hidemicro", y > 90);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveals ---------- */
  const revealEls = $$(".rv");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add("in"));

  /* ---------- toasts ---------- */
  const toastWrap = (() => {
    let w = $(".toast-wrap");
    if (!w) { w = document.createElement("div"); w.className = "toast-wrap"; document.body.appendChild(w); }
    return w;
  })();
  const toast = (title, sub) => {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      '<span class="tick"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6.5 4.8 9 10 3.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      "<span>" + title + (sub ? '<span class="sub">' + sub + "</span>" : "") + "</span>";
    toastWrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("on"));
    setTimeout(() => { el.classList.remove("on"); setTimeout(() => el.remove(), 600); }, 3200);
  };

  /* ---------- bag ---------- */
  const veil = $(".veil");
  const bag = $(".bag");
  const bagCount = $(".bag-count");

  const countLines = () => {
    if (!bag) return;
    let total = 0;
    $$(".line", bag).forEach((l) => { total += parseInt(l.dataset.qty || "1", 10); });
    if (bagCount) bagCount.textContent = total;
  };

  const ensureEmpty = (show) => {
    const holder = $(".bag-items");
    const list = $("#bag-list");
    const empty = $("#bag-empty");
    if (!holder) return;
    if (empty) empty.remove();
    if (!list) return;
    list.style.display = show ? "" : "none";
    if (show) return;
    const e = document.createElement("div");
    e.id = "bag-empty";
    e.className = "empty";
    e.innerHTML =
      '<div class="glyph">∅</div><p>' + t("bag.emptyTitle") + "</p>" +
      '<p style="margin-top:6px;font-size:13px">' + t("bag.emptySub") + "</p>";
    holder.appendChild(e);
  };

  const bagTotal = () => {
    const foot = $(".bag-total b");
    if (!foot || !bag) return;
    let s = 0;
    let count = 0;
    $$(".line", bag).forEach((l) => { s += parseInt(l.dataset.price, 10) * parseInt(l.dataset.qty, 10); count += parseInt(l.dataset.qty, 10); });
    foot.textContent = fmt(s);
    const txt = $(".ship-bar .txt");
    const fill = $(".ship-fill");
    const TH = 200;
    if (txt && fill) {
      if (s >= TH) { txt.innerHTML = t("bag.shipFree"); fill.style.width = "100%"; }
      else { txt.innerHTML = t("bag.shipLeft").replace("%s", fmt(TH - s)); fill.style.width = Math.min(100, (s / TH) * 100) + "%"; }
    }
    ensureEmpty(count > 0);
  };

  const openBag = () => {
    if (veil) veil.classList.add("on");
    if (bag) bag.classList.add("open");
    document.body.classList.add("no-scroll");
    bagTotal();
    countLines();
  };
  const closeBag = () => {
    if (veil) veil.classList.remove("on");
    if (bag) bag.classList.remove("open");
    if (!menuOverlayOpen()) document.body.classList.remove("no-scroll");
  };
  const menuOverlayOpen = () => menu && menu.classList.contains("open");

  const lineSub = (line) => {
    const q = parseInt(line.dataset.qty, 10);
    const sub = $(".sub", line);
    if (sub) sub.textContent = fmt(parseInt(line.dataset.price, 10) * q);
  };

  const addLine = (item) => {
    const list = $("#bag-list");
    if (!list) return;
    const key = item.name + "|" + (item.variant || "");
    const existing = $$(".line", list).find((l) => l.dataset.key === key);
    if (existing) {
      existing.dataset.qty = String(parseInt(existing.dataset.qty, 10) + item.qty);
      const n = $(".mini-qty .n", existing);
      if (n) n.textContent = existing.dataset.qty;
      lineSub(existing);
    } else {
      const d = document.createElement("div");
      d.className = "line";
      d.dataset.key = key;
      d.dataset.qty = String(item.qty || 1);
      d.dataset.price = String(item.price);
      if (item.pid) d.dataset.pid = String(item.pid);
      if (item.ci != null) d.dataset.ci = String(item.ci);
      d.innerHTML =
        '<div class="thumb"><img alt="' + (item.alt || "") + '" src="' + item.img + '"></div>' +
        '<div><div class="top"><div><div class="nm">' + item.name + "</div>" +
        '<div class="vr">' + (item.variant || "") + "</div></div>" +
        '<button class="rm" aria-label="Remove">' + t("bag.remove") + "</button></div>" +
        '<div class="op"><span class="mini-qty"><button class="mq" data-d="-1">−</button><span class="n">' + d.dataset.qty + '</span><button class="mq" data-d="1">+</button></span>' +
        '<span class="sub">' + fmt(item.price * d.dataset.qty) + "</span></div></div>";
      list.appendChild(d);
    }
    countLines();
    bagTotal();
  };

  const removeLine = (line) => {
    line.style.opacity = "0";
    line.style.transform = "translateX(30px)";
    line.style.transition = "all .45s var(--ease-out)";
    setTimeout(() => { line.remove(); countLines(); bagTotal(); }, 380);
  };

  const onBagClick = (e) => {
    const tgt = e.target;
    if (tgt.classList.contains("mq")) {
      const line = tgt.closest(".line");
      const q = Math.max(1, parseInt(line.dataset.qty, 10) + parseInt(tgt.dataset.d, 10));
      line.dataset.qty = String(q);
      const n = $(".mini-qty .n", line);
      if (n) n.textContent = q;
      lineSub(line);
      countLines();
      bagTotal();
    } else if (tgt.classList.contains("rm")) {
      removeLine(tgt.closest(".line"));
    }
  };
  if (bag) bag.addEventListener("click", onBagClick);

  const bumpCount = () => {
    if (bagCount) { bagCount.classList.remove("bump"); void bagCount.offsetWidth; bagCount.classList.add("bump"); }
  };

  const addProduct = (detail) => {
    addLine({
      name: detail.name, price: +detail.price, img: scene(detail.img) + "square_hd",
      variant: detail.variant, alt: detail.alt || detail.name, qty: +detail.qty || 1,
      pid: detail.pid, ci: detail.ci != null ? parseInt(detail.ci, 10) : null
    });
    bumpCount();
    toast(t("t.added"), detail.name);
  };

  /* ---------- menu ---------- */
  const menu = $("#menu");
  const openMenu = () => { if (menu) menu.classList.add("open"); document.body.classList.add("no-scroll"); };
  const closeMenu = () => { if (menu) menu.classList.remove("open"); if (!(bag && bag.classList.contains("open"))) document.body.classList.remove("no-scroll"); };

  /* ---------- global delegated clicks ---------- */
  document.addEventListener("click", (e) => {
    const el = e.target;

    if (el.closest("[data-open-bag]")) { openBag(); return; }
    if (el.closest("[data-close-bag]")) { closeBag(); return; }
    if (el.closest(".menu-close")) { closeMenu(); return; }
    if (el.closest(".burger")) { openMenu(); return; }
    if (el.closest(".menu-overlay a")) { closeMenu(); return; }

    if (el.closest(".quick")) { const card = el.closest("[data-name]"); if (card) addProduct(card.dataset); return; }
    if (el.closest("#add-bag")) {
      const root = el.closest("[data-name]");
      const chip = $(".chip.swatch.on, .chip[data-val].on");
      const qtyN = $(".qty .n");
      const detail = Object.assign({}, root ? root.dataset : {}, {
        qty: qtyN ? parseInt(qtyN.textContent, 10) : 1,
        ci: chip ? parseInt(chip.dataset.i || "0", 10) : (root && root.dataset.ci != null ? parseInt(root.dataset.ci, 10) : 0),
        variant: chip ? chip.dataset.val : (root ? root.dataset.variant : "Standard")
      });
      addProduct(detail);
      return;
    }

    const th = el.closest(".thumbs button");
    if (th) {
      const group = th.closest(".thumbs");
      const stage = $(".stage img");
      $$("button", group).forEach((x) => x.classList.remove("on"));
      th.classList.add("on");
      if (stage && th.dataset.src) { stage.src = th.dataset.src; stage.style.animation = "none"; void stage.offsetWidth; stage.style.animation = ""; }
      return;
    }
    const chip = el.closest(".chip[data-val]");
    if (chip) {
      const box = chip.closest(".opt");
      $$(".chip[data-val]", box).forEach((x) => x.classList.remove("on"));
      chip.classList.add("on");
      const out = $(".opt-head .val", box.closest(".pdp-info") || box);
      if (out) out.textContent = chip.dataset.val;
      return;
    }
    const qb = el.closest(".qty button");
    if (qb) {
      const box = qb.closest(".qty");
      const n = $(".n", box);
      let q = parseInt(n.textContent, 10) + parseInt(qb.dataset.d, 10);
      n.textContent = Math.max(1, q);
      return;
    }

    if (el.closest(".tool.search-t")) {
      const searchBox = $("#searchbox");
      if (searchBox) {
        searchBox.classList.toggle("on");
        if (searchBox.classList.contains("on")) { const inp = $("input", searchBox); if (inp) inp.focus(); }
      }
      return;
    }
    if (el.closest(".tool.acct-t")) { toast(t("t.acct"), t("t.acctSub")); return; }
    if (el.closest(".btn.checkout-demo")) { toast(t("t.checkout"), t("t.checkoutSub")); return; }
    if (el.closest('a[href="#"]')) { e.preventDefault(); toast(t("t.link"), t("t.linkSub")); }
  });

  /* forms */
  const newsForm = $("#news-form");
  if (newsForm) {
    newsForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      newsForm.reset();
      toast(t("t.sub"), t("t.subSub"));
    });
  }
  const searchInput = $("#search-input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") { toast(t("t.search"), t("t.searchSub")); searchInput.value = ""; }
    });
  }

  /* ---------- language refresh for bag text ---------- */
  const localizeLine = (line) => {
    const pid = line.dataset.pid;
    if (!pid || !window.QUEL_CAT) return;
    const prod = QUEL_CAT.find((x) => x.id === pid);
    if (!prod) return;
    const nm = $(".nm", line);
    if (nm) nm.textContent = QUEL_PICK(prod.name);
    const ci = parseInt(line.dataset.ci || "0", 10);
    const col = prod.colors[ci] || prod.colors[0];
    const vr = $(".vr", line);
    if (vr && col) vr.textContent = QUEL_PICK(col.l);
  };
  const refreshUI = () => {
    $$(".rm", bag || document).forEach((b) => { b.textContent = t("bag.remove"); });
    $$(".line", bag || document).forEach(localizeLine);
    bagTotal();
    countLines();
  };
  if (window.I18N) I18N.onChange(refreshUI);

  /* ---------- expose ---------- */
  window.quell = { openBag, closeBag, toast, fmt, img: (p, s) => scene(p) + (s || "square_hd") };

  seedImages();
  countLines();
  bagTotal();
})();
