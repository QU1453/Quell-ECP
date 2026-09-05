/* ============================================================
   QUELL — lightweight tri-lingual i18n (EN / 中文 / 日本語)
   Load FIRST, before shop.js & app.js.
   Usage:
     <span data-i18n="key">         → textContent
     <input data-i18n-ph="key">     → placeholder
     <span data-i18n-html="key">    → innerHTML (author-rich)
   Catalog pages re-render via I18N.onChange(fn).
   ============================================================ */
(() => {
  "use strict";

  const S = {
    en: {
      "micro.duty": "Duty & tax included — simulated",
      "micro.insure": "Insured global shipping",
      "micro.return": "Thirty-day returns",
      "nav.shop": "Shop",
      "nav.new": "New in",
      "nav.objects": "Objects",
      "nav.journal": "Journal",
      "search.ph": "Search the edit…",
      "bread.home": "Home",
      "bread.objects": "Objects",

      "hero.kicker": "The Objects Edit — N°07",
      "hero.copy": "A considered edit of ceramics, textiles and tools — gathered from twelve countries, priced with duty and tax included.",
      "hero.explore": "Explore the edit",
      "meta.countries": "Countries sourced",
      "meta.dispatch": "Dispatch",
      "meta.returns": "Returns",
      "hero.caption": "Sand vessel — maker N°02",
      "cue.scroll": "Scroll",

      "sec.editK": "Current edit",
      "sec.newK": "New in",
      "sec.aboutK": "The long view",
      "sec.valuesK": "The quiet contract",
      "sec.newsK": "The Journal",

      "band.kicker": "Why we ship slowly",
      "band.note1": "Every piece is chosen in person, priced in one currency, and delivered with duty and tax already settled. What you see is what arrives — no surprises at the door.",
      "band.note2": "Fewer things, better made, priced once.",
      "ui.meetMakers": "Meet the makers",

      "ui.viewAll": "View everything",
      "ui.startHere": "Start here",
      "ui.backEdit": "Back to the edit",
      "about.para": "We don’t chase seasons — we follow workshops that have been chasing perfection for generations. Fewer things, better made, priced once.",
      "about.link": "About our makers",

      "v1t": "Duty & tax, included",
      "v1p": "The price you see is the price that lands. Duties settled at the source — a simulated ledger for now.",
      "v2t": "Insured, at every step",
      "v2p": "Every parcel travels insured from bench to doorstep, with a path you can follow all the way.",
      "v3t": "Returns without fuss",
      "v3p": "Thirty days, no questions, prepaid label. If it doesn’t earn its place, send it home.",

      "news.note": "One letter a month — makers’ notes, new pieces, and the occasional essay on why slow is the shortcut.",
      "news.ph": "Your email address",
      "ui.subscribe": "Subscribe",
      "news.fine": "No noise. Unsubscribe anytime.",

      "footer.desc": "Considered goods, found far away. A simulated cross-border commerce platform — the Quell-ECP design preview.",
      "col.shop": "Shop",
      "col.company": "Company",
      "col.support": "Support",
      "f.lighting": "Lighting",
      "f.table": "Table",
      "f.living": "Living",
      "f.objects": "Objects",
      "f.makers": "Our makers",
      "f.journal": "Journal",
      "f.contract": "The contract",
      "f.careers": "Careers",
      "f.ship": "Shipping & duty",
      "f.returns": "Returns",
      "f.contact": "Contact",
      "f.account": "Account",
      "base.copy": "© 2026 Quell-ECP — design preview",
      "base.fine": "No real orders are processed in this preview; checkout and payments are simulated for phase M2 of the build.",
      "menu.foot": "Quell — considered goods, found far away.<br>Duty &amp; tax included · simulated environment.",

      "bag.title": "Your bag",
      "bag.shipLeft": "You're <b>%s</b> away from complimentary shipping",
      "bag.shipFree": "Complimentary shipping unlocked <b>— duty &amp; tax included</b>",
      "bag.subtotal": "Subtotal",
      "bag.note": "Duty & tax included · insured shipping",
      "bag.checkout": "Checkout — demo",
      "bag.continue": "Continue browsing",
      "bag.remove": "Remove",
      "bag.emptyTitle": "Your bag is empty.",
      "bag.emptySub": "Browse the current edit and add something worth keeping.",

      "ui.quickadd": "Add",
      "ui.quantity": "Quantity",

      "pdp.tax": "duty & tax included",
      "pdp.finish": "Finish",
      "pdp.addBag": "Add to bag — %s",
      "pdp.zoom": "Drag to explore — full build",
      "pdp.inStock": "In stock, ships in 48h",
      "pdp.returns": "30-day returns",
      "pdp.insured": "Insured freight",
      "pdp.desc": "Description",
      "pdp.care": "Material & care",
      "pdp.ship": "Shipping & duty",
      "pdp.descMore": "Part of the Quell edit — considered once, kept for years.",
      "pdp.shipBody": "Duty and import tax are included in the price you see (simulated environment). Orders over $200 ship complimentary; every parcel travels insured. Returns within 30 days.",
      "rel.k": "Keep looking",
      "rel.title": "You might also consider",
      "ui.editLink": "View",

      "t.added": "Added to bag",
      "t.search": "Search preview",
      "t.searchSub": "Full search ships with the M1 build",
      "t.acct": "Accounts arrive with the API",
      "t.acctSub": "Phase M1 — authenticated demo",
      "t.link": "Design preview",
      "t.linkSub": "Linked in the full build",
      "t.checkout": "Checkout is a preview",
      "t.checkoutSub": "Simulated gateway lands in phase M2",
      "t.sub": "Subscribed",
      "t.subSub": "Letters land when the edit turns over",
      "t.lang": "Language set",
      "t.langSub": "Saved for your next visit"
    },

    zh: {
      "micro.duty": "关税与税费已包含（模拟）",
      "micro.insure": "全球运输全程投保",
      "micro.return": "30 天无忧退货",
      "nav.shop": "选购",
      "nav.new": "新品",
      "nav.objects": "器物",
      "nav.journal": "手记",
      "search.ph": "搜索精选…",
      "bread.home": "首页",
      "bread.objects": "器物",

      "hero.kicker": "器物精选 · 第 07 期",
      "hero.copy": "从十二个国家精挑细选的陶瓷、织物与日用器物——标价已含关税与税费。",
      "hero.explore": "浏览精选",
      "meta.countries": "合作国家",
      "meta.dispatch": "发货",
      "meta.returns": "退货",
      "hero.caption": "沙色陶器 — 匠人第 02 号",
      "cue.scroll": "下滑",

      "sec.editK": "在售精选",
      "sec.newK": "新品到店",
      "sec.aboutK": "更长远的眼光",
      "sec.valuesK": "安静的约定",
      "sec.newsK": "品牌手记",

      "band.kicker": "为何我们放慢脚步",
      "band.note1": "每一件器物都亲自挑选，以单一币种定价，并预先结清关税与税费——所见即所得，到门口不再有意外。",
      "band.note2": "更少的东西，更好的工艺，一次定价。",
      "ui.meetMakers": "认识匠人们",

      "ui.viewAll": "查看全部",
      "ui.startHere": "从这里开始",
      "ui.backEdit": "回到精选",
      "about.para": "我们不追逐季节，只追随那些世代打磨一门手艺的工作室。少而精，一次定价，长久相伴。",
      "about.link": "关于我们的匠人",

      "v1t": "关税与税费，已包含",
      "v1p": "你看到的价格，就是到手的价格。税费在源头结清——目前为模拟记账。",
      "v2t": "全程投保",
      "v2p": "每一件包裹从匠人案头到你家门口，全程投保，一路可查。",
      "v3t": "退货无需折腾",
      "v3p": "30 天无理由退货，预付回邮标签。若它不配留下，就送它回家。",

      "news.note": "每月一封——匠人手记、新品速递，以及偶尔聊聊「慢」为何是捷径。",
      "news.ph": "你的邮箱地址",
      "ui.subscribe": "订阅",
      "news.fine": "不打扰，随时可退订。",

      "footer.desc": "值得远渡重洋的器物。一个模拟跨境电商平台——Quell-ECP 的设计预览。",
      "col.shop": "选购",
      "col.company": "品牌",
      "col.support": "支持",
      "f.lighting": "灯具",
      "f.table": "餐桌",
      "f.living": "起居",
      "f.objects": "器物",
      "f.makers": "我们的匠人",
      "f.journal": "手记",
      "f.contract": "品牌约定",
      "f.careers": "加入我们",
      "f.ship": "运费与关税",
      "f.returns": "退货政策",
      "f.contact": "联系我们",
      "f.account": "账户",
      "base.copy": "© 2026 Quell-ECP — 设计预览",
      "base.fine": "本预览不处理真实订单；结账与支付为模拟功能，将在 M2 阶段实现。",
      "menu.foot": "Quell — 值得远渡重洋的器物。<br>关税与税费已包含 · 模拟环境。",

      "bag.title": "购物袋",
      "bag.shipLeft": "还差 <b>%s</b> 即可享免邮",
      "bag.shipFree": "已解锁免邮 <b>——关税与税费已包含</b>",
      "bag.subtotal": "小计",
      "bag.note": "关税与税费已包含 · 全程投保",
      "bag.checkout": "结算 — 演示",
      "bag.continue": "继续逛逛",
      "bag.remove": "移除",
      "bag.emptyTitle": "购物袋还是空的。",
      "bag.emptySub": "去看看本期精选，找一件值得留下的东西吧。",

      "ui.quickadd": "加入",
      "ui.quantity": "数量",

      "pdp.tax": "含关税与税费",
      "pdp.finish": "颜色",
      "pdp.addBag": "加入购物袋 — %s",
      "pdp.zoom": "完整版可拖拽查看",
      "pdp.inStock": "现货，48 小时内发货",
      "pdp.returns": "30 天退货",
      "pdp.insured": "全程投保",
      "pdp.desc": "产品描述",
      "pdp.care": "材质与保养",
      "pdp.ship": "运费与关税",
      "pdp.descMore": "选自 Quell 精选——慎重抉择一次，长久相伴多年。",
      "pdp.shipBody": "你看到的价格已包含关税与进口税（模拟环境）。订单满 $200 免运费，每件包裹全程投保，30 天内可退。",
      "rel.k": "继续发现",
      "rel.title": "也许你也会喜欢",
      "ui.editLink": "查看",

      "t.added": "已加入购物袋",
      "t.search": "搜索为预览功能",
      "t.searchSub": "完整搜索将在 M1 版实现",
      "t.acct": "账户功能将随 API 上线",
      "t.acctSub": "M1 阶段 — 认证演示",
      "t.link": "设计预览",
      "t.linkSub": "将在完整版中提供",
      "t.checkout": "结账为预览功能",
      "t.checkoutSub": "模拟支付网关将在 M2 阶段实现",
      "t.sub": "订阅成功",
      "t.subSub": "新一期出版时会寄信给你",
      "t.lang": "语言已切换",
      "t.langSub": "下次访问将记住此设置"
    },

    ja: {
      "micro.duty": "関税・税込み（シミュレーション）",
      "micro.insure": "世界配送・保険付き",
      "micro.return": "30日間返品可能",
      "nav.shop": "ショップ",
      "nav.new": "新着",
      "nav.objects": "プロダクト",
      "nav.journal": "ジャーナル",
      "search.ph": "商品を検索…",
      "bread.home": "ホーム",
      "bread.objects": "プロダクト",

      "hero.kicker": "オブジェクト・エディット — No.07",
      "hero.copy": "12の国から集めた、陶器・テキスタイル・道具の厳選エディット。関税・税込の価格表示です。",
      "hero.explore": "エディットを見る",
      "meta.countries": "仕入れ国",
      "meta.dispatch": "出荷",
      "meta.returns": "返品",
      "hero.caption": "サンドの器 — 作家 No.02",
      "cue.scroll": "スクロール",

      "sec.editK": "いまのエディット",
      "sec.newK": "新着アイテム",
      "sec.aboutK": "長い目で見ること",
      "sec.valuesK": "静かな約束",
      "sec.newsK": "ジャーナル",

      "band.kicker": "なぜ、あえてゆっくり運ぶのか",
      "band.note1": "一点ずつ実際に選び、ひとつの通貨で価格を揃え、関税と税をあらかじめ精算します。見たままが届く——玄関先での驚きはありません。",
      "band.note2": "数を絞り、丁寧に作り、価格は一度きり。",
      "ui.meetMakers": "作り手に会う",

      "ui.viewAll": "すべて見る",
      "ui.startHere": "まずはこちら",
      "ui.backEdit": "エディットへ戻る",
      "about.para": "季節を追わず、世代を超えて技を磨いてきた工房を訪ねます。数を絞り、丁寧に作り、価格は一度きり。",
      "about.link": "作り手について",

      "v1t": "関税・税込み",
      "v1p": "表示価格がそのままお支払い価格。税は元で精算済み（現在はシミュレーション台帳）。",
      "v2t": "すべての段階で保険付き",
      "v2p": "作り手の机から玄関先まで、全行程を保険付きでお届けします。",
      "v3t": "手間いらずの返品",
      "v3p": "30日間、理由は問いません。返送用ラベルは前払い。長く添えない品なら、送り返してください。",

      "news.note": "月に一通——作り手のノート、新作のご案内、そして「ゆっくり」こそ近道である理由を。",
      "news.ph": "メールアドレス",
      "ui.subscribe": "登録する",
      "news.fine": "余計な通知はなし。いつでも解除できます。",

      "footer.desc": "海を越えてでも手にしたい品。シミュレーション型クロスボーダーEC——Quell-ECP デザインプレビュー。",
      "col.shop": "ショップ",
      "col.company": "ブランド",
      "col.support": "サポート",
      "f.lighting": "照明",
      "f.table": "テーブル",
      "f.living": "リビング",
      "f.objects": "オブジェ",
      "f.makers": "作り手",
      "f.journal": "ジャーナル",
      "f.contract": "ブランドの約束",
      "f.careers": "採用情報",
      "f.ship": "配送と関税",
      "f.returns": "返品ポリシー",
      "f.contact": "お問い合わせ",
      "f.account": "アカウント",
      "base.copy": "© 2026 Quell-ECP — デザインプレビュー",
      "base.fine": "このプレビューでは実際の注文は発生しません。チェックアウトと決済は M2 で実装予定のシミュレーションです。",
      "menu.foot": "Quell — 海を越えても手にしたい品。<br>関税・税込み · シミュレーション環境。",

      "bag.title": "バッグ",
      "bag.shipLeft": "あと <b>%s</b> で送料無料",
      "bag.shipFree": "送料無料を達成 <b>— 関税・税込み</b>",
      "bag.subtotal": "小計",
      "bag.note": "関税・税込み · 保険付き配送",
      "bag.checkout": "チェックアウト — デモ",
      "bag.continue": "買い物を続ける",
      "bag.remove": "削除",
      "bag.emptyTitle": "バッグは空です。",
      "bag.emptySub": "エディットを覗いて、手元に置きたい一品を見つけてください。",

      "ui.quickadd": "追加",
      "ui.quantity": "数量",

      "pdp.tax": "関税・税込み",
      "pdp.finish": "カラー",
      "pdp.addBag": "バッグに入れる — %s",
      "pdp.zoom": "フル版ではドラッグ表示",
      "pdp.inStock": "在庫あり・48時間以内に出荷",
      "pdp.returns": "30日間返品可",
      "pdp.insured": "保険付き配送",
      "pdp.desc": "商品説明",
      "pdp.care": "素材とお手入れ",
      "pdp.ship": "配送と関税",
      "pdp.descMore": "Quell エディットの一点——一度選び、長く使うための品。",
      "pdp.shipBody": "表示価格には関税・輸入税が含まれます（シミュレーション環境）。$200 以上で送料無料。全品保険付き、30日間返品可能。",
      "rel.k": "もう少し見る",
      "rel.title": "こちらもおすすめ",
      "ui.editLink": "見る",

      "t.added": "バッグに追加しました",
      "t.search": "検索はプレビューです",
      "t.searchSub": "本格検索は M1 版で実装予定",
      "t.acct": "アカウントは API とともに",
      "t.acctSub": "M1 フェーズ — 認証デモ",
      "t.link": "デザインプレビュー",
      "t.linkSub": "フルビルドでリンクされます",
      "t.checkout": "チェックアウトはプレビューです",
      "t.checkoutSub": "決済シミュレーションは M2 で実装予定",
      "t.sub": "登録完了",
      "t.subSub": "次号の手紙をお楽しみに",
      "t.lang": "言語を切り替えました",
      "t.langSub": "次回の訪問時もこの設定を記憶します"
    }
  };

  const H = {
    en: {
      "hero.title":
        '<span class="ln"><span>Objects that</span></span>' +
        '<span class="ln"><span>cross borders,</span></span>' +
        '<span class="ln"><span><em>quietly.</em></span></span>',
      "sec.editTitle": "The edit, <em>as of now</em>",
      "sec.newTitle": "Considered objects, <em>gathered slowly</em>",
      "sec.aboutTitle": "Not cheap.<br><em>Just worth it.</em>",
      "sec.newsTitle": "Letters, <em>not spam.</em>",
      "band.statement": "We move on purpose. Most of this will <em>outlast its shipping box</em> — that’s the whole point.",
      "about.stamp": "Makers<br>first"
    },
    zh: {
      "hero.title":
        '<span class="ln"><span>器物值得远渡重洋，</span></span>' +
        '<span class="ln"><span>但它们总会</span></span>' +
        '<span class="ln"><span><em>安静抵达。</em></span></span>',
      "sec.editTitle": "在售精选，<em>此时此刻</em>",
      "sec.newTitle": "思虑再三之物，<em>缓缓而来</em>",
      "sec.aboutTitle": "不廉价，<br><em>只是值得。</em>",
      "sec.newsTitle": "一封封来信，<em>而非打扰。</em>",
      "band.statement": "我们刻意放慢脚步——多数器物会<em>比包装箱更长寿</em>。这正是意义所在。",
      "about.stamp": "匠人<br>至上"
    },
    ja: {
      "hero.title":
        '<span class="ln"><span>海を越えてでも</span></span>' +
        '<span class="ln"><span>手にしたいものは、</span></span>' +
        '<span class="ln"><span><em>静かに届く。</em></span></span>',
      "sec.editTitle": "いまの<em>エディット</em>",
      "sec.newTitle": "ゆっくり集めた、<em>選び抜かれたもの</em>",
      "sec.aboutTitle": "安くはない。<br><em>それだけの価値はある。</em>",
      "sec.newsTitle": "手紙は、<em>迷惑メールではない。</em>",
      "band.statement": "あえてゆっくり運びます。ほとんどは<em>段ボールより長く生きる</em>。それが、私たちの流儀です。",
      "about.stamp": "作り手<br>ファースト"
    }
  };

  const KEY_LANGS = ["en", "zh", "ja"];
  const store = (() => { try { return localStorage.getItem("quell-lang"); } catch (e) { return null; } })();
  let lang = KEY_LANGS.includes(store) ? store : "en";
  const subs = [];

  const text = (k, l) => (l || lang) && S[l || lang][k];
  const set = (l) => {
    if (!KEY_LANGS.includes(l) || l === lang) { mark(); return; }
    lang = l;
    try { localStorage.setItem("quell-lang", l); } catch (e) { /* noop */ }
    apply(true);
  };

  const mark = () => {
    document.querySelectorAll("[data-lang]").forEach((b) => {
      const active = b.dataset.lang === lang;
      b.classList.toggle("on", active);
      if (b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", String(active));
      if (b.hasAttribute("aria-checked")) b.setAttribute("aria-checked", String(active));
    });
    const codeEl = document.getElementById("lang-code");
    if (codeEl) codeEl.textContent = { en: "EN", zh: "中", ja: "日" }[lang];
  };

  const apply = (isSwitch) => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang === "ja" ? "ja" : "en";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = text(el.dataset.i18n);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const v = text(el.dataset.i18nPh);
      if (v != null) el.setAttribute("placeholder", v);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = (H[lang] || {})[el.dataset.i18nHtml] || (S[lang] || {})[el.dataset.i18nHtml];
      if (v != null) {
        if (isSwitch && el.classList.contains("hero-title")) el.classList.add("noanim");
        el.innerHTML = v;
      }
    });

    const dyn = document.getElementById("pdp-root");
    if (!dyn) {
      const t = text("page.title") || (lang === "zh" ? "QUELL — 值得远渡重洋的器物" : lang === "ja" ? "QUELL — 海を越えても手にしたい品" : "QUELL — Considered goods from across the world");
      document.title = t;
    }
    mark();
    subs.forEach((fn) => { try { fn(); } catch (e) { /* keep going */ } });
  };

  const onChange = (fn) => subs.push(fn);
  const get = () => lang;
  const m = (k, params) => {
    let v = text(k);
    if (v == null) v = S.en[k] || k;
    if (params) params.forEach((p, i) => { v = v.replace("%s", p); });
    return v;
  };

  window.I18N = { set, get, m, onChange, text };

  /* floating language fab */
  const fab = document.getElementById("langfab");
  const closePop = () => {
    if (!fab) return;
    fab.classList.remove("open");
    const core = fab.querySelector("#langfab-core");
    if (core) core.setAttribute("aria-expanded", "false");
  };
  const togglePop = () => {
    if (!fab) return;
    const opening = !fab.classList.contains("open");
    fab.classList.toggle("open", opening);
    const core = fab.querySelector("#langfab-core");
    if (core) core.setAttribute("aria-expanded", String(opening));
  };
  if (fab) {
    const core = fab.querySelector("#langfab-core");
    if (core) core.addEventListener("click", (e) => { e.stopPropagation(); togglePop(); });
    fab.querySelectorAll("[data-lang]").forEach((b) =>
      b.addEventListener("click", () => closePop())
    );
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#langfab")) closePop();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); });
  }

  /* language switcher rows (chrome shell exists in DOM at this point) */
  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => { set(b.dataset.lang); closePop(); })
  );

  apply(false);
})();
