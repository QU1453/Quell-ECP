/* ============================================================
   QUELL — catalog-driven storefront rendering (design preview)
   Tri-lingual (EN/中文/日本語) · re-renders on language change
   Load AFTER i18n.js, BEFORE app.js.
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
  const LANG = () => (window.I18N ? I18N.get() : "en");
  const pick = (o) => o[LANG()] || o.en;
  const m = (k) => (window.I18N ? I18N.m(k) : k);

  /* ---------- catalog ---------- */
  const CATALOG = [
    {
      id: "lamp",
      name: { en: "Ivoire Table Lamp", zh: "象牙白陶台灯", ja: "アイボリー陶器のテーブルランプ" },
      cat: { en: "Lighting", zh: "灯具", ja: "照明" },
      price: 168,
      img: "hand-thrown ivory ceramic table lamp with pleated natural linen lampshade",
      img2: "close detail of ivory ceramic lamp base with woven linen shade texture",
      colors: [
        { l: { en: "Sand", zh: "沙色", ja: "サンド" }, h: "#D8C5A2" },
        { l: { en: "Smoke", zh: "烟灰色", ja: "スモーク" }, h: "#6F6A5F" }
      ],
      lede: {
        en: "Thrown by hand and fired in small batches, this lamp holds a warm, low light that stays gentle deep into the evening.",
        zh: "手工拉坯、小批量烧制。亮起时，暖光温和而沉静，能一直陪你到深夜。",
        ja: "手びねりで成形し、小ロットで焼き上げました。つけると柔らかな光が広がり、夜遅くまで静かに寄り添います。"
      },
      material: {
        en: "Glazed ceramic, natural linen shade. Dust with a dry cloth; keep the shade clear of direct heat.",
        zh: "釉面陶器与亚麻灯罩。用干布除尘即可；灯罩请远离热源。",
        ja: "釉薬をかけた陶器とリネンのシェード。乾いた布でほこりを払って。シェードは熱源から離して。"
      }
    },
    {
      id: "candles",
      name: { en: "Studio Candlesticks", zh: "手作黄铜烛台", ja: "スタジオ・キャンドルホルダー" },
      cat: { en: "Objects", zh: "器物", ja: "オブジェ" },
      price: 120,
      img: "trio of brushed brass candlesticks in three heights with subtle patina",
      img2: "macro of brushed brass candlestick surface with warm patina",
      colors: [{ l: { en: "Brass", zh: "黄铜", ja: "ブラス" }, h: "#B08A50" }],
      lede: {
        en: "Cast and hand-brushed, three quiet heights that gather light the way a table should — whether lit or not.",
        zh: "铸造后手工拉丝，三支不同高度，为桌面收集光线——无论点不点蜡烛。",
        ja: "鋳造後、手作業でブラシ仕上げ。高さの違う3本が、灯りを灯さなくてもテーブルを整えます。"
      },
      material: {
        en: "Solid brass, hand-brushed finish. Polish sparingly; patina is part of the piece.",
        zh: "实心黄铜，手工拉丝表面。适度抛光即可，铜绿也是岁月的一部分。",
        ja: "無垢の真鍮、手作業のブラシ仕上げ。磨きすぎは不要。緑青もまた、経年美の一部。"
      }
    },
    {
      id: "throw",
      name: { en: "Oat Throw", zh: "燕麦羊绒盖毯", ja: "オート・スロー" },
      cat: { en: "Living", zh: "起居", ja: "リビング" },
      price: 240,
      img: "neatly folded undyed oat-colored cashmere throw blanket on soft surface",
      img2: "folded cashmere throw showing ribbed weave detail in oat tone",
      colors: [
        { l: { en: "Oat", zh: "燕麦色", ja: "オート" }, h: "#C9B99B" },
        { l: { en: "Clay", zh: "陶土色", ja: "クレイ" }, h: "#A8643E" }
      ],
      lede: {
        en: "Undyed and unbleached, spun from Mongolian cashmere. Heavy enough to mean it, light enough to forget it's there.",
        zh: "未染色、未漂白，取自蒙古羊绒。够厚实，也够轻软——披上的瞬间就会被记住。",
        ja: "染色も漂白もせず、モンゴリアンカシミヤで紡いだ一枚。重すぎず軽すぎず、かけるたびにその良さを思い出させます。"
      },
      material: {
        en: "100% Mongolian cashmere, undyed. Dry clean or hand-wash cold; lay flat to dry.",
        zh: "100% 蒙古羊绒，未染色。建议干洗或冷水手洗，平铺晾干。",
        ja: "100%モンゴリアンカシミヤ、無染色。ドライクリーニングか冷水手洗いで、平干しに。"
      }
    },
    {
      id: "espresso",
      name: { en: "Morning Espresso Set", zh: "晨间浓缩咖啡杯组", ja: "モーニング・エスプレッソセット" },
      cat: { en: "Table", zh: "餐桌", ja: "テーブル" },
      price: 96,
      img: "pair of handmade speckled stoneware espresso cups on saucers",
      img2: "speckled stoneware espresso cup held in hand, top-down view",
      colors: [
        { l: { en: "Speckle", zh: "斑釉", ja: "スペックル" }, h: "#B7A98C" },
        { l: { en: "Oxblood", zh: "牛血红", ja: "オックスブラッド" }, h: "#7A3B2C" }
      ],
      lede: {
        en: "Two cups, two saucers, one slow morning. The glaze settles differently on every piece — no two sets are identical.",
        zh: "两只杯、两只碟、一个慢下来的早晨。釉色每件都不同——没有哪两套完全一样。",
        ja: "カップ2客、ソーサー2枚、そしてゆっくりした朝をひとつ。釉の表情は一点ごとに違います。"
      },
      material: {
        en: "Hand-thrown stoneware, food-safe glaze. Dishwasher safe; hand-washing keeps the glaze brightest.",
        zh: "手作粗陶，食品级釉面。可用洗碗机；手洗能让釉色保持最佳状态。",
        ja: "手作りの炻器、食品用の釉薬。食洗機でもOKですが、手洗いのほうが釉の輝きを保てます。"
      }
    },
    {
      id: "tray",
      name: { en: "Oak Server", zh: "橡木托盘", ja: "オーク・トレイ" },
      cat: { en: "Objects", zh: "器物", ja: "オブジェ" },
      price: 84,
      img: "natural white oak serving tray with rounded edges and visible grain",
      img2: "oak serving tray edge detail showing visible wood grain",
      colors: [{ l: { en: "Natural", zh: "原木色", ja: "ナチュラル" }, h: "#C29B68" }],
      lede: {
        en: "One board, cut and sanded until the grain reads like a map. Strong enough for a full breakfast, good-looking enough to skip it.",
        zh: "一整块木板，打磨到木纹如同地图。装得下整桌早餐，也漂亮得可以独自登场。",
        ja: "一枚の板を、木目が地図のように浮かぶまで削りました。朝食一式を載せても、そのまま飾っても。"
      },
      material: {
        en: "Solid European white oak, natural oil finish. Re-oil yearly; wipe clean with a damp cloth.",
        zh: "欧洲白橡木，天然油面。每年补一次油；用湿布擦拭即可。",
        ja: "ヨーロピアン・ホワイトオーク、天然オイル仕上げ。年に一度オイルを。濡れ布巾で拭いて。"
      }
    },
    {
      id: "carafe",
      name: { en: "Cloud Carafe", zh: "云雾玻璃水瓶", ja: "クラウド・カラフェ" },
      cat: { en: "Table", zh: "餐桌", ja: "テーブル" },
      price: 58,
      img: "smoked glass carafe with thin glass stopper on warm background",
      img2: "smoked glass carafe with water pouring softly, condensation detail",
      colors: [
        { l: { en: "Smoke", zh: "烟灰", ja: "スモーク" }, h: "#4E524E" },
        { l: { en: "Clear", zh: "透明", ja: "クリア" }, h: "#CFD6D2" }
      ],
      lede: {
        en: "Blown from a single gather of glass, its thin stopper sits so lightly it almost floats. Water has never looked this expensive.",
        zh: "一吹成型的玻璃，瓶塞轻得几乎要浮起来。水，从未显得如此贵重。",
        ja: "一吹きで成形したガラス。栓は軽く、まるで浮かんでいるよう。水がこんなに贅沢に見えたことはありません。"
      },
      material: {
        en: "Hand-blown borosilicate glass. Hand-wash only; avoid thermal shock.",
        zh: "手工吹制硼硅玻璃。仅可手洗；避免骤冷骤热。",
        ja: "手吹きのホウケイ酸ガラス。手洗いのみ。急激な温度変化を避けて。"
      }
    }
  ];

  const byId = (id) => CATALOG.find((p) => p.id === id);

  /* ---------- card ---------- */
  const cardHTML = (p, i, noAnim) => `
    <article class="card rv ${noAnim ? "in" : ""}" style="--d:${i * 90}ms"
      data-pid="${p.id}" data-ci="0"
      data-name="${pick(p.name)}" data-price="${p.price}" data-img="${p.img}" data-alt="${pick(p.name)}"
      data-variant="${pick(p.colors[0].l)}">
      <a class="card-media" href="product.html?id=${p.id}" aria-label="${pick(p.name)}">
        <img src="${imgURL(p.img)}" alt="${pick(p.name)}" loading="lazy">
      </a>
      <button class="quick" aria-label="${m("ui.quickadd")} ${pick(p.name)}">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 3v10M3 8h10"/></svg>
        ${m("ui.quickadd")}
      </button>
      <div class="card-info">
        <div><a href="product.html?id=${p.id}" class="name">${pick(p.name)}</a>
        <div class="cat">${pick(p.cat)}</div></div>
        <span class="price">${USD(p.price)}</span>
      </div>
    </article>`;

  /* ---------- numbered editorial row ---------- */
  const rowHTML = (p, i, noAnim) => `
    <a class="list-row rv ${noAnim ? "in" : ""}" style="--d:${i * 80}ms" href="product.html?id=${p.id}">
      <span class="no">0${i + 1}</span>
      <div><h3>${pick(p.name)}</h3><div class="cat" style="margin-top:6px">${pick(p.cat)} · ${USD(p.price)}</div></div>
      <span class="meta">
        <span class="cat">${pick(p.colors[0].l)}</span>
        <span class="lnk">${m("ui.editLink")}<span class="ar">→</span></span>
      </span>
    </a>`;

  /* ---------- PDP ---------- */
  const pdpHTML = (p) => {
    const dots = p.colors
      .map((c, i) => `<button class="chip swatch ${i === 0 ? "on" : ""}" data-val="${pick(c.l)}" data-i="${i}" style="background:${c.h}" aria-label="${pick(c.l)}"></button>`)
      .join("");
    const thumbs = [p.img, p.img2]
      .map((src, i) => `<button class="${i === 0 ? "on" : ""}" data-src="${imgURL(src)}" aria-label="View ${i + 1}"><img src="${imgURL(src)}" alt="" loading="lazy"></button>`)
      .join("");

    return `
    <div class="pdp" data-pid="${p.id}" data-name="${pick(p.name)}" data-price="${p.price}" data-img="${p.img}" data-alt="${pick(p.name)}">
      <div class="pdp-media">
        <div class="thumbs">${thumbs}</div>
        <div class="stage"><img src="${imgURL(p.img)}" alt="${pick(p.name)}">
          <span class="zoom-hint">${m("pdp.zoom")}</span>
        </div>
      </div>
      <div class="pdp-info">
        <span class="kicker">${pick(p.cat)} — Quell Studio</span>
        <h1>${pick(p.name)}</h1>
        <div class="price-row">
          <span class="price">${USD(p.price)}</span>
          <span class="tax">· ${m("pdp.tax")}</span>
        </div>
        <p class="lede">${pick(p.lede)}</p>

        <div class="opt">
          <div class="opt-head"><span>${m("pdp.finish")}</span><span class="val">${pick(p.colors[0].l)}</span></div>
          <div class="chips">${dots}</div>
        </div>

        <div class="buy-row">
          <span class="qty"><button data-d="-1" aria-label="−">−</button><span class="n">1</span><button data-d="1" aria-label="+">+</button></span>
          <button class="btn btn-dark btn-big" id="add-bag">${m("pdp.addBag").replace("%s", USD(p.price))}</button>
        </div>
        <div class="trust">
          <span><svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><path d="M2 8.5 6 12.5 14 4"/></svg>${m("pdp.inStock")}</span>
          <span><svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><path d="M2 8.5 6 12.5 14 4"/></svg>${m("pdp.returns")}</span>
          <span><svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><path d="M2 8.5 6 12.5 14 4"/></svg>${m("pdp.insured")}</span>
        </div>

        <div class="acc">
          <details class="acc-item" open>
            <summary>${m("pdp.desc")}<span class="pm"></span></summary>
            <div class="acc-body">${pick(p.lede)}<br><br>${m("pdp.descMore")}</div>
          </details>
          <details class="acc-item">
            <summary>${m("pdp.care")}<span class="pm"></span></summary>
            <div class="acc-body">${pick(p.material)}</div>
          </details>
          <details class="acc-item">
            <summary>${m("pdp.ship")}<span class="pm"></span></summary>
            <div class="acc-body">${m("pdp.shipBody")}</div>
          </details>
        </div>
      </div>
    </div>`;
  };

  /* ---------- render / re-render ---------- */
  const editRoot = document.getElementById("edit-grid");
  const listRoot = document.getElementById("new-list");
  const pdpRoot = document.getElementById("pdp-root");
  const relRoot = document.getElementById("related");

  const EDIT = ["lamp", "candles", "throw"];
  const NEWLIST = ["espresso", "tray", "carafe"];
  let first = true;

  const renderAll = () => {
    const noAnim = !first;
    if (editRoot) {
      editRoot.innerHTML = "";
      EDIT.forEach((id, i) => editRoot.insertAdjacentHTML("beforeend", cardHTML(byId(id), i, noAnim)));
    }
    if (listRoot) {
      listRoot.innerHTML = "";
      NEWLIST.forEach((id, i) => listRoot.insertAdjacentHTML("beforeend", rowHTML(byId(id), i, noAnim)));
    }
    if (pdpRoot) {
      const params = new URLSearchParams(location.search);
      const p = byId(params.get("id")) || byId("lamp");
      document.title = pick(p.name) + " — QUELL";
      const crumb = document.getElementById("crumb");
      if (crumb) crumb.textContent = pick(p.name);
      pdpRoot.innerHTML = "";
      pdpRoot.insertAdjacentHTML("beforeend", pdpHTML(p));
    }
    if (relRoot) {
      relRoot.innerHTML = "";
      const params = new URLSearchParams(location.search);
      const current = (params.get("id") && byId(params.get("id"))) || byId("lamp");
      CATALOG.filter((x) => x.id !== current.id).slice(0, 4).forEach((o, i) => relRoot.insertAdjacentHTML("beforeend", cardHTML(o, i, noAnim)));
    }
    if (first) first = false;
    if (window.I18N && I18N.augment) I18N.augment();
  };

  if (window.I18N) I18N.onChange(renderAll);
  renderAll();

  /* expose catalog + localizer for app.js (bag lines re-localize on switch) */
  window.QUEL_CAT = CATALOG;
  window.QUEL_PICK = pick;

  /* styles used by JS-rendered bits */
  const st = document.createElement("style");
  st.textContent = ".card .name{font-family:var(--serif);font-size:20px;font-weight:380;line-height:1.2} .cat{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft)}";
  document.head.appendChild(st);
})();
