/* ============================================================
   QUELL — shared chrome injection (design preview)
   Injects: microbar marquee · nav · search overlay · mobile
   menu · bag drawer · language float · footer · curtain ·
   scroll progress. Load AFTER i18n.js & data.js.
   ============================================================ */
(() => {
  "use strict";

  const T = (en, zh, ja) =>
    '<span class="tr" data-l="en">' + en + '</span><span class="tr" data-l="zh">' + zh + '</span><span class="tr" data-l="ja">' + ja + "</span>";
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const D = window.QUELL_DATA;

  /* active nav link */
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab");
  const navActive = (id) => {
    if (id === "shop") return page === "shop" && !tab ? " active" : "";
    if (id === "new") return page === "shop" && tab === "new" ? " active" : "";
    if (id === "sale") return page === "shop" && tab === "sale" ? " active" : "";
    if (id === "journal") return page === "journal" ? " active" : "";
    return "";
  };

  const ic = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 8h12l1.5 12h-15L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    burger: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 2.8 15.4 0 18-2.8-2.6-2.8-15.4 0-18Z"/></svg>'
  };

  /* ---------------- header ---------------- */
  const micro = () => {
    const one = () =>
      "<span>" + T("Duty & tax included — simulated", "关税与税费已包含（模拟）", "関税・税込（シミュレーション）") + '</span><i class="dot"></i><span>' +
      T("Insured global shipping", "全球运输全程投保", "グローバル輸送は全工程保険") + '</span><i class="dot"></i><span>' +
      T("Thirty-day returns", "30 天无忧退货", "30日間の返品") + '</span><i class="dot"></i>';
    return '<div class="mq">' + one() + one() + "</div>";
  };

  const header =
    '<header class="chrome">' +
      '<div class="microbar">' + micro() + "</div>" +
      '<nav class="nav">' +
        '<a class="brand" href="index.html" data-nav="home">Quell<span class="dot">.</span></a>' +
        '<div class="nav-links">' +
          '<a href="shop.html" class="' + navActive("shop") + '">' + T("Shop", "商城", "ショップ") + "</a>" +
          '<a href="shop.html?tab=new" class="' + navActive("new") + '">' + T("New in", "新品", "新着") + "</a>" +
          '<a href="shop.html?tab=sale" class="' + navActive("sale") + '">' + T("Sale", "折扣", "セール") + "</a>" +
          '<a href="journal.html" class="' + navActive("journal") + '">' + T("Journal", "手记", "ジャーナル") + "</a>" +
        "</div>" +
        '<div class="nav-tools">' +
          '<button class="tool" data-open-search aria-label="Search">' + ic.search + "</button>" +
          '<a class="tool acct-t" href="account.html" aria-label="Account">' + ic.user + "</a>" +
          '<button class="tool" data-open-bag aria-label="Bag">' + ic.bag + '<span class="bag-count">0</span></button>' +
          '<button class="tool burger" aria-label="Menu">' + ic.burger + "</button>" +
        "</div>" +
      "</nav>" +
      (isHome
        ? '<div class="searchrow"><div class="wrap searchrow-in">' +
          '<form class="sline" role="search" action="shop.html" method="get">' +
          '<svg class="s-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>' +
          '<input id="search-input" type="search" name="q" placeholder="' + (window.I18N ? I18N.m("search.ph") : "Search the edit…") + '" aria-label="Search">' +
          "<kbd>↵</kbd></form></div></div>"
        : "") +
    "</header>";

  document.body.insertAdjacentHTML("afterbegin", header);

  /* ---------------- footer ---------------- */
  const footCol = (title, links) =>
    '<div class="f-col"><p class="smallcaps f-t">' + title + "</p>" + links.map((l) => "<a " + (l.ext ? "" : "") + 'href="' + l.href + '">' + l.label + "</a>").join("") + "</div>";

  const catLinks = D ? D.CATS.map((c) => ({ href: "shop.html?cat=" + c.id, label: T(D.pick(c.l), D.pick(c.l), D.pick(c.l)) })) : [];

  const footer =
    '<footer class="footer">' +
      '<div class="wrap foot-grid">' +
        '<div class="f-brand"><a class="brand" href="index.html">Quell<span class="dot">.</span></a>' +
          "<p>" + T("Considered goods, found far away. A simulated cross-border commerce platform.", "值得远渡重洋的器物。一个模拟跨境电商平台。", "遠くから見つけた、考え抜かれた品々。シミュレーション越境 EC プラットフォーム。") + "</p>" +
          '<div class="f-social"><a href="#" aria-label="Instagram">Ig</a><a href="#" aria-label="Pinterest">Pi</a><a href="#" aria-label="Newsletter">✉</a></div>' +
        "</div>" +
        footCol(T("Shop", "选购", "ショップ"), catLinks) +
        footCol(T("Company", "品牌", "会社"), [
          { href: "index.html#makers", label: T("Our makers", "我们的匠人", "私たちの工房") },
          { href: "journal.html", label: T("Journal", "手记", "ジャーナル") },
          { href: "index.html#values", label: T("The quiet contract", "安静的约定", "静かな契約") },
          { href: "#", label: T("Careers", "加入我们", "採用") }
        ]) +
        footCol(T("Support", "支持", "サポート"), [
          { href: "account.html#/support", label: T("Shipping & duty", "运费与关税", "配送と関税") },
          { href: "account.html#/support", label: T("Returns", "退货政策", "返品について") },
          { href: "account.html#/support", label: T("Contact & FAQ", "联系与常见问题", "お問い合わせ・FAQ") },
          { href: "account.html#/orders", label: T("Track an order", "查询订单", "注文を追跡") }
        ]) +
        footCol(T("Account", "账户", "アカウント"), [
          { href: "account.html", label: T("My account", "我的账户", "マイアカウント") },
          { href: "account.html#/wishlist", label: T("Wishlist", "收藏夹", "お気に入り") },
          { href: "account.html#/following", label: T("Following", "关注店铺", "フォロー中") },
          { href: "account.html#/settings", label: T("Settings", "设置", "設定") }
        ]) +
      "</div>" +
      '<div class="foot-base"><div class="wrap fb-in">' +
        "<span>" + T("© 2026 Quell-ECP — design preview", "© 2026 Quell-ECP — 设计预览", "© 2026 Quell-ECP — デザインプレビュー") + "</span>" +
        "<span>" + T("No real orders are processed · simulated environment", "本预览不处理真实订单 · 模拟环境", "実際の注文は処理されません・シミュレーション環境") + "</span>" +
      "</div></div>" +
    "</footer>";

  /* ---------------- overlays ---------------- */
  const overlays =
    /* search overlay */
    '<div class="search-ov" id="search-ov" aria-hidden="true">' +
      '<button class="sov-x" data-close-search aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5 5 19"/></svg></button>' +
      '<div class="sov-in">' +
        '<form class="sov-form" action="shop.html" method="get">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>' +
          '<input id="sov-input" type="search" name="q" autocomplete="off" placeholder="' + (window.I18N ? I18N.m("search.ph") : "Search the edit…") + '">' +
          "<kbd>↵</kbd></form>" +
        '<p class="smallcaps sov-k">' + T("Popular right now", "正在流行", "いま人気") + "</p>" +
        '<div class="sov-chips">' +
          ["lamp", "throw", "teapot", "mirror"].map((id) => {
            const p = D && D.byId(id);
            return p ? '<a class="chip" href="shop.html?q=' + encodeURIComponent(id) + '">' + T(D.pick(p.name), D.pick(p.name), D.pick(p.name)) + "</a>" : "";
          }).join("") +
        "</div>" +
        '<div class="sov-cats">' +
          (D ? D.CATS.slice(0, 8).map((c) => '<a href="shop.html?cat=' + c.id + '">' + T(D.pick(c.l), D.pick(c.l), D.pick(c.l)) + "</a>").join("") : "") +
        "</div>" +
      "</div>" +
    "</div>" +

    /* mobile menu */
    '<div class="menu-ov" id="menu" aria-hidden="true">' +
      '<button class="menu-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5 5 19"/></svg></button>' +
      '<nav class="menu-links">' +
        '<a href="index.html" data-d="0">' + T("Home", "首页", "ホーム") + "</a>" +
        '<a href="shop.html" data-d="1">' + T("Shop", "商城", "ショップ") + "</a>" +
        '<a href="shop.html?tab=new" data-d="2">' + T("New in", "新品", "新着") + "</a>" +
        '<a href="shop.html?tab=sale" data-d="3">' + T("Sale", "折扣", "セール") + "</a>" +
        '<a href="journal.html" data-d="4">' + T("Journal", "手记", "ジャーナル") + "</a>" +
        '<a href="account.html" data-d="5">' + T("My account", "我的", "マイページ") + "</a>" +
        '<a href="cart.html" data-d="6">' + T("Bag", "购物车", "カート") + "</a>" +
      "</nav>" +
      '<div class="menu-foot">' + T("Quell — considered goods, found far away.", "Quell — 值得远渡重洋的器物。", "Quell — 遠くから見つけた、考え抜かれた品々。") + "</div>" +
    "</div>" +

    /* bag drawer */
    '<div class="veil"></div>' +
    '<aside class="bag" aria-label="Bag">' +
      '<div class="bag-head"><span class="smallcaps">' + T("Your bag", "购物袋", "ショッピングバッグ") + '</span><button class="bag-x" data-close-bag aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5 5 19"/></svg></button></div>' +
      '<div class="ship-bar"><i class="ship-fill"></i><p class="txt smallcaps"></p></div>' +
      '<div class="bag-items"><div id="bag-list"></div></div>' +
      '<div class="bag-foot">' +
        '<div class="bag-total"><span class="smallcaps">' + T("Subtotal", "小计", "小計") + "</span><b>$0</b></div>" +
        '<a class="btn btn-dark btn-big" href="checkout.html">' + T("Checkout", "去结算", "お支払いへ") + "</a>" +
        '<a class="bag-viewall" href="cart.html">' + T("View full bag →", "查看完整购物车 →", "カートをすべて見る →") + "</a>" +
      "</div>" +
    "</aside>" +

    /* language float */
    '<div class="lang-float" id="lang-float">' +
      '<button class="lf-btn" aria-label="Language">' + ic.globe + '<span class="lf-cur">EN</span></button>' +
      '<div class="lf-pop">' +
        '<button data-set="en">English</button><button data-set="zh">中文</button><button data-set="ja">日本語</button>' +
      "</div>" +
    "</div>" +

    /* page transition curtain + scroll progress */
    '<div class="curtain" id="curtain"><span class="cw">Quell<span class="dot">.</span></span></div>' +
    '<div class="progress"><i></i></div>';

  document.body.insertAdjacentHTML("beforeend", footer + overlays);
})();
