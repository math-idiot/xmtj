const 設定 = window.活動頁設定 || {};

const 類別 = 設定.根類 || "活動";

const 活動根 = (window.類基底[類別] || window.素材基底) + 類別 + "/";

const 素材根 = window.素材基底;

const 系統根 = 素材根 + "系統/";

const 目錄 = 設定.目錄 || [];

const 預設 = 設定.預設 !== undefined ? 設定.預設 : 目錄[0];

const 類型名 = 深 => (設定.類型預設 || (d => d > 1 ? "子活動" : "主題活動"))(深);

const 快取 = new Map;

async function 讀(路) {
 if (快取.has(路)) return 快取.get(路);
 const p = _讀(路).then((d => d || {
  "_讀不到": "讀不到",
  "_路": 路
 }));
 快取.set(路, p);
 return p;
}

const 活徑 = seg => (活動根 + seg.map(encodeURIComponent).join("/")).replace(/\/+$/, "");

const 有圖 = 路 => new Promise((ok => {
 const i = new Image;
 i.onload = () => ok(true);
 i.onerror = () => ok(false);
 i.src = 路;
}));

const 空 = t => `<p class="note">${esc(t)}</p>`;

const 真 = v => v == null || v === "" || v === "沒有" || v === "無" ? null : v;

const 粗 = s => esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

const 勾 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"/></svg>';

const 槓 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>';

async function 資源板(名單, 活動名) {
 if (!名單 || !名單.length) return "";
 const 鍵 = "所屬" + 類別;
 return 引用排(名單.map((n => ({
  "類": "資源",
  "名": n,
  [鍵]: 活動名
 }))), "活動資源");
}

async function 招募板(名單, 活動名) {
 if (!名單 || !名單.length) return "";
 const 鍵 = "所屬" + 類別;
 return 引用排(名單.map((n => ({
  "類": "招募",
  "名": n,
  [鍵]: 活動名
 }))), "限定招募");
}

function 機制板(m, 本層) {
 if (!m) return "";
 const 別名 = {
  "儲值禮包": "禮包名"
 };
 const 項 = Object.keys(m).filter((k => k.startsWith("有"))).map((k => {
  const 機 = k.slice(1);
  const 名鍵 = m[機 + "名"] !== undefined ? 機 + "名" : 別名[機];
  return [ 機, 名鍵 ? m[名鍵] : null, !!m[k] ];
 }));
 const 畫 = 項.map((([機, 名, 有]) => {
  const on = 本層 ? 有 && 名 === 本層 : 有;
  return `<div class="m ${on ? "on" : "off"}">${on ? 勾 : 槓}<span>${esc(機)}</span>${on && 名 ? `<span class="nm">${esc(名)}</span>` : ""}</div>`;
 })).join("");
 return 畫 ? `<h3 class="grp">這個活動有哪些機制</h3><div class="mech">${畫}</div>` : "";
}

function 說明板(x) {
 const 列 = [ [ "這是什麼", x.這是什麼 ], [ "說明", x.說明 ], [ "活動說明", x.活動說明 ], [ "功能說明", x.功能說明 ], [ "遊戲說明", x.遊戲說明 ] ].filter((([, v]) => 真(v)));
 return `<h3 class="grp">說明</h3>` + (列.length ? `<div class="rows">${列.map((([k, v]) => kv(k, String(v)))).join("")}</div>` : 空("沒有說明"));
}

function 數值板(x) {
 const 列 = [ [ "等級", x.等級 != null ? x.等級 + " 級" : null ], [ "定位", x.定位 ], [ "推薦戰力", x.推薦戰力 != null ? x.推薦戰力.toLocaleString("zh-TW") : null ], [ "家族積分", x.家族積分 ], [ "關卡數", x.關卡數 ], [ "每關獎勵次數", x.每關獎勵次數 ], [ "每週獎勵次數", x.每週獎勵次數 ] ].filter((([, v]) => v != null && v !== ""));
 return `<h3 class="grp">數值</h3>` + (列.length ? `<div class="rows">${列.map((([k, v]) => kv(k, String(v)))).join("")}</div>` : 空("沒有數值"));
}

async function 獎勵板(x) {
 const 畫 = async (列, 標) => {
  const a = (列 || []).filter((o => o && o.素材路徑));
  const 缺 = (列 || []).filter((o => o && !o.素材路徑));
  if (!a.length && !缺.length) return "";
  const h = await Promise.all(a.map((o => {
   const i = o.素材路徑.indexOf("/");
   return 引用塊({
    "類": o.素材路徑.slice(0, i),
    "名": o.素材路徑.slice(i + 1),
    "量": o.數量 > 1 ? o.數量 : null
   });
  })));
  return `<h3 class="grp">${esc(標)}</h3><div class="objs fam">${h.join("")}${缺.map((o => `<span class="obj miss" title="這個獎勵碼還沒解開">\n        <span class="rfi bare"><span class="ab">?</span></span>\n        <b>${esc(o.原碼)}</b><i>尚未建檔</i></span>`)).join("")}</div>`;
 };
 let h = await 畫(x.首通獎勵, "首通一次") + await 畫(x.獎勵, "每次都給");
 const 關 = await 讀(window.素材基底 + "_關聯/依活動/" + encodeURIComponent(String(x.名稱 || "").replace(/\//g, "／")) + ".json").catch((() => null));
 if (關 && (關.給 || []).length) {
  const g = new Map;
  for (const r of 關.給) {
   const k = r.grade ? "第 " + r.grade + " 階" : "獎勵";
   if (!g.has(k)) g.set(k, []);
   g.get(k).push(r);
  }
  for (const [k, rs] of g) {
   const 卡 = await Promise.all(rs.map((r => 引用塊({
    "類": r.t.類,
    "名": r.t.名,
    "量": r.量 > 1 ? r.量 : null,
    "附註": r.機率 ? "機率 " + Math.round(r.機率 * 1e3) / 10 + "%" : null
   }))));
   h += `<h3 class="grp">${esc(k)}${關.方式 ? " <small>" + esc(關.方式) + "</small>" : ""}</h3><div class="objs fam">${卡.join("")}</div>`;
  }
 }
 return h || `<h3 class="grp">獎勵</h3>` + 空("沒有獎勵");
}

async function 商品板(x) {
 const v = x.商品;
 if (typeof v === "string" && 真(v)) return `<h3 class="grp">商品</h3>` + 空(v);
 const a = Array.isArray(v) ? v.filter((o => o && o.商品 && o.商品.素材路徑)) : [];
 const 缺 = Array.isArray(v) ? v.filter((o => o && (!o.商品 || !o.商品.素材路徑))) : [];
 if (!a.length && !缺.length) return `<h3 class="grp">商品</h3>` + 空("沒有商品");
 const h = await Promise.all(a.map((o => {
  const p = o.商品.素材路徑, i = p.indexOf("/");
  const 價 = o.價格 && o.價格.名稱 ? o.價格.名稱 + " " + Number(o.價格.數量 || 0).toLocaleString("zh-TW") : o.底價 != null ? "底價 " + o.底價 : null;
  return 引用塊({
   "類": p.slice(0, i),
   "名": p.slice(i + 1),
   "量": o.商品.數量 > 1 ? o.商品.數量 : null,
   "附註": 價
  });
 })));
 return `<h3 class="grp">商品</h3><div class="objs fam">${h.join("")}${缺.map((o => `<span class="obj miss" title="這個商品碼還沒解開">\n      <span class="rfi bare"><span class="ab">?</span></span>\n      <b>${esc((o.商品 || {}).原碼 || o.編號)}</b><i>尚未建檔</i></span>`)).join("")}</div>`;
}

function 依據板(x) {
 const d = [ [ "綁定角色", x.綁定角色依據 ], [ "機制指標", (x.機制 || {}).依據 ], [ "排行榜", (x.排行榜 || {}).怎麼填 ] ].filter((([, v]) => v));
 if (!d.length) return "";
 return `<h3 class="grp">判定依據</h3><ul class="sup">${d.map((([k, v]) => `<li>${粗(v)}<span class="ev">${esc(k)}</span></li>`)).join("")}</ul>`;
}

function 規則板(R) {
 if (!R) return 空("這一層沒有自己的規則說明。");
 if (R._讀不到) return `<div class="bad">規則原文讀不到。<br><code>${esc(R._路)}</code><br><br>\n    規則要放在<b>活動自己的夾</b>裡(<code>活動/&lt;活動名&gt;/規則/&lt;規則鍵&gt;.json</code>),\n    不從別處抓。</div>`;
 const 段 = R.段落 || [];
 let 大 = "", h = "", 標 = [];
 段.forEach((s => {
  const t = s.文字 || "";
  if (s.層級 === "onetitle") 大 += `<h2>${rich(t)}</h2>`; else if (s.層級 === "twotitle") {
   標.push(t);
   h += `<h3 id="g${標.length}">${rich(t)}</h3>`;
  } else h += `<p class="${/^（\d+）/.test(t) ? "ind" : ""}">${rich(t)}</p>`;
 }));
 const toc = 標.length > 1 ? `<div class="toc">${標.map(((t, i) => `<a href="javascript:void 0" data-go="g${i + 1}">${esc(t)}</a>`)).join("")}</div>` : "";
 return `<div class="rule">${大}</div>` + toc + `<div class="rule">${h}</div>`;
}

async function 系列板(頂, 路徑) {
 const 子 = 頂 && 頂.子活動 || [];
 if (!子.length) return "";
 const 這 = 路徑.length > 1 ? 路徑[路徑.length - 1] : null;
 const 父 = 路徑.length > 1 ? 路徑.slice(0, 1) : 路徑;
 const 卡 = await Promise.all(子.map((async s => {
  if (s.引用) {
   const 路 = String((s.引用 || {}).素材路徑 || "").replace(/^素材\//, "");
   const i = 路.indexOf("/");
   if (i > 0) return await 引用塊({
    "類": 路.slice(0, i),
    "名": 路.slice(i + 1),
    "顯名": false
   });
   return `<span class="sub ref" title="${esc(s.名稱)}">\n        <span class="ic"><span class="ab">${esc(s.名稱)}</span></span><i>${esc(s.類型 || "")}</i></span>`;
  }
  const h = await 引用塊({
   "類": 類別,
   "名": [ ...父, s.名稱 ].join("/"),
   "顯名": false
  });
  return s.名稱 === 這 ? h.replace('class="obj', 'class="obj here') : h;
 })));
 return `<div class="objs fam">${卡.join("")}</div>`;
}

const 本頁 = 路徑 => typeof _靜態 === "function" && _靜態() && 路徑.length ? 靜態路(類別, 路徑.join("/")) : "#/" + encodeURIComponent(類別) + "/" + 路徑.map(encodeURIComponent).join("/");

let KW = "";

function 挑() {
 const k = KW.trim();
 const 全 = (設定.根名 ? [ 設定.根名 ] : []).concat(目錄);
 const hit = k ? 全.filter((n => n.includes(k))).slice(0, 40) : [];
 return `<span class="jump"><input id="kw" placeholder="找別的${esc(類別)}…" autocomplete="off" value="${esc(KW)}">\n    ${k ? `<ul>${hit.map((n => `<li><a href="${本頁(n === 設定.根名 ? [] : [ n ])}">${esc(n)}</a></li>`)).join("") || "<li><a>沒有符合的</a></li>"}</ul>` : ""}</span>`;
}

async function 分頁(x, 路徑, 基) {
 const 規 = 真(x.規則鍵) ? await 讀(活徑([ 路徑[0] ]) + "/規則/" + encodeURIComponent(x.規則鍵) + ".json") : null;
 const 頂 = 路徑.length > 1 ? await 讀(活徑([ 路徑[0] ]) + "/資訊.json") : x;
 const 本層 = 路徑.length > 1 ? x.名稱 || 路徑[路徑.length - 1] : null;
 const 綁 = [];
 const 角 = 真(x.綁定角色) || 頂 && 真(頂.綁定角色);
 const 圖 = 真(x.綁定地圖) || 頂 && 真(頂.綁定地圖);
 if (角) 綁.push({
  "類": "夥伴",
  "名": 角,
  "顯類型": false,
  "附註": "綁定角色"
 });
 if (圖) 綁.push({
  "類": "地圖",
  "名": 圖,
  "所屬活動": 路徑[0],
  "顯類型": false,
  "附註": "綁定地圖"
 });
 if (路徑.length > 1) 綁.push({
  "類": 類別,
  "名": 路徑.slice(0, -1).join("/"),
  "顯類型": false,
  "附註": 設定.上層附註 || "所屬活動"
 });
 const 資訊 = rows([ [ "名稱", () => x.名稱 ], [ "類型", () => x.類型 || 類型名(路徑.length) ], [ "檔期", () => 真(x.檔期) ], [ "規則鍵", () => 真(x.規則鍵) ], [ "解鎖條件", () => 真(x.解鎖條件) ], [ "開放時間", () => 真(x.開放時間) ] ], x) + 說明板(x) + (await 引用排(綁, "綁定") || `<h3 class="grp">綁定</h3>` + 空("沒有綁定")) + (await 資源板(頂 && 頂.活動資源 || x.活動資源, 路徑[0]) || `<h3 class="grp">活動資源</h3>` + 空("沒有活動資源")) + (await 招募板(頂 && 頂.限定招募 || x.限定招募, 路徑[0]) || "") + (機制板(頂 && 頂.機制 || x.機制, 本層) || `<h3 class="grp">這個活動有哪些機制</h3>` + 空("沒有記到機制")) + 數值板(x) + await 獎勵板(x) + await 商品板(x);
 const 頂層 = 路徑.length === 1;
 const 其他 = rows([ ...頂層 ? [ [ "別名", () => (x.別名 || []).length ? (x.別名 || []).join("、") : null ] ] : [] ], x) + 依據板(x) + (x._發佈範圍 ? `<h3 class="grp">這一頁只發佈「每一檔活動都有」的欄位</h3>\n      <ul class="bul">${(x._發佈範圍["上網頁(每一檔活動都有)"] || []).map((s => `<li>${粗(s)}</li>`)).join("")}</ul>\n      <h3 class="grp">以下只在素材裡留著,不上網頁</h3>\n      <ul class="bul">${(x._發佈範圍["只記錄不上網頁(舊活動拿不到)"] || []).map((s => `<li>${粗(s)}</li>`)).join("")}</ul>\n      <p class="note long">${粗(x._發佈範圍.為什麼 || "")}</p>` : "");
 const 系 = await 系列板(頂, 路徑);
 const 加 = 設定.加分頁 ? await 設定.加分頁(x, 路徑, 基) : [];
 return [ [ "資訊", 資訊 + (設定.資訊附加 ? await 設定.資訊附加(x, 路徑, 基) : "") ], [ "規則原文", 規則板(規) || 空("沒有規則原文") ], [ "系列活動", 系 || 空("沒有系列活動") ], ...加, [ "其他", 其他 ] ];
}

async function render(路徑) {
 const 基 = 活徑(路徑);
 const x = await 讀(基 + "/資訊.json");
 const app = document.getElementById("app");
 if (x._讀不到 && !路徑.length && !設定.根名) {
  const 卡 = await Promise.all(目錄.map((n => 引用塊({
   "類": 類別,
   "名": n
  }))));
  app.innerHTML = `<div class="bar">${麵包(類別)}${挑()}<button class="btn" id="th">深淺色</button></div>\n      <h1 class="title" style="margin:0 0 var(--sp3)">${esc(類別)}</h1>\n      <p class="note" style="margin:0 0 var(--sp4)">共 ${目錄.length} 筆 · 點一個看詳情</p>\n      <div class="objs set">${卡.join("")}</div>`;
  document.title = 類別 + " · 巡夢圖鑑";
  return;
 }
 if (x._讀不到) {
  app.innerHTML = `<div class="bar">${麵包(類別)}\n      <span class="sp"></span><button class="btn" id="th">深淺色</button></div>\n      <h1 class="title">讀不到資料</h1>\n      <div class="bad" style="margin-top:var(--sp4)">\n        找不到 <code>${esc(x._路)}</code><br><br>\n        1. <b>直接用檔案開啟(file://)</b> —— 瀏覽器不准這樣讀 json,\n           請用本機伺服器開這一頁<br>\n        2. <b>素材/${esc(類別)}/ 裡沒有這一筆</b> —— 這張讀的是 <code>${esc(活動根)}</code>。\n      </div>`;
  return;
 }
 const 頁 = await 分頁(x, 路徑, 基);
 const 名 = x.名稱 || 路徑[路徑.length - 1] || 設定.根名 || 類別;
 const 挑張 = async (b, ...候) => {
  for (const f of 候) if (await 有圖(b + "/" + f)) return f;
  return null;
 };
 const 挑檔 = (...候) => 挑張(基, ...候);
 const [本層橫, 字, 入0] = await Promise.all([ 挑檔("主圖.png", "主圖.jpg"), 挑檔("文字_橫幅.png", "文字.png"), 有圖(基 + "/入口圖.png") ]);
 const 入 = 路徑.length > 1 ? false : 入0;
 let 橫 = 本層橫, 橫基 = 基, 自己的主圖 = !!本層橫;
 if (!橫) {
  for (let n = 路徑.length - 1; n >= 0; n--) {
   const b = 活徑(路徑.slice(0, n));
   const f = await 挑張(b, "主圖.png", "主圖.jpg");
   if (f) {
    橫 = f;
    橫基 = b;
    break;
   }
  }
 }
 const 屑 = 麵包(類別, 路徑.map(((n, i) => [ i === 路徑.length - 1 ? 名 : n, 本頁(路徑.slice(0, i + 1)) ])));
 app.innerHTML = `\n  <div class="bar">${屑}${挑()}\n    <button class="btn" id="th">深淺色</button></div>\n  <div class="ahero${橫 ? "" : " ph"}">\n    ${橫 ? `<img class="bn" src="${橫基}/${橫}" alt="${esc(名)} 主圖">` : ""}\n    ${橫 && 字 && !(自己的主圖 && x.主圖已含標題) ? `<span class="vn"></span><span class="tx"><img src="${基}/${字}" alt="${esc(名)}"></span>` : ""}\n    ${橫 ? "" : `<span class="phtx">${字 ? `<img src="${基}/${字}" alt="${esc(名)}">` : `<b>${esc(名)}</b><i>還沒有主圖</i>`}</span>`}\n  </div>\n  <div class="ahd">\n    <div class="l">\n      <h1 class="title">${esc(名)}</h1>\n      <p class="kind">${esc([ x.類型 || 類型名(路徑.length), 真(x.檔期) ? "檔期 " + x.檔期 : null, 真(x.綁定角色) ].filter(Boolean).join(" · "))}</p>\n    </div>\n    ${入 ? `<span class="entry"><img src="${基}/入口圖.png" alt=""><b>入口圖</b></span>` : ""}\n  </div>\n  <div class="tabwrap"><div class="tabs" role="tablist">${頁.map(((t, i) => `<button class="tab" role="tab" aria-selected="${i === 選中頁籤}" data-tab="${i}">${esc(t[0])}</button>`)).join("")}</div></div>\n  ${頁.map(((t, i) => `<div class="panel"${i === 選中頁籤 ? "" : " hidden"}>${t[1]}</div>`)).join("")}`;
}

let draw = function() {
 let h = location.hash || "";
 try {
  h = decodeURIComponent(h);
 } catch (e) {}
 if (new RegExp("^#/" + 類別 + "/?$").test(h)) return render([]);
 const m = h.match(new RegExp("^#/" + 類別 + "/(.+)$"));
 if (!m && typeof 預載 !== "undefined" && 預載) return render(預載.清單模式 ? [] : String(預載.名 || "").split("/").filter(Boolean));
 return render(m ? m[1].split("/").filter(Boolean) : 預設 ? [ 預設 ] : []);
};

function 捲到(id) {
 const n = document.getElementById(id);
 if (!n) return;
 n.scrollIntoView({
  block: "start",
  behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth"
 });
}

addEventListener("hashchange", (() => {
 KW = "";
 選中頁籤 = 0;
 draw();
 scrollTo(0, 0);
}));

window._延頁 = window._延頁 || [];

const _原draw = draw;

draw = function() {
 const r = _原draw.apply(this, arguments);
 Promise.resolve(r).then((() => typeof _錄完 === "function" && _錄完()));
 return r;
};

document.addEventListener("click", (e => {
 const g = e.target.closest("[data-go]");
 const t = e.target.closest("[data-tab]");
 if (t) {
  e.preventDefault();
  切(+t.dataset.tab, !g);
  if (g) requestAnimationFrame((() => 捲到(g.dataset.go)));
  return;
 }
 if (g) {
  e.preventDefault();
  捲到(g.dataset.go);
  return;
 }
 if (e.target.id === "th") {
  切色();
  draw();
 }
}));

document.addEventListener("input", (e => {
 if (e.target.id === "kw") {
  KW = e.target.value;
  const p = e.target.selectionStart;
  const j = document.querySelector(".jump");
  if (j) j.outerHTML = 挑();
  const n = document.getElementById("kw");
  if (n) {
   n.focus();
   n.setSelectionRange(p, p);
  }
 }
}));

draw();