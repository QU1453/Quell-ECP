/* ============================================================
   QUELL — shared interactions (design preview)
   Image gen endpoint, reveal choreography, bag, menu, toasts
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

  /* ---------- image seeding from data-img prompts ---------- */
  const seedImages = () => {
    $$("img[data-img]").forEach((img) => {
      const size = img.dataset.size || "square_hd";
      const src = scene(img.dataset.img, img.dataset.extra || "");
      img.src = src + size;
      img.alt = img.dataset.alt || img.dataset.img;
    });
    $$("[data-imgbg]").forEach((el) => {
      const size = el.dataset.size || "portrait_4_3";
      el.style.backgroundImage = "url('" + scene(el.dataset.imgbg, el.dataset.extra || "") + size + "')";
    });
  };

  /* ---------- chrome / header state ---------- */
  const chrome = $(".chrome");
  const nav = $(".nav");
  const onScroll = () => {
    if (!chrome) return;
    const y = window.scrollY;
    chrome.classList.toggle("solid", y > 24);
    chrome.classList.toggle("hidemicro", y > 90);
    if (y > 24 && nav) nav.classList.add("nav-away");
    else if (nav) nav.classList.remove("nav-away");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$(".rv");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add("in"));

  /* ---------- toasts ---------- */
  const toastWrap = (() => {
    let w = $(".toast-wrap");
    if (!w) {
      w = document.createElement("div");
      w.className = "toast-wrap";
      document.body.appendChild(w);
    }
    return w;
  })();
  const toast = (title, sub) => {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML =
      '<span class="tick"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6.5 4.8 9 10 3.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span>' + title + (sub ? '<span class="sub">' + sub + "</span>" : "") + "</span>";
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("on"));
    setTimeout(() => {
      t.classList.remove("on");
      setTimeout(() => t.remove(), 600);
    }, 3200);
  };

  /* ---------- veil + bag drawer ---------- */
  const veil = $(".veil");
  const bag = $(".bag");
  const bagCount = $(".bag-count");
  const countLines = () => {
    if (!bag) return;
    let total = 0;
    $$(".line").forEach((l) => {
      total += parseInt(l.dataset.qty || "1", 10);
    });
    if (bagCount) bagCount.textContent = total;
    if (total === 0 && $("#bag-empty") === null) {
      // nothing special: keep placeholder if any line is gone
    }
  };
  const bagTotal = () => {
    const foot = $(".bag-total b");
    if (!foot || !bag) return;
    let s = 0;
    $$(".line", bag).forEach((l) => {
      s += parseInt(l.dataset.price, 10) * parseInt(l.dataset.qty, 10);
    });
    foot.textContent = fmt(s);
    const txt = $(".ship-bar .txt");
    const fill = $(".ship-fill");
    if (txt && fill) {
      const TH = 200;
      if (s >= TH) {
        txt.innerHTML = "Complimentary shipping unlocked <b>— duty &amp; tax included</b>";
        fill.style.width = "100%";
      } else {
        txt.innerHTML = "You're <b>" + fmt(TH - s) + "</b> away from complimentary shipping";
        fill.style.width = Math.min(100, (s / TH) * 100) + "%";
      }
    }
    if (s === 0) {
      const holder = $(".bag-items");
      if (holder && !$("#bag-empty", holder)) {
        const e = document.createElement("div");
        e.id = "bag-empty";
        e.className = "empty";
        e.innerHTML =
          '<div class="glyph">∅</div><p>Your bag is empty.</p>' +
          '<p style="margin-top:6px;font-size:13px">Browse the current edit and add something worth keeping.</p>';
        holder.appendChild(e);
      }
      const itemsBox = $("#bag-list");
      if (itemsBox) itemsBox.style.display = "none";
    }
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
  const openVeil = (el) => el && el.classList.add("on");
  const closeVeil = (el) => el && el.classList.remove("on");

  /* re-render a line's subtotal */
  const lineSub = (line) => {
    const q = parseInt(line.dataset.qty, 10);
    const sub = $(".sub", line);
    if (sub) sub.textContent = fmt(parseInt(line.dataset.price, 10) * q);
  };

  const addLine = (item) => {
    const list = $("#bag-list");
    if (!list) return;
    // dedupe by name+variant
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
      d.innerHTML =
        '<div class="thumb"><img alt="' + (item.alt || "") + '" src="' + item.img + '"></div>' +
        '<div><div class="top"><div><div class="nm">' + item.name + "</div>" +
        '<div class="vr">' + (item.variant || "Standard") + "</div></div>" +
        '<button class="rm" aria-label="Remove">Remove</button></div>' +
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
    setTimeout(() => {
      line.remove();
      countLines();
      bagTotal();
    }, 400);
  };

  /* delegation inside bag */
  const onBagClick = (e) => {
    const t = e.target;
    if (t.classList.contains("mq")) {
      const line = t.closest(".line");
      const d = parseInt(t.dataset.d, 10);
      const q = Math.max(1, parseInt(line.dataset.qty, 10) + d);
      line.dataset.qty = String(q);
      const n = $(".mini-qty .n", line);
      if (n) n.textContent = q;
      lineSub(line);
      countLines();
      bagTotal();
    } else if (t.classList.contains("rm")) {
      removeLine(t.closest(".line"));
    }
  };

  const bumpCount = () => {
    if (bagCount) {
      bagCount.classList.remove("bump");
      void bagCount.offsetWidth;
      bagCount.classList.add("bump");
    }
  };

  /* quick-add buttons with embedded product data */
  const quickAdd = (btn) => {
    const card = btn.closest("[data-name]");
    const addEvent = new CustomEvent("quell:add", { detail: card.dataset });
    document.dispatchEvent(addEvent);
  };

  document.addEventListener("quell:add", (e) => {
    const d = e.detail;
    const img = scene(d.img) + "square_hd";
    addLine({ name: d.name, price: +d.price, img, variant: d.variant, alt: d.alt || d.name, qty: +d.qty || 1 });
    bumpCount();
    toast("Added to bag", d.name);
  });

  /* ---------- menu overlay ---------- */
  const menu = $("#menu");
  const menuOverlayOpen = () => menu && menu.classList.contains("open");
  const openMenu = () => {
    if (menu) menu.classList.add("open");
    document.body.classList.add("no-scroll");
  };
  const closeMenu = () => {
    if (menu) menu.classList.remove("open");
    if (!(bag && bag.classList.contains("open"))) document.body.classList.remove("no-scroll");
  };

  /* ---------- bindings ---------- */
  const bind = () => {
    const openBagBtns = $$("[data-open-bag]");
    openBagBtns.forEach((b) => b.addEventListener("click", openBag));
    const closeBagBtns = $$("[data-close-bag]");
    closeBagBtns.forEach((b) => b.addEventListener("click", closeBag));
    if (bag) bag.addEventListener("click", onBagClick);
    if (veil) veil.addEventListener("click", () => { closeBag(); closeMenu(); });

    $$(".quick").forEach((b) => b.addEventListener("click", () => quickAdd(b)));

    const burger = $(".burger");
    if (burger) burger.addEventListener("click", openMenu);
    const menuClose = $(".menu-close");
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    $$(".menu-overlay a").forEach((a) => a.addEventListener("click", closeMenu));

    /* pdp specific */
    const thumbs = $$(".thumbs button");
    const stage = $(".stage img");
    thumbs.forEach((th) =>
      th.addEventListener("click", () => {
        thumbs.forEach((x) => x.classList.remove("on"));
        th.classList.add("on");
        if (stage && th.dataset.src) {
          stage.src = th.dataset.src;
          stage.style.animation = "none";
          void stage.offsetWidth;
          stage.style.animation = "";
        }
      })
    );
    const chips = $$(".chip[data-val]");
    const valOut = $(".opt-head .val");
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        chips.forEach((x) => x.classList.remove("on"));
        c.classList.add("on");
        if (valOut) valOut.textContent = c.dataset.val;
      })
    );
    const qtyBtns = $$(".qty button");
    const qtyN = $(".qty .n");
    if (qtyBtns.length && qtyN) {
      qtyBtns.forEach((b) =>
        b.addEventListener("click", () => {
          let q = parseInt(qtyN.textContent, 10) + parseInt(b.dataset.d, 10);
          q = Math.max(1, q);
          qtyN.textContent = q;
        })
      );
    }
    const addBag = $("#add-bag");
    if (addBag) {
      addBag.addEventListener("click", () => {
        const prod = addBag.closest("[data-name]");
        const chip = $(".chip.swatch.on, .chip[data-val].on") || $(".chips .chip");
        const variant = chip ? (chip.dataset.val || chip.dataset.color || "Sand") : "Standard";
        const detail = Object.assign({}, prod ? prod.dataset : {}, { qty: qtyN ? parseInt(qtyN.textContent, 10) : 1, variant });
        document.dispatchEvent(new CustomEvent("quell:add", { detail }));
      });
    }

    /* newsletter + demo search */
    const newsForm = $("#news-form");
    if (newsForm) {
      newsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        newsForm.reset();
        toast("Subscribed", "Letters land when the edit turns over");
      });
    }
    const searchBtn = $(".tool.search-t");
    const searchBox = $("#searchbox");
    if (searchBtn && searchBox) {
      searchBtn.addEventListener("click", () => {
        searchBox.classList.toggle("on");
        if (searchBox.classList.contains("on")) $("input", searchBox).focus();
      });
    }
    const searchInput = $("#search-input");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          toast("Search preview", "Full search ships with the M1 build");
          searchInput.value = "";
        }
      });
    }
    $$(".tool.acct-t, .tool.wish-t").forEach((b) =>
      b.addEventListener("click", () => toast("Accounts arrive with the API", "Phase M1 — authenticated demo"))
    );
    $$("a[href='#']").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        toast("Design preview", "Linked in the full build");
      })
    );
    $$(".btn.checkout-demo").forEach((b) =>
      b.addEventListener("click", () => toast("Checkout is a preview", "Simulated gateway lands in phase M2"))
    );
  };

  /* expose helpers globally for catalog-driven pages */
  window.quell = { openBag, closeBag, toast, fmt, img: (p, s) => scene(p) + (s || "square_hd") };

  seedImages();
  bind();
  countLines();
  bagTotal();
})();
