/* ============================================================
   QUELL — data layer (design preview)
   8 categories · 6 maker studios · 19 products · seeded
   orders / addresses / journal essays. Tri-lingual {en,zh,ja}.
   ============================================================ */
(() => {
  "use strict";

  const L = () => {
    const l = window.I18N ? I18N.get() : "en";
    return l === "zh-CN" || l === "zh" ? "zh" : l === "ja" ? "ja" : "en";
  };
  const pick = (o) => (o ? o[L()] || o.en : "");

  /* ---------- currency (simulated display rates) ---------- */
  const RATES = { USD: 1, CNY: 7.2, JPY: 150 };

  /* ---------- categories ---------- */
  const CATS = [
    { id: "lighting", l: { en: "Lighting", zh: "灯饰", ja: "照明" }, img: "warm glowing ceramic table lamp in dim minimalist room" },
    { id: "table",    l: { en: "Table",    zh: "餐桌", ja: "テーブル" }, img: "handmade stoneware plates and glassware set on oak table" },
    { id: "living",   l: { en: "Living",   zh: "起居", ja: "リビング" }, img: "minimal living room corner with wooden stool and linen throw" },
    { id: "objects",  l: { en: "Objects",  zh: "器物", ja: "オブジェ" }, img: "collection of brass and ceramic desk objects on shelf" },
    { id: "textiles", l: { en: "Textiles", zh: "织物", ja: "テキスタイル" }, img: "folded stack of oat and clay linen textiles soft light" },
    { id: "kitchen",  l: { en: "Kitchen",  zh: "厨房", ja: "キッチン" }, img: "walnut cutting board and stone mortar on kitchen counter" },
    { id: "decor",    l: { en: "Decor",    zh: "装饰", ja: "デコール" }, img: "round brass wall mirror above ceramic vase with dried grass" },
    { id: "bath",     l: { en: "Bath",     zh: "卫浴", ja: "バス" }, img: "stacked handmade soap bars and waffle towel on stone ledge" }
  ];

  /* ---------- maker studios (shops) ---------- */
  const MAKERS = [
    {
      id: "nord", name: "Atelier Nord", since: 1987, city: { en: "Copenhagen", zh: "哥本哈根", ja: "コペンハーゲン" },
      country: { en: "Denmark", zh: "丹麦", ja: "デンマーク" },
      craft: { en: "Ceramics & light", zh: "陶与光", ja: "陶と光" },
      blurb: { en: "A two-person workshop firing small batches of lamps and vessels since the late eighties.",
        zh: "一间双人工坊，自八十年代末起小批量烧制灯具与器皿。", ja: "二人だけの工房。80 年代末から小ロットでランプと器を焼き続けています。" },
      img: "portrait of a Danish ceramicist in linen apron at pottery wheel, warm studio light"
    },
    {
      id: "fjord", name: "Fjordform", since: 2004, city: { en: "Bergen", zh: "卑尔根", ja: "ベルゲン" },
      country: { en: "Norway", zh: "挪威", ja: "ノルウェー" },
      craft: { en: "Metal & mirrors", zh: "金属与镜", ja: "金属と鏡" },
      blurb: { en: "Brass, steel and patience. Mirror frames polished until the fjord light fits inside them.",
        zh: "黄铜、钢与耐心。把镜框打磨到能装下峡湾的光。", ja: "真鍮と鋼と、根気。フィヨルドの光が映るまで鏡枠を磨きます。" },
      img: "portrait of a Norwegian metalworker hammering brass in bright workshop"
    },
    {
      id: "kaol", name: "Studio Kaol", since: 1998, city: { en: "Kyoto", zh: "京都", ja: "京都" },
      country: { en: "Japan", zh: "日本", ja: "日本" },
      craft: { en: "Paper, clay & tea", zh: "纸、陶与茶", ja: "紙・陶・茶" },
      blurb: { en: "Washi lanterns and cast-iron tea ware, made the slow way a short walk from the Kamo river.",
        zh: "和纸灯笼与铸铁茶器，都按慢办法做，工坊离鸭川不远。", ja: "和紙の行灯と鋳鉄の茶器。鴨川からほど近い工房で、ゆっくり作ります。" },
      img: "portrait of a Japanese craftsman folding washi paper lantern in tatami workshop"
    },
    {
      id: "terra", name: "Terra Bruta", since: 1991, city: { en: "Tuscany", zh: "托斯卡纳", ja: "トスカーナ" },
      country: { en: "Italy", zh: "意大利", ja: "イタリア" },
      craft: { en: "Stoneware", zh: "粗陶", ja: "炻器" },
      blurb: { en: "Speckled stoneware fired in a wood kiln up a cypress-lined track. No two glazes agree.",
        zh: "柏树小路尽头的柴窑粗陶。没有两片釉色肯彼此雷同。", ja: "糸杉の並木の先にある登り窯の炻器。同じ釉は二つとありません。" },
      img: "portrait of an Italian potter unloading wood kiln, terracotta dust on hands"
    },
    {
      id: "miramonti", name: "Miramonti", since: 1982, city: { en: "Milan", zh: "米兰", ja: "ミラノ" },
      country: { en: "Italy", zh: "意大利", ja: "イタリア" },
      craft: { en: "Glass & brass", zh: "玻璃与铜", ja: "ガラスと真鍮" },
      blurb: { en: "Third-generation glassblowers and brass finishers serving quiet tables across Europe.",
        zh: "第三代吹玻璃匠与铜匠，为欧洲安静的餐桌服务。", ja: "三代続くガラス吹きと真鍮仕上げ職人。ヨーロッパの静かな食卓を支えます。" },
      img: "portrait of an Italian glassblower shaping molten glass in warm furnace light"
    },
    {
      id: "emyr", name: "Emyr & Co.", since: 2009, city: { en: "Wales", zh: "威尔士", ja: "ウェールズ" },
      country: { en: "United Kingdom", zh: "英国", ja: "イギリス" },
      craft: { en: "Wood & weave", zh: "木与织", ja: "木と織" },
      blurb: { en: "Oak boards, Welsh wool and honest joinery from a converted slate barn.",
        zh: "橡木板、威尔士羊毛，和一间石板仓改出的诚实木工房。", ja: "オークの板とウェールズの羊毛。石板倉庫を改造した正直な工房です。" },
      img: "portrait of a Welsh woodworker planing oak board in slate barn workshop"
    }
  ];

  /* ---------- catalog (19) ---------- */
  const CATALOG = [
    {
      id: "lamp", name: { en: "Ivoire Table Lamp", zh: "象牙白陶台灯", ja: "アイボリー陶器ランプ" }, cat: "lighting", maker: "nord",
      price: 168, rating: 4.8, reviews: 126, isNew: false, isHot: true,
      img: "hand-thrown ivory ceramic table lamp with pleated natural linen lampshade",
      img2: "close detail of ivory ceramic lamp base with woven linen shade texture",
      colors: [ { l: { en: "Sand", zh: "沙色", ja: "サンド" }, h: "#D8C5A2" }, { l: { en: "Smoke", zh: "烟灰", ja: "スモーク" }, h: "#6F6A5F" } ],
      lede: { en: "Thrown by hand and fired in small batches, this lamp holds a warm, low light that stays gentle deep into the evening.",
        zh: "手工拉坯、小批量烧制。亮起时，暖光温和而沉静，能一直陪你到深夜。",
        ja: "手びねりで成形し、小ロットで焼き上げました。柔らかな光が、夜遅くまで静かに寄り添います。" },
      material: { en: "Glazed ceramic, natural linen shade. Dust with a dry cloth; keep the shade clear of direct heat.",
        zh: "釉面陶器与亚麻灯罩。干布除尘即可；灯罩请远离热源。",
        ja: "釉薬をかけた陶器とリネンのシェード。乾いた布でほこりを。シェードは熱源から離して。" }
    },
    {
      id: "sconce", name: { en: "Halden Sconce", zh: "哈尔登壁灯", ja: "ハルデン壁灯" }, cat: "lighting", maker: "fjord",
      price: 210, rating: 4.7, reviews: 48, isNew: true,
      img: "brushed brass wall sconce with opal glass globe against plaster wall",
      img2: "detail of brass wall sconce mount with softly glowing opal glass",
      colors: [ { l: { en: "Brass", zh: "黄铜", ja: "ブラス" }, h: "#B08A50" }, { l: { en: "Blackened", zh: "熏黑", ja: "黒染め" }, h: "#3A3630" } ],
      lede: { en: "A quiet arc of brass holding a moon of opal glass. Wired for beside the bed, above the shelf, wherever you read.",
        zh: "一道安静的黄铜弧线，托着一枚蛋白石玻璃的月亮。床头、书架上方，你在哪里阅读，它就在哪里。",
        ja: "真鍮の静かなアーチが、オパールガラスの月を支えます。ベッドサイドにも、棚の上にも。" },
      material: { en: "Solid brass, opal mouth-blown glass. Wipe with a soft dry cloth.",
        zh: "实心黄铜与吹制蛋白玻璃。软干布轻拭即可。", ja: "無垢の真鍮と、口吹きオパールガラス。柔らかい乾布で。" }
    },
    {
      id: "lantern", name: { en: "Kamo Washi Lantern", zh: "鸭川和纸灯笼", ja: "鴨川和紙ランタン" }, cat: "lighting", maker: "kaol",
      price: 95, rating: 4.9, reviews: 203, isHot: true,
      img: "cylindrical washi paper lantern lamp glowing softly on wooden floor",
      img2: "detail of washi paper texture backlit with warm diffused light",
      colors: [ { l: { en: "Natural", zh: "原色", ja: "生成り" }, h: "#E8DFC8" }, { l: { en: "Indigo", zh: "靛蓝", ja: "藍" }, h: "#41506B" } ],
      lede: { en: "Bamboo ribs, mulberry paper, and a bulb that turns the whole room amber. Folds flat for the seasons you don't need it.",
        zh: "竹骨、桑皮纸，和一颗能把整个房间染成琥珀色的灯泡。不用的季节，可以收拢成一片。",
        ja: "竹の骨と桑の紙、そして部屋を琥珀色に染める電球。使わない季節は平らに畳めます。" },
      material: { en: "Bamboo frame, kozo washi paper. Keep away from moisture; LED bulb included.",
        zh: "竹骨与楮皮和纸。请防潮；附 LED 灯泡。", ja: "竹骨と楮の和紙。湿気を避けて。LED 電球付き。" }
    },
    {
      id: "espresso", name: { en: "Morning Espresso Set", zh: "晨间浓缩咖啡杯组", ja: "モーニング・エスプレッソセット" }, cat: "table", maker: "terra",
      price: 96, rating: 4.8, reviews: 167,
      img: "pair of handmade speckled stoneware espresso cups on saucers",
      img2: "speckled stoneware espresso cup held in hand, top-down view",
      colors: [ { l: { en: "Speckle", zh: "斑釉", ja: "スペックル" }, h: "#B7A98C" }, { l: { en: "Oxblood", zh: "牛血红", ja: "オックスブラッド" }, h: "#7A3B2C" } ],
      lede: { en: "Two cups, two saucers, one slow morning. The glaze settles differently on every piece — no two sets are identical.",
        zh: "两只杯、两只碟、一个慢下来的早晨。釉色每件都不同——没有哪两套完全一样。",
        ja: "カップ2客、ソーサー2枚、そしてゆっくりした朝をひとつ。釉の表情は一点ごとに違います。" },
      material: { en: "Hand-thrown stoneware, food-safe glaze. Dishwasher safe; hand-washing keeps the glaze brightest.",
        zh: "手作粗陶，食品级釉面。可用洗碗机；手洗能让釉色保持最佳状态。",
        ja: "手作りの炻器、食品用の釉薬。食洗機可。手洗いが釉の輝きを保ちます。" }
    },
    {
      id: "plates", name: { en: "Cypress Dinner Plates", zh: "柏树晚餐盘", ja: "糸杉のディナープレート" }, cat: "table", maker: "terra",
      price: 128, rating: 4.7, reviews: 94, isHot: true,
      img: "stack of four speckled stoneware dinner plates in warm clay tone",
      img2: "place setting with speckled stoneware plate and linen napkin on oak table",
      colors: [ { l: { en: "Raw clay", zh: "生陶土", ja: "生の土" }, h: "#C4A482" }, { l: { en: "Ash grey", zh: "灰釉", ja: "灰釉" }, h: "#8B877C" } ],
      lede: { en: "Four wide plates with an unglazed rim that feels like river stone. Stack them, dish them, live with them.",
        zh: "四只宽盘，无釉的边缘像溪里的石头。叠起来、端上桌、过日子。",
        ja: "縁は釉をかけず、川石のような手触りの広皿4枚。重ねて、並べて、暮らす。" },
      material: { en: "Wood-fired stoneware, set of four. Oven safe to 220°C.",
        zh: "柴烧粗陶，一套四只。可入烤箱至 220°C。", ja: "登り窯の炻器、4枚セット。220°Cまでオーブン可。" }
    },
    {
      id: "teapot", name: { en: "Kuro Cast Teapot", zh: "黑铸铁茶壶", ja: "クロ鋳鉄急須" }, cat: "table", maker: "kaol",
      price: 145, rating: 4.9, reviews: 71, isNew: true,
      img: "matte black cast iron teapot with bamboo handle on stone surface",
      img2: "steam rising from matte black cast iron teapot spout, dark moody light",
      colors: [ { l: { en: "Sumi black", zh: "墨黑", ja: "墨黒" }, h: "#26231F" }, { l: { en: "Rust", zh: "铁锈", ja: "錆" }, h: "#7A4A32" } ],
      lede: { en: "Cast in a single pour, tinned inside, with a handle that finds your hand before you reach for it. Holds heat for an hour.",
        zh: "一次浇铸成型，内壁镀锡；你还没伸手，把手已经找到了你的手。保温一小时。",
        ja: "一括ぎで鋳て、内側は錫引き。手を伸ばす前に、持ち手が手を見つけます。一時間あたたかい。" },
      material: { en: "Cast iron with tin lining, bamboo handle. Dry fully after use.",
        zh: "铸铁镀锡，竹柄。用后请彻底晾干。", ja: "錫引きの鋳鉄と竹の持ち手。使用後はよく乾かして。" }
    },
    {
      id: "carafe", name: { en: "Cloud Carafe", zh: "云雾玻璃水瓶", ja: "クラウド・カラフェ" }, cat: "table", maker: "miramonti",
      price: 58, rating: 4.6, reviews: 88,
      img: "smoked glass carafe with thin glass stopper on warm background",
      img2: "smoked glass carafe with water pouring softly, condensation detail",
      colors: [ { l: { en: "Smoke", zh: "烟灰", ja: "スモーク" }, h: "#4E524E" }, { l: { en: "Clear", zh: "透明", ja: "クリア" }, h: "#CFD6D2" } ],
      lede: { en: "Blown from a single gather of glass, its thin stopper sits so lightly it almost floats. Water has never looked this expensive.",
        zh: "一吹成型的玻璃，瓶塞轻得几乎要浮起来。水，从未显得如此贵重。",
        ja: "一吹きで成形したガラス。栓は軽く、まるで浮かんでいるよう。" },
      material: { en: "Hand-blown borosilicate glass. Hand-wash only; avoid thermal shock.",
        zh: "手工吹制硼硅玻璃。仅可手洗；避免骤冷骤热。", ja: "手吹きのホウケイ酸ガラス。手洗いのみ。急激な温度変化を避けて。" }
    },
    {
      id: "tray", name: { en: "Oak Server", zh: "橡木托盘", ja: "オーク・トレイ" }, cat: "kitchen", maker: "emyr",
      price: 84, rating: 4.7, reviews: 63,
      img: "natural white oak serving tray with rounded edges and visible grain",
      img2: "oak serving tray edge detail showing visible wood grain",
      colors: [ { l: { en: "Natural", zh: "原木色", ja: "ナチュラル" }, h: "#C29B68" } ],
      lede: { en: "One board, cut and sanded until the grain reads like a map. Strong enough for a full breakfast, good-looking enough to skip it.",
        zh: "一整块木板，打磨到木纹如同地图。装得下整桌早餐，也漂亮得可以独自登场。",
        ja: "一枚の板を、木目が地図のように浮かぶまで削りました。" },
      material: { en: "Solid European white oak, natural oil finish. Re-oil yearly; wipe clean with a damp cloth.",
        zh: "欧洲白橡木，天然油面。每年补一次油；湿布擦拭即可。", ja: "ヨーロピアン・ホワイトオーク、天然オイル仕上げ。年に一度オイルを。" }
    },
    {
      id: "board", name: { en: "Walnut Butcher Board", zh: "胡桃木砧板", ja: "ウォールナットまな板" }, cat: "kitchen", maker: "emyr",
      price: 68, oldPrice: 92, rating: 4.8, reviews: 142,
      img: "dark walnut butcher block cutting board with juice groove",
      img2: "walnut cutting board end grain detail with knife and herbs",
      colors: [ { l: { en: "Walnut", zh: "胡桃色", ja: "ウォールナット" }, h: "#5E4630" } ],
      lede: { en: "End-grain walnut that closes over knife marks like skin over a scratch. The board you'll hand down.",
        zh: "端面胡桃木，刀痕会像皮肤上的划伤一样慢慢合拢。一块可以传下去的砧板。",
        ja: "木口のウォールナット。刃痕は時間とともに閉じていきます。受け継げるまな板。" },
      material: { en: "End-grain American walnut, food-safe oil. Hand-wash; never submerge.",
        zh: "美国胡桃木端面拼接，食品级油面。手洗；勿浸泡。", ja: "木口のアメリカン・ウォールナット、食品用オイル。手洗いで。浸け置き禁止。" }
    },
    {
      id: "mortar", name: { en: "Pietra Mortar", zh: "石臼研磨钵", ja: "ピエトラ石臼" }, cat: "kitchen", maker: "terra",
      price: 74, rating: 4.6, reviews: 57,
      img: "carved grey stone mortar and pestle with whole spices",
      img2: "hands grinding herbs in carved stone mortar, top view",
      colors: [ { l: { en: "Pietra", zh: "石灰岩", ja: "ピエトラ" }, h: "#9A958A" } ],
      lede: { en: "Carved from a single block of limestone, heavy enough to stay put while you lean into the pestle.",
        zh: "整块石灰岩凿成，重到足以在你用力研磨时纹丝不动。",
        ja: "一枚の石灰岩から掘り出し、杵に力を込めても動かない重さ。" },
      material: { en: "Carved limestone. Rinse and dry; season with garlic before first use.",
        zh: "凿制石灰岩。冲洗晾干；首次使用前先用大蒜养一遍。", ja: "掘り出しの石灰岩。洗って乾かす。使い始めにニンニクで慣らして。" }
    },
    {
      id: "throw", name: { en: "Oat Throw", zh: "燕麦羊绒盖毯", ja: "オート・スロー" }, cat: "textiles", maker: "emyr",
      price: 240, oldPrice: 320, rating: 4.9, reviews: 231, isHot: true,
      img: "neatly folded undyed oat-colored cashmere throw blanket on soft surface",
      img2: "folded cashmere throw showing ribbed weave detail in oat tone",
      colors: [ { l: { en: "Oat", zh: "燕麦色", ja: "オート" }, h: "#C9B99B" }, { l: { en: "Clay", zh: "陶土色", ja: "クレイ" }, h: "#A8643E" } ],
      lede: { en: "Undyed and unbleached, spun from Mongolian cashmere. Heavy enough to mean it, light enough to forget it's there.",
        zh: "未染色、未漂白，取自蒙古羊绒。够厚实，也够轻软——披上的瞬间就会被记住。",
        ja: "染色も漂白もせず、モンゴリアンカシミヤで紡いだ一枚。" },
      material: { en: "100% Mongolian cashmere, undyed. Dry clean or hand-wash cold; lay flat to dry.",
        zh: "100% 蒙古羊绒，未染色。建议干洗或冷水手洗，平铺晾干。",
        ja: "100%モンゴリアンカシミヤ、無染色。ドライクリーニングか冷水手洗い。" }
    },
    {
      id: "cushion", name: { en: "Stripe Linen Cushion", zh: "条纹亚麻抱枕", ja: "ストライプ・リネンクッション" }, cat: "textiles", maker: "nord",
      price: 110, rating: 4.7, reviews: 76, isNew: true,
      img: "oat linen cushion with subtle clay stripe on minimal bench",
      img2: "close-up of woven linen stripe texture in oat and clay tones",
      colors: [ { l: { en: "Oat stripe", zh: "燕麦条纹", ja: "オート・ストライプ" }, h: "#CBBB9E" }, { l: { en: "Clay stripe", zh: "陶土条纹", ja: "クレイ・ストライプ" }, h: "#A8643E" } ],
      lede: { en: "Heavyweight European flax with a single woven stripe — the quiet kind of pattern that makes a sofa look considered.",
        zh: "厚重欧洲亚麻，一道织出的条纹——那种安静的图案，能让沙发看起来被认真想过。",
        ja: "重量感のあるヨーロッパの亜麻に、織りのストライプ一本。ソファが考え抜かれて見える、静かな柄。" },
      material: { en: "Stonewashed European flax, feather insert included. Machine wash cold.",
        zh: "石洗欧洲亚麻，含羽绒内芯。冷水机洗。", ja: "ストーンウォッシュのヨーロッパ・リネン、フェザー入り。冷水で洗濯可。" }
    },
    {
      id: "bedset", name: { en: "Stone-Washed Bed Set", zh: "石洗床品套装", ja: "ストーンウォッシュ・ベッドセット" }, cat: "textiles", maker: "miramonti",
      price: 320, rating: 4.8, reviews: 119, isHot: true,
      img: "stone-washed grey linen bedding set neatly made on low bed",
      img2: "wrinkled stone-washed linen sheet detail in morning light",
      colors: [ { l: { en: "Fog", zh: "雾灰", ja: "フォグ" }, h: "#B7B4AC" }, { l: { en: "Sand", zh: "沙色", ja: "サンド" }, h: "#D3C4A9" } ],
      lede: { en: "Linen that arrives already broken-in — washed with volcanic stone until it drapes like a well-loved shirt.",
        zh: "到手即已驯服的亚麻——用火山石洗到像一件穿惯的衬衫那样垂坠。",
        ja: "初日から馴染んだリネン。火山岩で洗い、愛用のシャツのように落ちるように。" },
      material: { en: "100% French flax, stone-washed. Duvet cover + two shams. Deepens in softness with every wash.",
        zh: "100% 法国亚麻，石洗处理。含被套与两只枕套。越洗越软。", ja: "100%フレンチ・フラックス、ストーンウォッシュ。掛け布団カバー＋枕カバー2枚。" }
    },
    {
      id: "candles", name: { en: "Studio Candlesticks", zh: "手作黄铜烛台", ja: "スタジオ・キャンドルホルダー" }, cat: "objects", maker: "miramonti",
      price: 120, rating: 4.8, reviews: 98,
      img: "trio of brushed brass candlesticks in three heights with subtle patina",
      img2: "macro of brushed brass candlestick surface with warm patina",
      colors: [ { l: { en: "Brass", zh: "黄铜", ja: "ブラス" }, h: "#B08A50" } ],
      lede: { en: "Cast and hand-brushed, three quiet heights that gather light the way a table should — whether lit or not.",
        zh: "铸造后手工拉丝，三支不同高度，为桌面收集光线——无论点不点蜡烛。",
        ja: "鋳造後、手作業でブラシ仕上げ。高さの違う3本。" },
      material: { en: "Solid brass, hand-brushed finish. Polish sparingly; patina is part of the piece.",
        zh: "实心黄铜，手工拉丝表面。适度抛光即可，铜绿也是岁月的一部分。",
        ja: "無垢の真鍮、手作業のブラシ仕上げ。磨きすぎは不要。" }
    },
    {
      id: "clock", name: { en: "Meridian Wall Clock", zh: "子午线挂钟", ja: "メリディアン時計" }, cat: "objects", maker: "fjord",
      price: 98, oldPrice: 140, rating: 4.5, reviews: 44,
      img: "minimal analog wall clock with oak face and thin brass hands",
      img2: "detail of oak clock face with brass hands against white plaster wall",
      colors: [ { l: { en: "Oak", zh: "橡木", ja: "オーク" }, h: "#C29B68" }, { l: { en: "Slate", zh: "石板灰", ja: "スレート" }, h: "#6B7076" } ],
      lede: { en: "A thin brass hand crossing an oak face, silent as snowfall. It tells the time; you decide what that's worth.",
        zh: "细黄铜指针走过橡木表盘，安静得像落雪。它只负责报时——时间值什么，由你决定。",
        ja: "細い真鍮の針がオークの文字盤を渡る。雪のように静か。" },
      material: { en: "Oak face, brass hands, silent sweep movement. One AA battery.",
        zh: "橡木表盘，黄铜指针，静音扫秒机芯。一节 AA 电池。", ja: "オーク文字盤、真鍮針、静音スイープ。単三電池一本。" }
    },
    {
      id: "vase", name: { en: "Terracotta Bud Vase", zh: "陶土花瓶", ja: "テラコッタ花瓶" }, cat: "decor", maker: "nord",
      price: 88, rating: 4.8, reviews: 156, isHot: true,
      img: "sculptural terracotta vase holding dried pampas grass on plinth",
      img2: "three small terracotta vases in graduating heights, warm shadow",
      colors: [ { l: { en: "Terracotta", zh: "陶土", ja: "テラコッタ" }, h: "#B0664A" }, { l: { en: "Chalk", zh: "白垩", ja: "チョーク" }, h: "#E3DCCD" } ],
      lede: { en: "Pinched by thumb, fired open-flame — a vessel that flatters three stems or a single dried branch equally.",
        zh: "拇指捏出的器形，明火烧成——三枝鲜花或一枝枯枝，它都同样给面子。",
        ja: "親指で絞り、裸火で焼く。三本の花も、一本の枯れ枝も、同じように映えます。" },
      material: { en: "Open-fired terracotta. Watertight; not food safe.",
        zh: "明火陶土烧成。可盛水；不可盛食。", ja: "裸火焼きのテラコッタ。水は OK、食品は不可。" }
    },
    {
      id: "mirror", name: { en: "Fjord Round Mirror", zh: "峡湾圆镜", ja: "フィヨルド・ラウンドミラー" }, cat: "decor", maker: "fjord",
      price: 260, rating: 4.9, reviews: 87, isNew: true,
      img: "round brass framed wall mirror on warm plaster wall with light",
      img2: "reflection detail in round brass mirror of minimal interior",
      colors: [ { l: { en: "Brass", zh: "黄铜", ja: "ブラス" }, h: "#B08A50" }, { l: { en: "Patinated", zh: "做旧", ja: "経年" }, h: "#8A7A5C" } ],
      lede: { en: "A perfect circle of hand-polished brass holding a room's worth of light. Hangs flush, stays level, ages beautifully.",
        zh: "一整圈手工抛光的黄铜，兜住满屋的光。贴墙悬挂、始终水平、越老越好看。",
        ja: "手磨きの真鍮の正円が、部屋の光を丸ごと受け止めます。" },
      material: { en: "Hand-polished brass frame, low-iron glass. Clean glass only; let the frame live.",
        zh: "手工抛光黄铜框，低铁玻璃。只擦镜面；镜框任它生长。",
        ja: "手磨き真鍮枠、低鉄ガラス。ガラスだけ拭いて。枠は伸ばす。" }
    },
    {
      id: "soap", name: { en: "Olive Grove Soap", zh: "橄榄园手工皂", ja: "オリーブ・グローブ・ソープ" }, cat: "bath", maker: "kaol",
      price: 42, oldPrice: 56, rating: 4.7, reviews: 189, isNew: true,
      img: "three stacked handmade olive oil soap bars with linen wrap",
      img2: "handmade soap bar texture detail with olive leaf on stone",
      colors: [ { l: { en: "Olive", zh: "橄榄绿", ja: "オリーブ" }, h: "#8A8F6A" }, { l: { en: "Milk", zh: "奶白", ja: "ミルク" }, h: "#E7E0CF" } ],
      lede: { en: "Cold-pressed olive soap, cured six weeks, cut like cake. Lathers like a promise kept.",
        zh: "冷压橄榄皂，阴干六周，像切蛋糕一样切块。泡沫细腻，像兑现了的承诺。",
        ja: "コールドプレスのオリーブ石鹸、六週間熟成、ケーキのようにカット。" },
      material: { en: "Saponified olive oil, laurel, sea salt. Keep dry between uses.",
        zh: "橄榄油皂化而成，含月桂与海盐。使用间隙请保持干燥。",
        ja: "オリーブオイルの石鹸化、月桂樹と海塩入り。使わない時は乾かして。" }
    },
    {
      id: "towel", name: { en: "Waffle Bath Towel", zh: "华夫格浴巾", ja: "ワッフル・バスタオル" }, cat: "bath", maker: "emyr",
      price: 64, rating: 4.6, reviews: 73,
      img: "waffle weave cotton towel in sage green folded on wooden bench",
      img2: "close-up of waffle weave towel texture in sage tone",
      colors: [ { l: { en: "Sage", zh: "鼠尾草绿", ja: "セージ" }, h: "#9BA48B" }, { l: { en: "Oat", zh: "燕麦", ja: "オート" }, h: "#D5C8B2" } ],
      lede: { en: "Waffle-woven so it dries you fast, then dries itself faster. The towel that never smells like a towel.",
        zh: "华夫格织法，快速擦干你，然后更快晾干自己。一条永远不会“有毛巾味”的毛巾。",
        ja: "ワッフル織りは素早く拭き、自分も素早く乾く。タオル臭のしないタオル。" },
      material: { en: "Long-staple cotton waffle weave. Machine wash warm; skip the softener.",
        zh: "长绒棉华夫格。温水机洗；别用柔顺剂。", ja: "長繊維コットンのワッフル織り。ぬるま湯で洗濯。柔軟剤は不要。" }
    },
    {
      id: "stool", name: { en: "Ty'n-y-Coed Stool", zh: "林间小凳", ja: "ティン・イ・コイド・スツール" }, cat: "living", maker: "emyr",
      price: 180, rating: 4.8, reviews: 52,
      img: "three-legged oak stool with chamfered seat in minimal interior",
      img2: "detail of oak stool joinery showing hand-cut wedged tenon",
      colors: [ { l: { en: "Oak", zh: "橡木", ja: "オーク" }, h: "#C29B68" }, { l: { en: "Ash", zh: "白蜡木", ja: "アッシュ" }, h: "#D8C9AC" } ],
      lede: { en: "Three legs, one seat, zero screws. Green-oak joinery that tightens as it dries — older means sturdier.",
        zh: "三条腿、一块面板、零颗螺丝。生橡木榫接，越干越紧——越老越稳。",
        ja: "脚3本、座1枚、ねじゼロ。生オークのほぞ組みは乾くほど締まります。" },
      material: { en: "Welsh green oak, wedged through-tenons. Wipe with dry cloth; keep off wet floors.",
        zh: "威尔士生橡木，楔形通榫。干布擦拭；勿置于湿地。", ja: "ウェールズの生オーク、楔締めの通しほぞ。乾布で。" }
    },
    {
      id: "side", name: { en: "Stack Side Table", zh: "叠摞边几", ja: "スタック・サイドテーブル" }, cat: "living", maker: "nord",
      price: 195, rating: 4.7, reviews: 39, isNew: true,
      img: "minimal cylindrical side table in pale wood beside linen sofa",
      img2: "stacked cylindrical side tables showing lamination rings",
      colors: [ { l: { en: "Pale ash", zh: "浅白蜡", ja: "ペイルアッシュ" }, h: "#DCCDB0" }, { l: { en: "Ink", zh: "墨色", ja: "インク" }, h: "#33302B" } ],
      lede: { en: "Turned from laminated rings of ash, each table stacks on its twin to become a shelf, a column, a small monument.",
        zh: "白蜡木层圈旋成，两只叠起来就是置物架、一根柱、一座小小的纪念碑。",
        ja: "アッシュの積層リングから旋盤で削り出し。二つ重ねれば棚に、柱に、小さな記念碑に。" },
      material: { en: "Laminated ash rings, hard-wax oil. Assembly: none, ever.",
        zh: "白蜡木层板，硬蜡油面。安装步骤：永远为零。", ja: "アッシュ積層、硬質ワックスオイル。組み立て：一切不要。" }
    }
  ];

  /* ---------- logistics event labels (i18n keys lg.*) ---------- */
  const LG_ORDER = ["placed", "paid", "dispatch", "export", "line", "import", "local", "done"];

  /* ---------- seeded orders (first visit) ---------- */
  const seedOrders = () => {
    const mk = (no, iso, items, addr, ship, pay, events) => ({ no, iso, items, addr, ship, pay, events, current: events.length - 1 });
    return [
      mk("QL-88231", "2026-08-12", [ { pid: "throw", ci: 0, qty: 1 }, { pid: "carafe", ci: 0, qty: 1 } ], 0, "std", "card", [
        { k: "placed",  iso: "2026-08-12 09:14", loc: { en: "Online", zh: "线上下单", ja: "オンライン" } },
        { k: "paid",    iso: "2026-08-12 09:15", loc: { en: "Payment centre", zh: "支付中心", ja: "決済センター" } },
        { k: "dispatch", iso: "2026-08-13 11:20", loc: { en: "Cardiff, Wales", zh: "威尔士·卡迪夫", ja: "ウェールズ・カーディフ" } },
        { k: "export",  iso: "2026-08-14 22:05", loc: { en: "London gateway", zh: "伦敦口岸", ja: "ロンドン・ゲートウェイ" } },
        { k: "line",    iso: "2026-08-17 06:40", loc: { en: "Line flight KV882", zh: "国际干线 KV882 航班", ja: "国際線 KV882" } },
        { k: "import",  iso: "2026-08-19 14:12", loc: { en: "Shenzhen customs", zh: "深圳海关", ja: "深圳税関" } },
        { k: "local",   iso: "2026-08-20 08:30", loc: { en: "Nanshan hub", zh: "南山转运中心", ja: "南山ハブ" } },
        { k: "done",    iso: "2026-08-20 15:47", loc: { en: "Delivered · signed", zh: "已签收", ja: "配達完了・受領" } }
      ]),
      mk("QL-88457", "2026-08-28", [ { pid: "lamp", ci: 0, qty: 1 }, { pid: "candles", ci: 0, qty: 1 } ], 0, "std", "wallet", [
        { k: "placed",  iso: "2026-08-28 20:41", loc: { en: "Online", zh: "线上下单", ja: "オンライン" } },
        { k: "paid",    iso: "2026-08-28 20:42", loc: { en: "Payment centre", zh: "支付中心", ja: "決済センター" } },
        { k: "dispatch", iso: "2026-08-30 09:55", loc: { en: "Copenhagen, DK", zh: "丹麦·哥本哈根", ja: "コペンハーゲン" } },
        { k: "export",  iso: "2026-09-01 03:18", loc: { en: "Billund gateway", zh: "比隆口岸", ja: "ビルン・ゲートウェイ" } },
        { k: "line",    iso: "2026-09-03 11:26", loc: { en: "Line flight SK297", zh: "国际干线 SK297 航班", ja: "国際線 SK297" } },
        { k: "import",  iso: "2026-09-05 07:02", loc: { en: "Shenzhen customs", zh: "深圳海关", ja: "深圳税関" } }
      ]),
      mk("QL-88602", "2026-09-02", [ { pid: "espresso", ci: 0, qty: 1 } ], 1, "exp", "card", [
        { k: "placed",  iso: "2026-09-02 12:33", loc: { en: "Online", zh: "线上下单", ja: "オンライン" } },
        { k: "paid",    iso: "2026-09-02 12:34", loc: { en: "Payment centre", zh: "支付中心", ja: "決済センター" } }
      ])
    ];
  };

  /* ---------- seeded addresses ---------- */
  const seedAddrs = () => [
    {
      id: "a1", name: "Alex Chen", phone: "+86 138 0000 8888", country: "CN",
      region: { en: "Guangdong", zh: "广东省", ja: "広東省" }, city: { en: "Shenzhen", zh: "深圳市", ja: "深圳市" },
      street: { en: "12-3A, Bay Garden, 88 Houhai Ave, Nanshan", zh: "南山区后海大道 88 号湾景花园 12-3A", ja: "南山區後海大道88号 湾景花園 12-3A" },
      zip: "518052", def: true
    },
    {
      id: "a2", name: "Alex Chen (Studio)", phone: "+86 138 0000 8888", country: "CN",
      region: { en: "Guangdong", zh: "广东省", ja: "広東省" }, city: { en: "Shenzhen", zh: "深圳市", ja: "深圳市" },
      street: { en: "2F, Maker Building, 6 Keji South Rd, Nanshan", zh: "南山区科技南路 6 号创客大厦 2F", ja: "南山区科技南路6号 メーカービル 2F" },
      zip: "518057", def: false
    }
  ];

  /* ---------- journal essays ---------- */
  const ARTICLES = [
    {
      id: "j1", min: 4, img: "warm ceramic table lamp glowing on bedside table at dusk, editorial interior photograph",
      k: { en: "On light", zh: "关于光", ja: "光について" },
      t: { en: "Slow Light", zh: "慢下来的光", ja: "遅い光" },
      de: { en: "Why we keep making lamps that refuse to be bright.", zh: "为什么我们坚持做“不够亮”的灯。", ja: "なぜ「明るすぎない」ランプを作り続けるのか。" },
      body: {
        en: ["Bright light is for warehouses. A home needs the kind of light that lets your eyes rest — low, warm, patient. Every lamp in our lighting edit is dimmed by intention, not by shortage.",
          "Atelier Nord fires each ceramic base twice: once for strength, once for the colour of evening. When you unbox it, you are holding a small argument against glare.",
          "Try one bulb, one corner, one evening. You will find the rest of the room follows."],
        zh: ["刺眼的亮光是仓库才需要的。家需要的是让眼睛休息的光——低沉、温暖、有耐心。我们灯具精选里的每一盏，都是有意调暗的，不是能力不足。",
          "Atelier Nord 的每只陶灯座都要烧两次：一次为了坚固，一次为了烧出傍晚的颜色。开箱时，你捧着的是一份反对眩光的小小声明。",
          "试着一盏灯、一个角落、一个夜晚。你会发现房间的其余部分会自己跟上来。"],
        ja: ["まぶしい光は倉庫のもの。家に必要なのは、目を休ませる光——低く、あたたかく、辛抱強い。私たちの照明は、意図して暗さを残しています。",
          "Atelier Nord の陶器の台は二度焼かれます。一度は強度のため、もう一度は「夕暮れの色」のため。開梱するとき、あなたは眩光への小さな反対意見を抱いています。",
          "一つの電球、一つの隅、一晩。部屋の残りの部分は、自然についてきます。"]
      }
    },
    {
      id: "j2", min: 6, img: "undyed cashmere throw draped over armchair near window, soft morning light, editorial photograph",
      k: { en: "On textiles", zh: "关于织物", ja: "織物について" },
      t: { en: "The Weight of a Good Throw", zh: "一条好盖毯的重量", ja: "良いスローの重さ" },
      de: { en: "Comfort is a physical property. We measured it.", zh: "舒适是一种物理属性。我们测量过它。", ja: "心地よさは物理量である。私たちは測った。" },
      body: {
        en: ["A throw should have enough weight to mean something. Our mill in Mongolia spins undyed cashmere at a gram weight that politely pins your shoulders to the chair.",
          "We leave the fibre the colour of the goat. Bleaching weakens; dyeing shouts. What remains is a beige that behaves like silence.",
          "Six years from now it will be softer, slightly smaller, and entirely yours. That is the plan."],
        zh: ["一条盖毯应该有足够的分量，才有意义。蒙古的纱厂把未染色的羊绒纺到某个克重——恰好能礼貌地把你的肩膀按在椅子上。",
          "我们让纤维保持山羊原本的颜色。漂白使它脆弱，染色让它喧哗。留下来的，是一种表现得像沉默一样的米色。",
          "六年之后，它会更软、略小，并且完全属于你。这就是计划本身。"],
        ja: ["スローには、意味のある重さが必要です。モンゴルの紡績工場は、無染色のカシミヤを「肩を椅子に優しく押さえる」重さに紡ぎます。",
          "繊維はヤギ本来の色のまま。漂白は弱く、染色は騒がしい。残るのは、沈黙のように振る舞うベージュです。",
          "六年後、より柔らかく、やや小さくなり、完全にあなたのものになっているでしょう。それが計画です。"]
      }
    },
    {
      id: "j3", min: 5, img: "handmade ceramic plates and brass candlesticks set for dinner party, candlelight, editorial photograph",
      k: { en: "On tables", zh: "关于餐桌", ja: "食卓について" },
      t: { en: "Table Objects, Table Manners", zh: "餐桌器物与餐桌礼节", ja: "食卓の器と、食卓の作法" },
      de: { en: "The objects you set the table with set the evening.", zh: "你用什么摆桌，就会得到怎样的夜晚。", ja: "何で食卓を整えるかで、夜の質が決まる。" },
      body: {
        en: ["A dinner party is a sculpture you can eat. Start with plates that remember hands, candlesticks that forgive drafts, and a carafe that makes water an occasion.",
          "Terra Bruta's wood-fired glaze means the spaghetti sauce plate looks different from the salad plate, which looks different from the one your guest drops. This is a feature.",
          "Set the table early. Let it sit there all afternoon, being beautiful, while you cook."],
        zh: ["一场家宴是一件可以吃的雕塑。从记得手的餐盘开始，从原谅穿堂风的烛台开始，从让白开水变成仪式的水瓶开始。",
          "Terra Bruta 的柴烧釉面意味着装意面酱的盘子和装沙拉的盘子长得不一样，也和客人失手打碎的那只不一样。这是特性，不是缺陷。",
          "早点摆桌。让它整个下午就那样待着，很好看，而你只管做饭。"],
        ja: ["ホームパーティーは、食べられる彫刻です。手の記憶を残す皿、すきま風を許す燭台、水を特別にするカラフェから始めてください。",
          "Terra Bruta の登り窯の釉薬は、パスタの皿とサラダの皿が違う顔をすることを意味します。落ちた一枚とも違う。これは特性です。",
          "食卓は早く整える。午後いっぱい、そこに美しく在らせて、あなたは料理だけをする。"]
      }
    },
    {
      id: "j4", min: 7, img: "cargo plane over clouds at dawn, cinematic editorial photograph, muted tones",
      k: { en: "On crossing borders", zh: "关于跨境", ja: "国境を越えることについて" },
      t: { en: "Crossing Borders, Quietly", zh: "安静地跨越国境", ja: "静かに国境を越える" },
      de: { en: "Inside our simulated duty-included pipeline.", zh: "走进我们的“含税到手”模拟链路。", ja: "関税込みパイプライン（シミュレーション）の中へ。" },
      body: {
        en: ["The most stressful moment of cross-border shopping should be choosing. Not the customs invoice. Not the surprise fee at the door. Choosing.",
          "Our pipeline is simulated, but the logic is real: price once, duty settled at source, insurance along every leg. When you press play on an order's timeline, you watch exactly the journey we intend to build.",
          "Warehouse to gateway to line flight to your district. Twelve countries, one price, zero surprises. That is the quiet contract."],
        zh: ["跨境购物最紧张的时刻，应该是挑选。而不是海关账单，也不是门口的意外收费。就只是挑选。",
          "我们的链路目前是模拟的，但逻辑是真的：一次定价、源头结税、全程投保。当你在订单时间轴上按下播放，看到的正是我们打算真正建成的那条旅程。",
          "仓库到口岸，干线航班到你的街区。十二个国家，一个价格，零意外。这就是安静的约定。"],
        ja: ["越境ショッピングで一番緊張すべきは、「選ぶこと」です。関税の請求書でも、玄関前の追加請求でもなく。",
          "このパイプラインはシミュレーションですが、論理は本物です。一度の値札、関税は源泉で決済、全工程に保険。注文のタイムラインで再生ボタンを押すと、私たちが本当に作る予定の旅が見えます。",
          "倉庫からゲートウェイへ、幹線フライトからあなたの街へ。12か国、一つの価格、驚きゼロ。それが静かな契約です。"]
      }
    }
  ];

  /* ---------- FAQ ---------- */
  const FAQ = [
    { q: "faq.q1", a: "faq.a1" },
    { q: "faq.q2", a: "faq.a2" },
    { q: "faq.q3", a: "faq.a3" },
    { q: "faq.q4", a: "faq.a4" }
  ];

  /* ---------- expose ---------- */
  const byId = (id) => CATALOG.find((p) => p.id === id);
  const makerById = (id) => MAKERS.find((m) => m.id === id);
  const catById = (id) => CATS.find((c) => c.id === id);

  window.QUELL_DATA = { CATS, MAKERS, CATALOG, ARTICLES, FAQ, LG_ORDER, RATES, byId, makerById, catById, pick, seedOrders, seedAddrs };
})();
