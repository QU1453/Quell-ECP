/* ============================================================
   QUELL — interaction layer (design preview)
   state persistence · curtain transitions · split text ·
   magnetic buttons · fly-to-bag · bag drawer · overlays ·
   toasts. Load LAST (after i18n / data / layout / pages).
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const t = (k) => (window.I18N ? I18N.m(k) : k);

  const IMG_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image";
  const scene = (subject, extra = "") =>
    IMG_API + "?prompt=" + encodeURIComponent(
      "minimal studio product photograph, " + subject +
      ", on warm beige seamless backdrop, soft diffused window light, gentle soft shadow, premium editorial e-commerce image, muted earthy palette, matte finish, high detail, no text" + extra
    ) + "&image_size=";
  const img = (p, s) => scene(p) + (s || "square_hd");

  const D = window.QUELL_DATA;
  const pick = (o) => (D ? D.pick(o) : o && o.en);

  /* ============================================================
     STATE — localStorage persistence
     ============================================================ */
  const LS = {
    bag: "quell_bag_v2", wl: "quell_wl_v2", follows: "quell_follows_v2",
    addrs: "quell_addrs_v2", orders: "quell_orders_v2", set: "quell_set_v2"
  };
  const load = (k, seed) => {
    try { const v = JSON.parse(localStorage.getItem(k)); if (v != null) return v; } catch (e) {}
    if (seed) { localStorage.setItem(k, JSON.stringify(seed)); return seed; }
    return seed;
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const state = {
    bag: load(LS.bag, []),
    wl: load(LS.wl, ["throw", "teapot"]),
    follows: load(LS.follows, ["nord", "kaol"]),
    addrs: load(LS.addrs, D ? D.seedAddrs() : []),
    orders: load(LS.orders, D ? D.seedOrders() : []),
    set: Object.assign({ cur: "USD", n1: true, n2: false, n3: true }, load(LS.set, {}))
  };
  const persist = (key) => save(LS[key], state[key]);
  const emit = () => document.dispatchEvent(new CustomEvent("quell:state"));

  /* ---------- currency ---------- */
  const money = (usd) => {
    const cur = state.set.cur || "USD";
    const r = (D && D.RATES[cur]) || 1;
    const v = Math.round(usd * r);
    const sym = cur === "USD" ? "$" : "¥";
    return sym + v.toLocaleString("en-US");
  };

  /* ============================================================
     TOASTS
     ============================================================ */
  const toastWrap = (() => {
    let w = $(".toast-wrap");
    if (!w) { w = document.createElement("div"); w.className = "toast-wrap"; document.body.appendChild(w); }
    return w;
  })();
  const toast = (title, sub) => {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="tick"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6.5 4.8 9 10 3.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      "<span>" + title + (sub ? '<span class="sub">' + sub + "</span>" : "") + "</span>";
    toastWrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("on"));
    setTimeout(() => { el.classList.remove("on"); setTimeout(() => el.remove(), 600); }, 3200);
  };

  /* ============================================================
     CURTAIN PAGE TRANSITIONS
     ============================================================ */
  const curtain = $("#curtain");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navigate = (href) => {
    if (reduced || !curtain) { location.href = href; return; }
    if (curtain.dataset.busy) return;
    curtain.dataset.busy = "1";
    curtain.classList.add("cover");
    setTimeout(() => { location.href = href; }, 500);
  };

  if (curtain && !reduced) {
    requestAnimationFrame(() => requestAnimationFrame(() => curtain.classList.add("reveal")));
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!/\.html(\?.*)?(#.*)?$/.test(url.pathname)) return;   // only internal pages
      if (url.pathname === location.pathname) return;            // in-page (account hash routes)
      e.preventDefault();
      navigate(url.href);
    });
  } else if (curtain) { curtain.style.display = "none"; }

  /* ============================================================
     CHROME — scroll state + progress bar
     ============================================================ */
  const chrome = $(".chrome");
  const progress = $(".progress i");
  const onScroll = () => {
    const y = window.scrollY;
    if (chrome) {
      chrome.classList.toggle("solid", y > 24);
      chrome.classList.toggle("hidemicro", y > 90);
    }
    if (progress) {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     REVEALS — IntersectionObserver (re-runnable)
     ============================================================ */
  let io = null;
  const observe = (root) => {
    const els = $$(".rv:not(.in)", root || document);
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    }
    els.forEach((el) => io.observe(el));
    /* counters */
    $$("[data-count]:not(.done)", root || document).forEach((el) => {
      cIO.observe(el);
    });
  };
  const cIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      cIO.unobserve(en.target);
      const el = en.target; el.classList.add("done");
      const to = parseFloat(el.dataset.count) || 0;
      if (reduced) { el.textContent = to.toLocaleString("en-US"); return; }
      const t0 = performance.now(), dur = 1400;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });

  /* ============================================================
     SPLIT TEXT — word / char rise reveal
     ============================================================ */
  const splitAll = (root) => {
    $$("[data-split]", root || document).forEach((host) => {
      const targets = host.querySelectorAll(".tr, .ln>span").length ? Array.from(host.querySelectorAll(".tr, .ln>span")) : [host];
      let i = 0;
      targets.forEach((el) => {
        const text = el.textContent;
        if (!text || el.dataset.splitDone) return;
        el.dataset.splitDone = "1";
        const cjk = /[\u3400-\u9FFF\u3040-\u30FF]/.test(text);
        const units = cjk ? text.split("") : text.split(/(\s+)/);
        el.textContent = "";
        units.forEach((u) => {
          if (!u) return;
          if (/^\s+$/.test(u)) { el.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("i");
          inner.textContent = u;
          inner.style.setProperty("--i", String(i++));
          w.appendChild(inner);
          el.appendChild(w);
        });
      });
      host.classList.remove("go");
    });
    /* trigger */
    $$("[data-split]", root || document).forEach((host) => {
      requestAnimationFrame(() => {
        void host.offsetWidth;
        host.classList.add("go");
      });
    });
  };

  /* ============================================================
     MAGNETIC BUTTONS
     ============================================================ */
  if (!reduced && matchMedia("(hover:hover)").matches) {
    document.addEventListener("mousemove", (e) => {
      const m = e.target.closest(".magnet");
      if (!m) return;
      const r = m.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      m.style.transform = "translate(" + x * 6 + "px," + y * 5 + "px)";
    });
    document.addEventListener("mouseout", (e) => {
      const m = e.target.closest(".magnet");
      if (m) m.style.transform = "";
    });
  }

  /* ============================================================
     BAG — drawer + persistence + fly animation
     ============================================================ */
  const veil = $(".veil");
  const bagEl = $(".bag");
  const bagCount = $(".bag-count");

  const bagQty = () => state.bag.reduce((n, l) => n + l.qty, 0);

  const lineHTML = (l) => {
    const p = D.byId(l.pid); if (!p) return "";
    const col = p.colors[l.ci] || p.colors[0];
    return '<div class="line" data-pid="' + l.pid + '" data-ci="' + l.ci + '" data-qty="' + l.qty + '">' +
      '<a class="thumb" href="product.html?id=' + l.pid + '"><img src="' + img(p.img) + '" alt=""></a>' +
      "<div><div class=\"top\"><div><div class=\"nm\">" + pick(p.name) + "</div>" +
      '<div class="vr">' + pick(col.l) + "</div></div>" +
      '<button class="rm" aria-label="Remove">' + t("bag.remove") + "</button></div>" +
      '<div class="op"><span class="mini-qty"><button class="mq" data-d="-1">−</button><span class="n">' + l.qty + '</span><button class="mq" data-d="1">+</button></span>' +
      '<span class="sub">' + money(p.price * l.qty) + "</span></div></div></div>";
  };

  const renderBag = () => {
    const list = $("#bag-list"); if (!list) return;
    list.innerHTML = state.bag.map(lineHTML).join("");
    const s = state.bag.reduce((n, l) => n + D.byId(l.pid).price * l.qty, 0);
    const count = bagQty();
    if (bagCount) bagCount.textContent = count;
    const foot = $(".bag-total b"); if (foot) foot.textContent = money(s);
    const txt = $(".ship-bar .txt"), fill = $(".ship-fill");
    const TH = 200;
    if (txt && fill) {
      if (s >= TH) { txt.innerHTML = t("bag.shipFree"); fill.style.width = "100%"; }
      else { txt.innerHTML = t("bag.shipLeft").replace("%s", money(TH - s)); fill.style.width = Math.min(100, (s / TH) * 100) + "%"; }
    }
    if (count === 0) {
      list.style.display = "none";
      if (!$("#bag-empty")) {
        const e = document.createElement("div"); e.id = "bag-empty"; e.className = "empty";
        e.innerHTML = '<div class="glyph">∅</div><p>' + t("bag.emptyTitle") + "</p>" +
          '<p style="margin-top:6px;font-size:13px">' + t("bag.emptySub") + "</p>";
        $(".bag-items").appendChild(e);
      }
    } else {
      list.style.display = "";
      const e = $("#bag-empty"); if (e) e.remove();
    }
    emit();
  };

  const openBag = () => { if (veil) veil.classList.add("on"); if (bagEl) bagEl.classList.add("open"); document.body.classList.add("no-scroll"); };
  const closeBag = () => { if (veil) veil.classList.remove("on"); if (bagEl) bagEl.classList.remove("open"); if (!menuOpen()) document.body.classList.remove("no-scroll"); };

  const bumpCount = () => { if (bagCount) { bagCount.classList.remove("bump"); void bagCount.offsetWidth; bagCount.classList.add("bump"); } };

  const flyToBag = (fromEl, imgURL) => {
    const target = $("[data-open-bag]");
    if (!fromEl || !target || reduced) { bumpCount(); return; }
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.left = a.left + a.width / 2 + "px";
    dot.style.top = a.top + a.height / 2 + "px";
    dot.innerHTML = '<img src="' + (imgURL || "") + '" alt="">';
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
      { transform: "translate(calc(-50% + " + dx * 0.5 + "px), calc(-50% + " + (dy * 0.5 - 70) + "px)) scale(.9)", opacity: 1, offset: 0.55 },
      { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(.15)", opacity: .3 }
    ], { duration: 750, easing: "cubic-bezier(.3,.1,.3,1)" }).onfinish = () => { dot.remove(); bumpCount(); };
  };

  const addToBag = (pid, ci, qty, fromEl) => {
    const p = D.byId(pid); if (!p) return;
    ci = ci || 0; qty = qty || 1;
    const ex = state.bag.find((l) => l.pid === pid && l.ci === ci);
    if (ex) ex.qty += qty; else state.bag.push({ pid, ci, qty });
    persist("bag"); renderBag();
    flyToBag(fromEl, img(p.img));
    toast(t("t.added"), pick(p.name));
  };

  const setLineQty = (line, d) => {
    const pid = line.dataset.pid, ci = +line.dataset.ci;
    const l = state.bag.find((x) => x.pid === pid && x.ci === ci);
    if (!l) return;
    l.qty = Math.max(1, l.qty + d);
    persist("bag"); renderBag();
  };
  const removeLineOf = (line) => {
    const pid = line.dataset.pid, ci = +line.dataset.ci;
    state.bag = state.bag.filter((x) => !(x.pid === pid && x.ci === ci));
    persist("bag"); renderBag();
  };

  if (bagEl) bagEl.addEventListener("click", (e) => {
    const tgt = e.target;
    if (tgt.classList.contains("mq")) setLineQty(tgt.closest(".line"), +tgt.dataset.d);
    else if (tgt.classList.contains("rm")) removeLineOf(tgt.closest(".line"));
  });

  /* ============================================================
     WISHLIST / FOLLOWS
     ============================================================ */
  const inWl = (pid) => state.wl.includes(pid);
  const toggleWl = (pid, btn) => {
    const p = D.byId(pid); if (!p) return;
    if (inWl(pid)) { state.wl = state.wl.filter((x) => x !== pid); toast(t("t.wlRemoved"), pick(p.name)); }
    else { state.wl.push(pid); toast(t("t.wlAdded"), pick(p.name)); }
    persist("wl"); emit();
    $$('[data-wl="' + pid + '"]').forEach((b) => b.classList.toggle("on", inWl(pid)));
  };
  const followsMk = (id) => state.follows.includes(id);
  const toggleFollow = (id) => {
    const m = D.makerById(id); if (!m) return;
    if (followsMk(id)) { state.follows = state.follows.filter((x) => x !== id); toast(t("t.unfollowed"), m.name); }
    else { state.follows.push(id); toast(t("t.followed"), m.name); }
    persist("follows"); emit();
    $$('[data-follow="' + id + '"]').forEach((b) => {
      b.classList.toggle("on", followsMk(id));
      const lab = $(".fl-lab", b); if (lab) lab.textContent = followsMk(id) ? t("ui.following") : t("ui.follow");
    });
  };

  /* ============================================================
     ORDERS — creation from checkout
     ============================================================ */
  const createOrder = (items, addrId, ship, pay) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const iso = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes());
    const no = "QL-" + String(88000 + Math.floor(Math.random() * 999));
    const o = {
      no, iso, items, addr: addrId, ship, pay, current: 1,
      events: [
        { k: "placed", iso, loc: { en: "Online", zh: "线上下单", ja: "オンライン" } },
        { k: "paid", iso, loc: { en: "Payment centre", zh: "支付中心", ja: "決済センター" } }
      ]
    };
    state.orders.unshift(o);
    persist("orders"); emit();
    return o;
  };

  /* ============================================================
     SEARCH / MENU OVERLAYS
     ============================================================ */
  const sov = $("#search-ov");
  const menu = $("#menu");
  const menuOpen = () => menu && menu.classList.contains("open");

  const openSearch = () => { if (sov) { sov.classList.add("open"); document.body.classList.add("no-scroll"); setTimeout(() => { const i = $("#sov-input"); if (i) i.focus(); }, 250); } };
  const closeSearch = () => { if (sov) { sov.classList.remove("open"); document.body.classList.remove("no-scroll"); } };
  const openMenu = () => { if (menu) { menu.classList.add("open"); document.body.classList.add("no-scroll"); } };
  const closeMenu = () => { if (menu) { menu.classList.remove("open"); if (!(bagEl && bagEl.classList.contains("open"))) document.body.classList.remove("no-scroll"); } };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeSearch(); closeMenu(); closeBag(); }
  });

  /* search forms → curtain navigate */
  const wireSearchForm = (form) => {
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = ($("input[name=q]", form) || {}).value || "";
      navigate("shop.html" + (q ? "?q=" + encodeURIComponent(q) : ""));
    });
  };

  /* ============================================================
     LANGUAGE FLOAT
     ============================================================ */
  const lf = $("#lang-float");
  const lfCur = $(".lf-cur");
  const LF_LABEL = { en: "EN", "zh-CN": "中", "zh": "中", ja: "日" };
  const syncLf = () => { if (lfCur && window.I18N) lfCur.textContent = LF_LABEL[I18N.get()] || "EN"; };
  if (lf) {
    $(".lf-btn", lf).addEventListener("click", () => lf.classList.toggle("open"));
    document.addEventListener("click", (e) => { if (!e.target.closest("#lang-float")) lf.classList.remove("open"); });
    $$("[data-set]", lf).forEach((b) => b.addEventListener("click", () => {
      if (window.I18N) I18N.set(b.dataset.set);
      lf.classList.remove("open");
    }));
  }

  /* ============================================================
     GLOBAL DELEGATED CLICKS
     ============================================================ */
  document.addEventListener("click", (e) => {
    const el = e.target;

    if (el.closest("[data-open-search]")) { openSearch(); return; }
    if (el.closest("[data-close-search]") || (sov && el === sov)) { closeSearch(); return; }
    if (el.closest("[data-open-bag]")) { openBag(); return; }
    if (el.closest("[data-close-bag]")) { closeBag(); return; }
    if (el.closest(".burger")) { openMenu(); return; }
    if (el.closest(".menu-close")) { closeMenu(); return; }
    if (menu && el.closest("#menu a")) { closeMenu(); return; }
    if (veil && el === veil) { closeBag(); return; }

    /* quick add from cards */
    const quick = el.closest(".quick");
    if (quick) {
      const card = quick.closest("[data-pid]");
      if (card) addToBag(card.dataset.pid, 0, 1, quick);
      return;
    }

    /* PDP add to bag */
    if (el.closest("#add-bag")) {
      const root = el.closest("[data-pid]");
      const chip = $(".chip.swatch.on");
      const qtyN = $(".qty .n");
      addToBag(root.dataset.pid, chip ? +chip.dataset.i : 0, qtyN ? +qtyN.textContent : 1, el.closest("#add-bag"));
      return;
    }

    /* wishlist */
    const wlBtn = el.closest("[data-wl]");
    if (wlBtn) { toggleWl(wlBtn.dataset.wl, wlBtn); return; }

    /* follow */
    const foBtn = el.closest("[data-follow]");
    if (foBtn) { toggleFollow(foBtn.dataset.follow); return; }

    /* variant chips */
    const chip = el.closest(".chip[data-val]");
    if (chip) {
      const box = chip.closest(".opt");
      $$(".chip[data-val]", box).forEach((x) => x.classList.remove("on"));
      chip.classList.add("on");
      const out = $(".opt-head .val", box);
      if (out) out.textContent = chip.dataset.val;
      const pdp = chip.closest(".pdp");
      if (pdp) pdp.dataset.ci = chip.dataset.i;
      return;
    }

    /* qty steppers (generic) */
    const qb = el.closest(".qty button");
    if (qb) {
      const box = qb.closest(".qty");
      const n = $(".n", box);
      n.textContent = Math.max(1, parseInt(n.textContent, 10) + parseInt(qb.dataset.d, 10));
      return;
    }

    /* gallery thumbs */
    const th = el.closest(".thumbs button");
    if (th) {
      const group = th.closest(".thumbs");
      const stage = $(".stage img", th.closest(".pdp-media") || document);
      $$("button", group).forEach((x) => x.classList.remove("on"));
      th.classList.add("on");
      if (stage && th.dataset.src) {
        stage.src = th.dataset.src;
        stage.style.animation = "none"; void stage.offsetWidth; stage.style.animation = "";
      }
      return;
    }

    /* dead links → toast */
    if (el.closest('a[href="#"]')) { e.preventDefault(); toast(t("t.link"), t("t.linkSub")); }
  });

  /* ============================================================
     IMAGE SEEDING for static [data-img]
     ============================================================ */
  const seedImages = () => {
    $$("img[data-img]").forEach((im) => {
      im.src = scene(im.dataset.img, im.dataset.extra || "") + (im.dataset.size || "square_hd");
      im.alt = im.dataset.alt || "";
    });
    $$("[data-imgbg]").forEach((elm) => {
      elm.style.backgroundImage = "url('" + scene(elm.dataset.imgbg, elm.dataset.extra || "") + (elm.dataset.size || "portrait_4_3") + "')";
    });
  };

  /* ============================================================
     I18N CHANGE — refresh everything
     ============================================================ */
  if (window.I18N) I18N.onChange(() => {
    syncLf();
    renderBag();
    if (window.quellPages) quellPages.render();
    splitAll();
    observe();
    if (window.I18N && I18N.augment) I18N.augment();
  });

  document.addEventListener("quell:state", () => {
    /* pages that live off state re-render themselves via this event */
    if (window.quellPages && quellPages.onState) quellPages.onState();
  });

  /* ============================================================
     BOOT (on DOMContentLoaded — after pages have rendered)
     ============================================================ */
  const boot = () => {
    $$('input[name="q"]').forEach((i) => i.setAttribute("data-i18n-ph", "search.ph"));
    wireSearchForm($("#sov-form form, form.sov-form"));
    wireSearchForm($("form.sline"));
    renderBag();
    syncLf();
    seedImages();
    splitAll();
    observe();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* ============================================================
     EXPOSE
     ============================================================ */
  window.quell = {
    state, LS, persist, money, toast, img, scene, pick,
    addToBag, renderBag, openBag, closeBag, inWl, toggleWl, followsMk, toggleFollow, createOrder,
    observe, splitAll, navigate, t,
    $, $$
  };
})();
