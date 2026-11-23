window.素材基底 = window.素材基底 || "../../素材/";

const esc = s => String(s ?? "").replace(/[&<>"]/g, (c => ({
 "&": "&amp;",
 "<": "&lt;",
 ">": "&gt;",
 '"': "&quot;"
}[c])));

const rich = s => esc(s).replace(/&lt;color=#[0-9a-fA-F]{3,8}&gt;([\s\S]*?)&lt;\/color&gt;/g, '<span class="hl">$1</span>');

const has = v => !(v === null || v === undefined || v === "" || Array.isArray(v) && !v.length || typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);

const NIL = "—";

const QN = {
 1: "白",
 2: "綠",
 3: "藍",
 4: "紫",
 5: "橙",
 6: "紅",
 7: "幸運"
};

const 稀階 = {
 "白": 1,
 "綠": 2,
 "藍": 3,
 "紫": 4,
 "橙": 5,
 "紅": 6,
 "幸運": 7,
 N: 2,
 R: 3,
 SR: 4,
 SSR: 5,
 UR: 6,
 SP: 7
};

const 稀序 = o => {
 const q = o && (o.品質 ?? o.稀有度 ?? o.質);
 return typeof q === "number" ? q : 稀階[q] ?? 99;
};

const _稀字 = {
 "白": "N",
 "綠": "N",
 "綠色": "N",
 "藍": "R",
 "青": "R",
 "紫": "SR",
 "橙": "SSR",
 "金橙": "SSR",
 "紅": "UR",
 "金": "UR",
 "彩": "UR"
};

function 稀有字(色) {
 return _稀字[色] || 色 || "";
}

const 稀排 = 清單 => (清單 || []).map(((o, i) => [ o, i ])).sort(((a, b) => 稀序(a[0]) - 稀序(b[0]) || (+a[0].星 || 0) - (+b[0].星 || 0) || (+a[0].等級 || 0) - (+b[0].等級 || 0) || a[1] - b[1])).map((p => p[0]));

const 基底 = () => window.素材基底;

window.版本 = window.版本 || document.currentScript && (String(document.currentScript.src).match(/[?&]v=(\d+)/) || [])[1] || "";

const 帶版 = u => window.版本 && !/[?&]v=/.test(u) ? u + (u.includes("?") ? "&" : "?") + "v=" + window.版本 : u;

const 預載 = window.預載 || null;

const 錄 = (() => {
 try {
  const q = new URLSearchParams(location.search);
  if (q.get("錄") !== "1") return null;
  return {
   "讀": {},
   "全索引": {},
   "協議": {},
   "引用": {},
   "零件": {},
   "不上": new Set((q.get("不上") || "").split(",").filter(Boolean))
  };
 } catch (e) {
  return null;
 }
})();

const 靜態路 = (類, 名) => encodeURIComponent(String(名).replace(/\//g, "／")) + ".html";

const _靜態 = () => !!(預載 || 錄);

const 品質框 = q => {
 const n = typeof q === "number" ? QN[q] : q;
 if (!n) return null;
 const m = {
  "白": "01_白",
  "綠": "02_綠",
  "藍": "03_藍",
  "紫": "04_紫",
  "橙": "05_橙",
  "紅": "06_紅",
  "幸運": "07_幸運"
 }[n];
 return m ? 基底() + "介面/品質框/品質框_" + m + ".png" : null;
};

const 查引 = (類, 名) => (window.引用表 || {})[類 + "|" + 名] || (window.引用表 || {})[名] || null;

function 引用(目標, o) {
 o = o || {};
 const e = typeof 目標 === "string" ? 查引(o.類 || "", 目標) : 目標;
 const 名 = e && e.名 || o.名 || (typeof 目標 === "string" ? 目標 : "?");
 if (!e) {
  return `<span class="obj miss" title="素材裡還沒有這一筆">\n      <span class="rfi bare"><span class="ab">?</span></span>\n      <b>${esc(名)}</b><i>尚未建檔</i></span>`;
 }
 const 顯 = Object.assign({}, e.顯 || {}, o.顯 || {});
 const 框 = 顯.品質框 !== false ? 品質框(e.質) : null;
 const 圖 = e.圖 ? 基底() + e.路 + "/" + e.圖 : null;
 const 量 = o.數量 !== undefined && o.數量 !== null && 顯.數量 !== false ? o.數量 : null;
 const 附 = [ o.附註, 顯.等級 && e.級 != null ? e.級 + " 級" : null ].filter(Boolean).join(" · ");
 const 內 = `<span class="rfi${框 ? "" : " bare"}${o.小 ? " sml" : ""}"${框 ? ` style="background-image:url('${框}')"` : ""}>${圖 ? `<img src="${圖}" alt="" loading="lazy">` : `<span class="ab">${esc(String(名).slice(0, 3))}</span>`}</span>` + (量 != null ? `<u>${esc(量)}</u>` : "") + (顯.名稱 !== false ? `<b>${esc(名)}</b>` : "") + (附 ? `<i>${esc(附)}</i>` : "");
 const cls = "obj" + (o.這件 ? " here" : "") + (o.負 ? " minus" : "");
 if (o.連結 !== false && e.連 && e.連.檔) {
  const h = e.連.錨 ? e.連.檔 + e.連.錨 : e.連.檔 + "#/" + encodeURIComponent(e.連.類) + "/" + encodeURIComponent(e.連.名);
  return `<a class="${cls}" href="${h}" title="${esc(名)}">${內}</a>`;
 }
 return `<span class="${cls}" title="${esc(名)}">${內}</span>`;
}

const 引用群 = (arr, o) => `<div class="objs">${(arr || []).map((x => 引用(x.目標 ?? x, Object.assign({}, o, x.選項 || x)))).join("")}</div>`;

const kv = (k, v) => `<div class="row"><dt>${esc(k)}</dt><dd>${v ?? NIL}</dd></div>`;

function rows(defs, x) {
 return `<div class="rows">${defs.map((([k, fn]) => {
  let v;
  try {
   v = fn(x);
  } catch (e) {
   v = null;
  }
  if (!has(v)) return kv(k, `<span class="dim">${NIL}</span>`);
  if (v && typeof v === "object" && typeof v.html === "string") return kv(k, v.html);
  if (typeof v === "object" && !Array.isArray(v)) v = Object.entries(v).map((([a, b]) => a + ":" + b)).join("、"); else if (Array.isArray(v)) v = v.map((o => typeof o === "object" ? JSON.stringify(o) : o)).join("、");
  return kv(k, typeof v === "string" ? rich(v) : v);
 })).join("")}</div>`;
}

let 選中頁籤 = 0;

async function _錄完() {
 if (!錄) return;
 const f = window._延頁 || [];
 錄.延後 = true;
 await Promise.all(f.map(((fn, i) => fn ? 填頁(i) : null)));
 for (let i = 0; i < 100 && document.querySelector('[id^="lz"]'); i++) await new Promise((r => setTimeout(r, 50)));
 const s = document.createElement("script");
 s.id = "錄";
 s.type = "application/json";
 s.textContent = JSON.stringify({
  "讀": 錄.讀,
  "全索引": 錄.全索引,
  "協議": 錄.協議,
  "引用": 錄.引用,
  "零件": 錄.零件
 });
 document.body.appendChild(s);
 document.title = "錄好";
}

async function 填頁(i) {
 const f = (window._延頁 || [])[i];
 if (!f) return;
 window._延頁[i] = null;
 const p = document.querySelector(`.panel[data-pi="${i}"]`);
 try {
  const h = await f();
  if (p) p.innerHTML = h || '<p class="note">沒有</p>';
  _階梯全算();
 } catch (e) {
  if (p) p.innerHTML = `<div class="bad">${esc(e && e.message || e)}</div>`;
 }
}

function 切(i, 聚焦) {
 選中頁籤 = i;
 填頁(i);
 document.querySelectorAll(".tab").forEach(((b, k) => {
  b.setAttribute("aria-selected", k === i);
  b.tabIndex = k === i ? 0 : -1;
 }));
 document.querySelectorAll(".panel").forEach(((p, k) => {
  p.hidden = k !== i;
 }));
 if (聚焦) {
  const t = document.querySelectorAll(".tab")[i];
  if (t) t.focus();
 }
}

function 列表清單(類, 清單) {
 let a = (清單 || []).filter((o => o && o.名 && !String(o.名).includes("/傳記/")));
 if (類 === "畫冊收集") a = a.filter((o => !String(o.名).includes("/") && ![ "介面美術", "待歸檔", "資源" ].includes(String(o.名))));
 if (類 === "歷練") a = a.filter((o => !String(o.名).includes("/")));
 if (類 === "時裝") {
  const m = new Map;
  for (const o of a) {
   const su = String(o.名).split("/")[0];
   if (!su.startsWith("_") && !m.has(su)) m.set(su, {
    "名": su,
    "名稱": su,
    "品質": o.品質
   });
  }
  a = [ ...m.values() ];
 }
 return a;
}

function 麵包(類, 中段) {
 const 段 = (中段 || []).map((([n, h], i, a) => `<i>/</i>${h && i < a.length - 1 ? `<a href="${h}">${esc(n)}</a>` : esc(n)}`)).join("");
 return `<span class="crumb"><a href="../首頁.html">巡夢圖鑑</a><i>/</i>` + `<a href="${_靜態() ? "清單.html" : encodeURIComponent(類) + "範本.html"}">${esc(類)}</a>` + 段 + `</span>`;
}

function 切色() {
 const r = document.documentElement;
 const cur = r.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
 r.dataset.theme = cur === "dark" ? "light" : "dark";
}

function 引群(標題, arr, o) {
 if (!arr || !arr.length) return "";
 return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : "") + `<div class="objs">${arr.map((x => 引用(x.名 || x.編 || "?", Object.assign({
  "類": x.類,
  "名": x.名,
  "數量": x.量,
  "附註": x.附註
 }, o || {})))).join("")}</div>`;
}

function 去處板(R) {
 let h = "";
 if (R.去處 && R.去處.length) h += `<h3 class="grp">遊戲標示的去處</h3>\n    <div class="objs">${R.去處.map((x => 引用(x.名, {
  "類": x.類,
  "名": x.名,
  "附註": x.條件 || null
 }))).join("")}</div>`;
 if (R.歷練取得 && R.歷練取得.length) h += `<h3 class="grp">歷練</h3><div class="objs">${R.歷練取得.map((e => (e.事件 || []).map((n => 引用(n, {
  "類": "歷練",
  "名": n,
  "附註": (e.地圖 || [])[0] || null
 }))).join(""))).join("") || '<span class="dim">—</span>'}</div>`;
 if (R.反查來源 && R.反查來源.length) h += `<h3 class="grp">來源</h3><div class="ways">${R.反查來源.map((x => `<span class="way"><b>${esc(x.名)}</b></span>`)).join("")}</div>`;
 return h;
}

const 指令板 = x => x.請求獲取指令 ? `<div class="cmd">${esc(x.請求獲取指令.格式)}<br><b>${esc(x.請求獲取指令.範例)}</b></div>\n    <p class="note">${esc(x.請求獲取指令.說明 || "")}</p>` : "";

function 獲取板(x) {
 let h = "";
 const g = x.獲取途徑 || x.獲取 || [];
 if (g.length) h += `<h3 class="grp">去處</h3><div class="objs">${g.map((o => 引用(o.功能 || o.名稱, {
  "類": "玩法",
  "名": o.功能 || o.名稱,
  "附註": o.開啟條件 || null
 }))).join("")}</div>\n    ${g.some((o => o.說明)) ? `<p class="note">${esc(g.map((o => o.說明)).filter(Boolean).join(" / "))}</p>` : ""}`;
 const t = x.獲取推斷;
 if (t) h += `<h3 class="grp">從敘述文字推斷</h3><div class="objs">${引用(t.來源, {
  "類": "活動",
  "名": t.來源,
  "附註": t.方式
 })}</div>\n    <p class="note">原句「${esc(t.原句 || "")}」。${esc(t.依據 || "")} ${esc(t.待確認 || "")}</p>`;
 return h;
}

let _全索;

function 全索引() {
 if (!_全索) _全索 = (async () => {
  const _錄索 = mm => {
   if (!錄) return mm;
   const g = mm.get.bind(mm), h = mm.has.bind(mm);
   mm.get = k => {
    const v = g(k);
    if (v !== undefined) 錄.全索引[k] = v;
    return v;
   };
   mm.has = k => {
    const v = h(k);
    if (v) 錄.全索引[k] = g(k);
    return v;
   };
   return mm;
  };
  if (預載 && 預載.全索引) {
   const mm = new Map;
   for (const k in 預載.全索引) mm.set(k, 預載.全索引[k]);
   return mm;
  }
  const 預 = await _讀(基底() + "_全索引.json");
  if (預 && 預.表) {
   const mm = new Map;
   for (const k in 預.表) mm.set(k, 預.表[k]);
   return _錄索(mm);
  }
  const top = await _讀(基底() + "_索引.json");
  const 類表 = ((top || {}).清單 || []).map((c => c.名 || c.類 || c)).filter(Boolean);
  const m = new Map;
  await Promise.all(類表.map((async 類 => {
   let L = [];
   try {
    L = await 類索引(類);
   } catch (e) {}
   for (const o of L || []) {
    const 別 = Array.isArray(o.別名) ? o.別名 : o.別名 ? [ o.別名 ] : [];
    for (const k of new Set([ o.名稱, o.名, ...別 ].filter(Boolean))) {
     if (!m.has(k)) m.set(k, []);
     m.get(k).push({
      "類": 類,
      "名": o.名
     });
    }
    if (o.編號 != null) {
     const nk = "@號@" + 類 + "@" + o.編號;
     if (!m.has(nk)) m.set(nk, []);
     m.get(nk).push({
      "類": 類,
      "名": o.名,
      "種類": o.種類,
      "星": o.星
     });
    }
    const 父 = String(o.名).includes("/") ? String(o.名).split("/")[0] : null;
    if (父) {
     const pk = "@父@" + 父;
     if (!m.has(pk)) m.set(pk, []);
     m.get(pk).push({
      "類": 類,
      "名": o.名,
      "星": o.星
     });
    }
   }
  })));
  return _錄索(m);
 })();
 return _全索;
}

let _對照檔;

function _對照全() {
 if (!_對照檔) _對照檔 = _讀(window.協議基底 + "_來源對照.json").then((d => d || {}));
 return _對照檔;
}

const 來源對照 = async () => (await _對照全()).規則 || [];

const 表對類 = async 表 => ((await _對照全()).表 || {})[表] || null;

async function 對照(名) {
 for (const r of await 來源對照()) {
  let re;
  try {
   re = new RegExp(r.比對);
  } catch (e) {
   continue;
  }
  const m = re.exec(名);
  if (!m) continue;
  if (!r.類) return {
   "類": ""
  };
  const n = String(r.名 || "$0").replace(/\$(\d)/g, ((_, i) => m[+i] || ""));
  return {
   "類": r.類,
   "名": n
  };
 }
 return null;
}

async function 找物(名) {
 let k = String(名 == null ? "" : 名).trim();
 if (!k) return null;
 const 索 = await 全索引();
 const 挑 = async hit => {
  for (const h of hit) {
   if (await 載協議(h.類)) return h;
  }
  return hit[0] || null;
 };
 if (索.has(k)) return 挑(索.get(k));
 const 去括 = k.replace(/[((](開出|開出內容|掉落|來源待查)[))]\s*$/, "").trim();
 if (去括 !== k && 索.has(去括)) return 挑(索.get(去括));
 const 引號 = /[「『"']([^「」『』"']+)[」』"']/.exec(k);
 if (引號 && 索.has(引號[1])) return 挑(索.get(引號[1]));
 const 子 = 索.get("@父@" + 去括);
 if (子 && 子.length) return 挑([ ...子 ].sort(((a, b) => (+a.星 || 0) - (+b.星 || 0))));
 const 對 = await 對照(去括);
 if (對 && 對.類) {
  const 再 = (索.get(對.名) || []).filter((h => h.類 === 對.類));
  if (再.length) return 挑(再);
  const 全 = 索.get(對.名) || [];
  const 準 = 全.filter((h => h.名 === 對.名));
  if (準.length) return 挑(準);
  if (全.length) return 挑(全);
  return {
   "類": 對.類,
   "名": 對.名,
   "缺": true
  };
 }
 return null;
}

const 獎勵類型 = {
 2: "道具",
 14: "夥伴",
 15: "裝備",
 17: "精粹",
 18: "時裝",
 27: "能力",
 44: "飾框",
 117: "寵物",
 122: "珍寶",
 215: "飾框"
};

const 道具系 = [ "道具", "寶石", "精粹", "碎片", "花", "珍藏碎片", "意志", "資源", "畫冊收集" ];

const 限種類 = {
 44: [ "頭像框", "聊天氣泡", "宮牌", "天幕", "頭像" ],
 215: [ "稱號" ]
};

let _資源號;

async function 資源編號表() {
 if (!_資源號) _資源號 = (async () => {
  const m = new Map;
  for (const o of await 類索引("資源")) if (o.資源編號 != null) m.set(String(o.資源編號), o.名);
  return m;
 })();
 return _資源號;
}

async function 解獎勵(碼) {
 const s = String(碼 == null ? "" : 碼).trim().replace(/%\d+$/, "");
 if (!/^\d+(_\d+)*$/.test(s)) return null;
 const g = s.split("_");
 const 索 = await 全索引();
 const 查號 = (類, 號, 種) => {
  const a = 索.get("@號@" + 類 + "@" + 號) || [];
  const b = 種 ? a.filter((o => 種.includes(o.種類))) : a;
  return b[0] || null;
 };
 const 資 = await 資源編號表();
 if (g.length === 2 && 資.has(g[0])) return {
  "類": "資源",
  "名": 資.get(g[0]),
  "量": +g[1]
 };
 if (g[0] === "15" && g.length === 4) {
  const h = 查號("裝備", g[1]);
  if (!h) return null;
  return {
   "類": "裝備",
   "名": String(h.名).split("/")[0] + "/" + g[2] + "星",
   "量": +g[3]
  };
 }
 if (g[0] === "41" && g.length >= 2) {
  const h = 查號("時裝", g[1]);
  return h ? {
   "類": "時裝",
   "名": String(h.名).split("/")[0],
   "量": g.length >= 3 ? +g[2] : 1
  } : null;
 }
 const 類 = 獎勵類型[g[0]];
 if (!類 || g.length < 2) return null;
 const 量 = g.length >= 3 && g[0] !== "215" ? +g[2] : 1;
 const 候 = g[0] === "2" ? 道具系 : [ 類 ];
 for (const c of 候) {
  const h = 查號(c, g[1], 限種類[g[0]]);
  if (h) return {
   "類": c,
   "名": h.名,
   "量": 量
  };
 }
 return null;
}

async function 獎勵排(碼串, 標題) {
 const 段 = String(碼串 || "").split(",").map((x => x.trim())).filter(Boolean);
 if (!段.length) return "";
 const 結 = await Promise.all(段.map((async s => {
  const r = await 解獎勵(s);
  return r ? {
   "卡": await 引用塊({
    "類": r.類,
    "名": r.名,
    "量": r.量 > 1 ? r.量 : null
   })
  } : {
   "文": `<span class="way"><b class="mono">${esc(s)}</b></span>`
  };
 })));
 const 卡 = 結.filter((r => r.卡)).map((r => r.卡)), 文 = 結.filter((r => r.文)).map((r => r.文));
 return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : "") + (卡.length ? `<div class="objs fam">${卡.join("")}</div>` : "") + (文.length ? `<div class="ways">${文.join("")}</div>` : "");
}

async function 名字排(項, 標題, 修) {
 const _拆量 = s => {
  const t = String(s).trim();
  let m = /^(.+?)\s*[×xX*]\s*([\d,]+)$/.exec(t);
  if (!m) m = /^(.+?[^\d\s])\s*([\d,]{1,9})$/.exec(t);
  return m && m[1].trim() ? {
   "名": m[1].trim(),
   "量": m[2].replace(/,/g, "")
  } : {
   "名": t
  };
 };
 const 一 = (項 || []).map((it => typeof it === "string" ? _拆量(it) : Object.assign(_拆量(it.名稱 || it.名 || it.功能 || ""), it.量 != null ? {
  "量": it.量
 } : it.數量 != null ? {
  "量": it.數量
 } : {}, {
  "附": it.附 || it.開啟條件 || it.條件 || it.備註
 })));
 const 有名 = 一.filter((o => o.名));
 if (!有名.length) return "";
 const 結 = await Promise.all(有名.map((async o => {
  const h = await 找物(o.名);
  const 額 = {
   "類": h ? h.類 : null,
   "名": h ? h.名 : o.名
  };
  if (o.量 != null && o.量 !== "") 額.量 = o.量;
  if (o.附) 額.附註 = o.附;
  return h ? {
   "卡": await 引用塊(Object.assign(額, 修 || {}))
  } : {
   "卡": _缺塊({
    "名": o.名 + (o.量 ? " " + _量字(o.量) : "")
   }, "素材裡還沒有這一筆")
  };
 })));
 const 卡 = 結.filter((r => r.卡)).map((r => r.卡)), 文 = 結.filter((r => r.文)).map((r => r.文));
 return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : "") + (卡.length ? `<div class="objs fam">${卡.join("")}</div>` : "") + (文.length ? `<div class="ways">${文.join("")}</div>` : "");
}

const 組序 = [ "道具", "活動", "商店", "歷練", "夥伴", "寵物", "珍寶", "裝備", "資源", "地圖" ];

const _方式序 = [ "遊戲標示", "活動", "戰令", "時裝招募", "夥伴招募", "寵物招募", "限定招募", "招募", "商店", "兌換商店", "兌換", "禮包", "直購禮包", "儲值", "簽到", "成就", "任務", "成長任務", "主線任務", "主題活動", "分解", "出售" ];

function _期字(期) {
 if (!期 || !期.length) return "";
 const f = s => String(s || "").slice(0, 10).replace(/-/g, "/");
 return 期.slice(0, 2).map((p => f(p[0]) + (p[1] ? "～" + f(p[1]) : ""))).join("、") + (期.length > 2 ? "…" : "");
}

async function 關聯板(類, 名, 向) {
 const d = await _讀(基底() + "_關聯/依目標/" + encodeURIComponent(類) + "/" + encodeURIComponent(String(名).replace(/\//g, "／")) + ".json");
 if (!d || !(d.給 || []).length && !(d.耗 || []).length) return "";
 const 組 = async (列, 標題) => {
  if (!(列 || []).length) return "";
  const g = new Map;
  for (const r of 列) {
   const k = r.方式 || "其他";
   if (k === "遊戲標示") continue;
   if (!g.has(k)) g.set(k, []);
   g.get(k).push(r);
  }
  if (!g.size) return "";
  const keys = [ ...g.keys() ].sort(((a, b) => {
   const ia = _方式序.indexOf(a), ib = _方式序.indexOf(b);
   return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  }));
  let h = "";
  for (const k of keys) {
   const rs = g.get(k);
   const 卡 = [];
   for (const r of rs) {
    const 附 = [ r.標, r.量 && r.量[0] != null && !r.來源?.頁 ? r.量[0] === r.量[1] ? "×" + r.量[0] : "×" + r.量[0] + "～" + r.量[1] : null, r.機率 ? "機率 " + Math.round(r.機率 * 1e3) / 10 + "%" : null, r.次 > 1 ? r.次 + " 處" : null, r.摺 ? r.摺 + " 項" : null, r.例 && r.例.length ? r.例.slice(0, 3).join("、") : null, _期字(r.檔期) ].filter(Boolean).join(" · ");
    if (!r.來源) continue;
    const ref = {
     "類": r.來源.類,
     "名": r.來源.名,
     "附註": 附 || null
    };
    if (r.來源.所屬活動) ref.所屬活動 = r.來源.所屬活動;
    if (r.來源.頁) ref.頁 = r.來源.頁;
    卡.push(await 引用塊(ref));
   }
   if (卡.length) h += `<h3 class="grp">${esc(k.replace(/^其他:/, ""))}</h3><div class="objs fam">${卡.join("")}</div>`;
  }
  return h;
 };
 if (向 === "給") return await 組(d.給, "從哪裡來");
 if (向 === "耗") return await 組(d.耗, "拿去哪裡用");
 if (向 === "用") return await 組((d.出 || []).map((r => Object.assign({}, r, {
  "方式": {
   "開出": "開出內容",
   "合成": "合成為",
   "招募": "卡池內容"
  }[r.方式] || r.方式
 }))), "") + await 組(d.耗, "");
 return await 組(d.給, "從哪裡來") + await 組(d.耗, "用在哪裡");
}

const _活動在 = new Map;

async function _有活動(名) {
 if (_活動在.has(名)) return _活動在.get(名);
 const p = _讀(基底() + "活動/" + encodeURIComponent(名) + "/資訊.json").then((d => !!d));
 _活動在.set(名, p);
 return p;
}

async function 獲取頁(x) {
 if (x && x._類 && x._名) {
  const h = await 關聯板(x._類, x._名, "給");
  if (h) return h;
 }
 const 收 = [];
 const 標 = x.獲得途徑 && x.獲得途徑.遊戲標示 || x.獲取途徑 || x.獲取 || [];
 for (const g of 標) 收.push({
  "名": g && (g.名稱 || g.功能) || g,
  "附": g && g.開啟條件
 });
 for (const s of x.反查來源明細 || []) 收.push({
  "名": s.名稱
 });
 for (const s of x.反查來源 || []) 收.push({
  "名": s
 });
 const 途 = x.獲得途徑 || {};
 for (const r of 途.正向來源 || []) if (r && r.來源) 收.push({
  "名": r.來源,
  "附": r.信心 && r.信心 !== "確證" ? r.信心 : null
 });
 const 玩 = new Map;
 for (const r of x.玩法來源 || []) if (r && r.玩法) {
  if (!玩.has(r.玩法)) 玩.set(r.玩法, []);
  玩.get(r.玩法).push(r);
 }
 for (const [名] of 玩) 收.push({
  "名": 名
 });
 if (!收.length) for (const r of 途.反查 || []) if (r && r.名稱) 收.push({
  "名": r.名稱
 });
 const 說 = [].concat(x.獲取說明 || []).filter((t => typeof t === "string"));
 for (const t of 說) 收.push({
  "名": t
 });
 if (typeof x.取得方式 === "string" && !說.some((t => x.取得方式.startsWith(t)))) 收.push({
  "名": x.取得方式
 });
 if (typeof x.取得途徑 === "string") 收.push({
  "名": x.取得途徑
 });
 if (x.獲取推斷 && x.獲取推斷.來源) 收.push({
  "名": x.獲取推斷.來源
 });
 const 見 = new Set, 組 = new Map, 文 = [];
 const 放 = (類, r) => {
  if (!組.has(類)) 組.set(類, []);
  組.get(類).push(r);
 };
 if (x.所屬活動) {
  for (const a of x.活動來源 || []) 放("活動", {
   "類": "活動",
   "名": a.活動,
   "附註": a.說明 || null
  });
  放("活動", {
   "類": "活動",
   "名": x.所屬活動,
   "附註": "所屬活動"
  });
  (x.活動來源 || []).forEach((a => 見.add("活動|" + a.活動)));
  見.add("活動|" + x.所屬活動);
 }
 const 全名 = new Set(收.map((o => String(o.名 || "").trim())).filter(Boolean));
 for (const e of x.歷練取得 || []) for (const ev of e.事件 || []) 全名.add(String(ev).trim());
 const 去 = [];
 for (const o of 收) {
  const n = String(o.名 || "").trim();
  if (!n || /待查/.test(n) || 見.has(n)) continue;
  if (n.length > 2 && n.endsWith("歷練") && 全名.has(n.slice(0, -2))) continue;
  見.add(n);
  去.push({
   n: n,
   "附": o.附
  });
 }
 const 對 = await Promise.all(去.map((o => 找物(o.n))));
 去.forEach(((o, i) => {
  const h = 對[i];
  if (h && h.類) {
   const k = h.類 + "|" + h.名;
   if (見.has(k)) return;
   見.add(k);
   放(h.類, {
    "類": h.類,
    "名": h.名,
    "附註": o.附 || null
   });
  } else 文.push(o.n);
 }));
 for (const e of x.歷練取得 || []) for (const ev of e.事件 || []) {
  const k = "歷練|" + ev;
  if (見.has(k)) continue;
  見.add(k);
  放("歷練", {
   "類": "歷練",
   "名": ev,
   "附註": (e.地圖 || []).join("、") || null
  });
 }
 if (!組.size && !文.length) return "";
 const 全部 = [];
 for (const arr of 組.values()) for (const r of arr) 全部.push(r);
 let h = 全部.length ? await 引用排(全部) : "";
 if (文.length) h += `${全部.length ? "" : ""}<div class="ways">${文.map((n => `<span class="way"><b>${esc(n)}</b></span>`)).join("")}</div>`;
 return h;
}

async function 用途頁(x) {
 if (x && x._類 && x._名) {
  const h = await 關聯板(x._類, x._名, "用");
  if (h) return h;
 }
 const u = x.用途 && typeof x.用途 === "object" && !Array.isArray(x.用途) ? x.用途 : {};
 const 項 = [ ...u.前往 || [], ...u.被消耗於 || [] ];
 const 名 = [], 表 = [], 定 = [];
 for (const o of 項) {
  if (typeof o === "string") {
   名.push({
    "名": o
   });
   continue;
  }
  const 類 = o.來源表 ? await 表對類(o.來源表) : null;
  if (o.名稱 && 類) 定.push({
   "類": 類,
   "名": o.名稱,
   "顯類型": false
  }); else if (o.名稱) 名.push({
   "名": o.名稱
  }); else if (o.來源表) 表.push(o.來源表 + (o.欄位 ? "." + o.欄位 : ""));
 }
 const 已 = new Set(定.map((r => r.名)));
 for (let i = 名.length - 1; i >= 0; i--) if (已.has(名[i].名)) 名.splice(i, 1);
 const 在 = x.活動用途 ? null : x.用在哪;
 if (Array.isArray(在)) 在.forEach((n => 名.push({
  "名": n && (n.名稱 || n.名) || n
 }))); else if (typeof 在 === "string") 名.push({
  "名": 在
 });
 const 能 = (x.能力用途 || []).filter((o => o.用在 !== "轉移")).map((o => ({
  "類": "能力",
  "名": o.能力,
  "顯類型": false
 })));
 const 轉 = (x.能力用途 || []).filter((o => o.用在 === "轉移")).length;
 const 活 = [ ...(x.活動用途 || []).map((a => ({
  "類": "活動",
  "名": a.活動,
  "附註": a.說明 || null,
  "顯類型": false
 }))), ...定 ];
 let h = 活.length ? await 引用排(活, "拿去哪裡用") : "";
 if (名.length) h += await 名字排(名, 活.length ? null : "拿去哪裡用");
 if (能.length) h += await 索引排("能力", 能.map((o => ({
  "名": o.名
 }))), null, "升級這些能力");
 if (轉) h += `<p class="note">另外,全部 ${轉} 個能力的「轉移」都花這個。</p>`;
 if (表.length) h += `${名.length || 活.length ? "" : '<h3 class="grp">拿去哪裡用</h3>'}<div class="ways">${[ ...new Set(表) ].map((t => `<span class="way"><b class="mono">${esc(t)}</b></span>`)).join("")}</div>`;
 const 堆 = u.堆上去會發生什麼;
 if (Array.isArray(堆) && 堆.length) h += `<h3 class="grp">效果</h3><ul class="bul">${堆.map((t => `<li>${rich(String(t))}</li>`)).join("")}</ul>`;
 return h;
}

function 圖組(x) {
 const g = x.圖片;
 if (!g || typeof g !== "object") return "";
 const 路 = x._素材;
 if (!路) return "";
 if (Array.isArray(g)) return "";
 const 項 = Object.entries(g).filter((([k, v]) => typeof v === "string" && v.endsWith(".png")));
 if (!項.length) return "";
 return `<h3 class="grp">這一筆的圖</h3><div class="objs">${項.map((([k, v]) => `<span class="obj"><span class="rfi bare"><img src="${window.素材基底 + 路 + "/" + v}" alt="" loading="lazy"></span>\n      <b>${esc(k)}</b><i class="mono">${esc(v)}</i></span>`)).join("")}</div>`;
}

window.協議基底 = window.協議基底 || "../";

window.類基底 = window.類基底 || {};

{
 const _m = location.search.match(/[?&]活動基底=([^&]+)/);
 if (_m) window.類基底["活動"] = decodeURIComponent(_m[1]);
}

const 格子零件 = n => 基底() + "介面/格子零件/" + n;

const _有圖檔 = u => new Promise((r => {
 const i = new Image;
 i.onload = () => r(true);
 i.onerror = () => r(false);
 i.src = u;
}));

let _零件好了;

function 備妥零件() {
 if (!_零件好了) _零件好了 = (async () => {
  if (預載 && 預載.零件) {
   for (const k in 預載.零件) if (!window[k]) window[k] = 預載.零件[k];
   return;
  }
  await Promise.all([ [ "格遮罩", "格遮罩.png" ], [ "寶石孔底", "寶石孔底.png" ], [ "珍寶等級底", "珍寶等級底.png" ] ].map((async ([k, f]) => {
   if (window[k]) return;
   const u = 格子零件(f);
   window[k] = await _有圖檔(u) ? u : null;
   if (錄) 錄.零件[k] = window[k];
  })));
 })();
 return _零件好了;
}

const _協議快取 = new Map;

let _協全P = null;

function _協議全() {
 if (!_協全P) _協全P = _讀(基底() + "_協議全.json").then((d => d && d.表 || null));
 return _協全P;
}

async function 載協議(類) {
 if (_協議快取.has(類)) return _協議快取.get(類);
 const p = (async () => {
  if (預載 && 預載.協議 && 預載.協議[類]) return 預載.協議[類];
  const 全 = await _協議全();
  const 協 = 全 && 全[類] ? 全[類] : await _讀(window.協議基底 + encodeURIComponent(類) + "/" + encodeURIComponent(類) + "協議.json");
  if (錄 && 協) 錄.協議[類] = 協;
  return 協;
 })();
 _協議快取.set(類, p);
 return p;
}

let _格規快取 = null;

async function 載格規() {
 if (_格規快取) return _格規快取;
 _格規快取 = _讀(基底() + "系統/道具格.json").then((d => d && d.網頁端 && d.網頁端.品質框 || {}));
 return _格規快取;
}

function _框路(等級, 規) {
 const 色 = ((規 || {}).等級對色 || {})[String(等級)];
 if (!等級 || !色 || !(規 || {}).圖在哪) return null;
 return 基底() + String(規.圖在哪).split("(")[0].trim().replace("<兩位數等級>", String(等級).padStart(2, "0")).replace("<色>", 色);
}

const _段 = 名 => String(名).split("/").map(encodeURIComponent).join("/");

const _範本在 = new Map;

async function _有範本(類, 連樣) {
 if (!連樣) return false;
 if (錄 && 錄.不上.has(類)) return false;
 const u = String(連樣).split("#")[0];
 if (_範本在.has(u)) return _範本在.get(u);
 let ok = null;
 try {
  const c = sessionStorage.getItem("範本在|" + u);
  if (c != null) ok = c === "1";
 } catch (e) {}
 if (ok === null) {
  const r = await fetch(u, {
   method: "HEAD"
  }).catch((() => null));
  ok = !!(r && r.ok);
  try {
   sessionStorage.setItem("範本在|" + u, ok ? "1" : "0");
  } catch (e) {}
 }
 _範本在.set(u, ok);
 return ok;
}

const _挖 = (o, 路) => String(路).split(".").reduce(((a, k) => a && a[k] !== undefined ? a[k] : undefined), o);

const _是檔名 = s => /\.(png|jpe?g|webp|gif|svg)$/i.test(s);

const _推導 = {
 "@長度": null,
 "@章節圖": 資料 => {
  const b = _挖(資料, "background") ?? _挖(資料, "卡片圖");
  return b ? "圖/" + b + ".png" : null;
 },
 "@稀有度轉等級": (資料, 夾, 規) => {
  const a = _挖(資料, "引用.品質") ?? _挖(資料, "品質");
  if (!Array.isArray(a) || !a.length) return null;
  const 稀 = {
   N: 2,
   R: 3,
   SR: 4,
   SSR: 5,
   UR: 6,
   SP: 7
  };
  let 最 = null;
  for (const t of a) {
   const v = 稀[(t || {}).稀有度];
   if (v && (最 === null || v > 最)) 最 = v;
  }
  return 最;
 },
 "@組合圖": 資料 => {
  const 類 = _挖(資料, "組合類型"), 名 = _挖(資料, "名稱");
  if (!名) return null;
  if (類 === "時裝套裝") return "時裝/" + 名 + "/展示圖_縮圖.png";
  return null;
 },
 "@星級欄": null,
 "@品質轉等級": (資料, 夾, 規) => {
  const 色 = _挖(資料, "引用.品質") ?? _挖(資料, "品質") ?? _挖(資料, "類型.品質");
  if (!色) return null;
  const 對 = (規 || {}).等級對色 || {};
  for (const k of Object.keys(對)) if (對[k] === 色) return +k;
  return null;
 }
};

const _圖快取 = new Map;

function _能載(u) {
 if (_圖快取.has(u)) return _圖快取.get(u);
 const p = new Promise((ok => {
  const i = new Image;
  i.onload = () => ok(true);
  i.onerror = () => ok(false);
  i.src = u;
 }));
 _圖快取.set(u, p);
 return p;
}

function _圖候選(資料, 候選, 夾, 規, 解析) {
 const out = [];
 for (const c of 候選 || []) {
  let v = _取(資料, [ c ], 夾, 規);
  if (typeof v === "string" && 解析) v = 解析(v);
  if (typeof v === "string" && _是檔名(v) && !out.includes(v)) out.push(v);
 }
 return out;
}

async function _挑圖(資料, 候選, 夾, 規, 解析) {
 for (const v of _圖候選(資料, 候選, 夾, 規, 解析)) if (await _能載(v)) return v;
 return null;
}

function _取(資料, 候選, 夾, 規) {
 for (const c of 候選 || []) {
  if (typeof c === "string" && c[0] === "@") {
   let v;
   if (c.startsWith("@長度:")) {
    const a = _挖(資料, c.slice(4));
    v = Array.isArray(a) ? a.length : null;
   } else if (c.startsWith("@星級欄:")) {
    const a = _挖(資料, "星級"), k = +(資料._星 || 0);
    v = Array.isArray(a) && k > 0 && a[k - 1] ? a[k - 1][c.slice(5)] : null;
   } else {
    v = (_推導[c] || (() => null))(資料, 夾, 規);
   }
   if (v !== undefined && v !== null && v !== "") return v;
   continue;
  }
  if (_是檔名(c)) return 夾 + "/" + c;
  const v = _挖(資料, c);
  if (v !== undefined && v !== null && v !== "") {
   return typeof v === "string" && _是檔名(v) ? 夾 + "/" + v : v;
  }
 }
 return null;
}

async function 引用塊(ref) {
 if (!ref || !ref.類 || !ref.名) return "";
 const _K = JSON.stringify(ref);
 if (預載 && 預載.引用 && Object.prototype.hasOwnProperty.call(預載.引用, _K)) return 預載.引用[_K];
 await 備妥零件();
 const 協 = await 載協議(ref.類);
 if (!協 || !協.夾) return _缺塊(ref, "沒有 協議_" + ref.類 + ".json");
 const _末 = String(ref.名).split("/").pop();
 const _末數 = (/^(\d+)星$/.exec(_末) || [])[1];
 let 夾樣 = 協.夾, 檔 = 協.資料檔 || "資料.json", 基類 = ref.類, 連樣 = 協.連結;
 for (const v of Object.values(協.另有 || {})) {
  if (v && v.條件 && ref[v.條件] != null && ref[v.條件] !== "") {
   夾樣 = v.夾;
   檔 = v.資料檔 || 檔;
   基類 = v.基底類 || 基類;
   if (v.連結) 連樣 = v.連結;
   break;
  }
 }
 let 取規 = 協.取;
 if (協.層) {
  const _深 = String(ref.名).split("/").length;
  const L = 協.層[_深] || 協.層[String(_深)];
  if (L) {
   if (L.資料檔) 檔 = L.資料檔;
   if (L.取) 取規 = L.取;
   if (L.連結) 連樣 = L.連結;
  }
 }
 let 路 = 夾樣.replace("<名>", _段(ref.名));
 路 = 路.replace(/<([^>]+)>/g, ((m, k) => ref[k] != null ? _段(ref[k]) : m));
 const 基 = (window.類基底[基類] || 基底()) + 路;
 if (連樣 && 連樣.startsWith("/範本/")) 連樣 = 連樣.replace(/^\/範本\//, "../");
 const _有範P = _有範本(基類 === ref.類 ? ref.類 : 基類, 連樣);
 const 資料 = await _讀(基 + "/" + 檔, true);
 if (!資料) return _缺塊(ref, "素材裡還沒有這一筆");
 const 修 = Object.assign({}, 協.修飾預設 || {}, ref);
 if (_末數 != null) 資料._星 = +_末數;
 const 規 = await 載格規();
 const 基準 = 協.取基準 || {};
 const _解 = k => v => {
  const b = 基準[k];
  if (!b || typeof v !== "string") return v;
  const 檔 = v.startsWith(基) ? v.slice(基.length + 1) : v;
  if (b === "素材") return 基底() + 檔;
  if (b === "類夾") return (window.類基底[ref.類] || 基底()) + ref.類 + "/" + 檔;
  return v;
 };
 const V = {};
 for (const k of Object.keys(取規 || {})) {
  const c = 取規[k];
  const 單 = c && !Array.isArray(c) && typeof c === "object" ? c[修.樣式] || Object.values(c)[0] : c;
  if (k === "圖") {
   V._圖候選 = _圖候選(資料, 單, 基, 規, _解("圖"));
   V.圖 = V._圖候選[0] || null;
  } else V[k] = _解(k)(_取(資料, 單, 基, 規));
  if (k === "名稱" && ref.類 === "寵物" && /_變異(\/|$)/.test(String(ref.名)) && V[k] && !/變異/.test(V[k])) V[k] += "(變異)";
 }
 const _子類 = String(ref.名).split("/")[0];
 const _覆 = (協.子類覆蓋 || {})[_子類] || {};
 const _開 = (名, 底) => {
  const v = ref[名] !== undefined ? ref[名] : _覆[名] !== undefined ? _覆[名] : (協.修飾預設 || {})[名] !== undefined ? 協.修飾預設[名] : 底;
  return v === undefined ? !!底 : !!v;
 };
 const 畫 = Array.isArray(協.畫) ? 協.畫 : [ "圖", "名稱" ];
 const 要 = {
  "品質框": _開("框", 畫.includes("品質框")),
  "圖": _開("顯圖", 畫.includes("圖")),
  "量": _開("顯量", 畫.includes("量")),
  "名稱": _開("顯名", 畫.includes("名稱")),
  "類型": _開("顯類型", 畫.includes("類型")),
  "序號": _開("顯序號", 畫.includes("序號")),
  "星": _開("顯星", 畫.includes("星")),
  "寶石孔": _開("顯寶石孔", 畫.includes("寶石孔"))
 };
 const _有 = v => v !== undefined && v !== null && v !== "";
 const 框 = 要.品質框 ? _框路(V.等級, 規) : null;
 const _原樣 = (_覆.版式 || 協.版式) === "原樣";
 const 罩 = window.格遮罩 && !_原樣 ? ` style="-webkit-mask-image:url('${window.格遮罩}');mask-image:url('${window.格遮罩}')"` : "";
 const _比 = _覆.圖比例 != null ? _覆.圖比例 : 協.圖比例 && (協.圖比例[修.樣式] != null ? 協.圖比例[修.樣式] : 協.圖比例[Object.keys(協.圖比例)[0]]) || null;
 const _無圖 = 要.名稱 ? "" : `<span class="ab">${esc(String(V.名稱 || ref.名 || "?").slice(0, 10))}</span>`;
 const 內 = 要.圖 && V.圖 ? `<img${罩} src="${V.圖}" alt="" loading="lazy" data-b="" data-c="${esc(JSON.stringify(V._圖候選))}" data-f="${esc(_無圖)}" onerror="快圖退(this)">` : _無圖;
 let 疊 = "";
 const _等 = _有(ref.強化等級) ? ref.強化等級 : null;
 const 有等級條 = 畫.includes("等級") || _有(ref.強化等級);
 if (_末數 != null && (V.星數 == null || V.星數 === "")) V.星數 = +_末數;
 if (要.星 && V.星數 != null) {
  const 上限 = +(V.星上限 ?? V.星數) || 0, 現 = +V.星數 || 0;
  const 亮 = 基底() + "介面/裝備星級/星_亮.png";
  const 暗 = 基底() + "介面/裝備星級/星_暗.png";
  let 顆 = "";
  for (let i = 0; i < 上限; i++) 顆 += `<i style="left:calc(var(--c) * ${(i * 15.256 / 128).toFixed(5)});background-image:url('${i < 現 ? 亮 : 暗}')"></i>`;
  if (顆) 疊 += `<span class="ov st${有等級條 ? " up" : ""}">${顆}</span>`;
 }
 if (要.量 && _有(ref.量) && 協.可堆疊 !== false) 疊 += `<span class="ov num">${esc(_量字(ref.量))}</span>`;
 if (有等級條) {
  const 類 = ref.類;
  const 珍 = 類 === "珍寶";
  const 底 = 珍 ? window.珍寶等級底 : 基底() + "介面/品質框/其他_com_bg_shuliangdi.png";
  const 樣 = 珍 ? " gd" : 類 === "裝備" ? " eq" : 類 === "坐騎" ? " car" : "";
  const 字 = _等 === null ? "" : 類 === "坐騎" && _有(ref.階) ? ref.階 + "階" + _等 + "級" : _等 + "級";
  疊 += `<span class="ov lv${樣}"${底 ? ` style="background-image:url('${底}')"` : ""}>${esc(字)}</span>`;
 }
 if (要.寶石孔) {
  const 數 = +(V.寶石孔 ?? 0) || 0;
  if (數 > 0) {
   const 底 = window.寶石孔底;
   const Y = [ 111.2, 93.2, 75.1, 57.1 ];
   let 孔 = "";
   for (let i = 0; i < Math.min(數, 4); i++) 孔 += `<i style="top:calc(var(--c) * ${((128 - Y[i]) / 128).toFixed(5)})${底 ? `;background-image:url('${底}')` : ""}"></i>`;
   疊 += `<span class="ov gem">${孔}</span>`;
  }
 }
 if (_有(ref.角標) && ref.類 !== "裝備") 疊 += `<span class="ov tag${ref.類 === "珍寶" ? " gd" : ""}">${esc(ref.角標)}</span>`;
 if (_有(ref.狀態)) 疊 += `<span class="ov bn">${esc(ref.狀態)}</span>`;
 const 原 = (_覆.版式 || 協.版式) === "原樣" ? " raw" : "";
 const _樣 = [ 框 ? `background-image:url('${框}')` : null, _比 && +_比 !== 1 ? `--比:${_比}` : null ].filter(Boolean).join(";");
 const 格 = `<span class="rfi${框 ? "" : " bare"}${原}"${_樣 ? ` style="${_樣}"` : ""}>${內}${疊}</span>`;
 let h = 格;
 const 號 = 要.序號 && V.序號 != null && V.序號 !== "" ? `<span class="no">${esc(V.序號)}</span> ` : "";
 const 旁量 = 協.可堆疊 === false && _有(ref.量) ? `<span class="q">×${esc(_量字(ref.量))}</span>` : "";
 if (要.名稱 || 號 || 旁量) h += `<b>${號}${要.名稱 ? esc(V.名稱 || ref.名) : ""}${旁量}</b>`;
 const 附 = [ 要.類型 ? V.類型 : null, _有(ref.附註) ? ref.附註 : null ].filter(Boolean).join(" · ");
 if (附) h += `<i>${esc(附)}</i>`;
 const 有範 = await _有範P;
 let 到 = !有範 ? null : 連樣 ? 連樣.replace(/<([^>]+)>/g, ((m, k) => k === "名" ? _段(ref.名) : ref[k] != null ? _段(ref[k]) : m)) : null;
 if (到 && _靜態()) 到 = 到.replace(/\/([^\/]+)範本\.html#\/\1\/([^@].*)$/, ((m, c, rest) => {
  try {
   return "/" + 靜態路(c, decodeURIComponent(rest));
  } catch (e) {
   return m;
  }
 }));
 if (到 && ref.頁) 到 += (到.includes("#/") ? "?頁=" : "#頁=") + encodeURIComponent(ref.頁);
 const 題 = esc(V.提示 || V.名稱 || ref.名);
 const 缺圖 = 要.圖 && !V.圖 ? " noimg" : "";
 const _h = 到 ? `<a class="obj${缺圖}" href="${到}" title="${題}">${h}</a>` : `<span class="obj${缺圖}" title="${題}">${h}</span>`;
 if (錄) 錄.引用[_K] = _h;
 return _h;
}

const _等級字 = V => V.強化等級 != null && V.強化等級 !== "" ? V.強化等級 + "級" : "—級";

const _量字 = v => String(v).replace(/^\s*[×xX*]\s*/, "");

function _缺塊(ref, why) {
 return `<span class="obj miss" title="${esc(why)}">\n    <span class="rfi bare"><span class="ab">?</span></span>\n    <b>${esc(ref.名)}</b><i>尚未建檔</i></span>`;
}

async function 變體排(類, x, 清單, 標題) {
 const v = x.變體 || [];
 if (v.length < 2) return "";
 const 由號 = new Map((清單 || []).filter((o => o.編號 != null)).map((o => [ String(o.編號), o ])));
 const 由名 = new Map((清單 || []).map((o => [ o.名稱 || o.名, o ])));
 const 見 = new Set, 出 = [];
 for (const e of v) {
  const o = e.編號 != null && 由號.get(String(e.編號)) || 由名.get(e.名稱);
  if (!o || 見.has(o.名)) continue;
  見.add(o.名);
  出.push(o);
 }
 return 索引排(類, 出, x._名, 標題);
}

const _階梯表 = {};

let _心醫表;

async function 心醫表() {
 if (_心醫表 === undefined) _心醫表 = await _讀(window.素材基底 + "系統/_心醫等級.json");
 return _心醫表;
}

async function 心醫上限板(欄) {
 const r = await 心醫表();
 if (!r || !r.變化點) return "";
 return `<h3 class="grp">心醫等級上限</h3>` + `<table class="aff"><thead><tr><th>心醫等級</th><th>最高可升到</th></tr></thead><tbody>${r.變化點.map((o => `<tr><td>${o.心醫等級起} 級起 · ${esc(o.階級)}</td><td>${o[欄]} 級</td></tr>`)).join("")}</tbody></table>`;
}

function 心醫門檻板(列, 動) {
 if (!列 || !列.length) return "";
 return `<h3 class="grp">心醫等級門檻</h3>` + `<table class="aff"><thead><tr><th>${esc(動)}到</th><th>需要心醫等級</th></tr></thead><tbody>${列.map((o => `<tr><td>${esc(o.到)}</td><td>${o.需} 級</td></tr>`)).join("")}</tbody></table>`;
}

async function 階梯板(opt) {
 const o = Object.assign({
  "單位": "級",
  "材料": [],
  "註": null
 }, opt);
 if (o.獲得 && !Array.isArray(o.獲得.材料)) o.獲得 = null;
 if (!o.材料.length && !(o.獲得 && o.獲得.材料.length) || typeof o.算 !== "function") return "";
 const 查在 = 列 => Promise.all(列.map((m => m._在 === true ? true : 類資料(m.類, m.名).then((d => !!d)).catch((() => false)))));
 const _在 = await 查在(o.材料);
 o.材料 = o.材料.filter(((m, i) => _在[i]));
 if (o.獲得) {
  const _在2 = await 查在(o.獲得.材料);
  o.獲得.材料 = o.獲得.材料.filter(((m, i) => _在2[i]));
  if (!o.獲得.材料.length) o.獲得 = null;
 }
 if (!o.材料.length && !o.獲得) return "";
 _階梯表[o.鍵] = o;
 if (o.樣式 === "拉桿") return _拉桿(o);
 const 格 = await Promise.all(o.材料.map(((m, i) => 引用塊(Object.assign({}, m, {
  "量": 0,
  "顯名": true
 })))));
 const 盒 = (端, v) => `<div class="lvside">\n      <span class="lvt">${端 === "a" ? "從" : "練到"}</span>\n      <span class="lvbox">\n        <button class="lvstep" data-梯="${esc(o.鍵)}" data-端="${端}" data-走="-1" aria-label="減一">−</button>\n        <input type="number" data-梯="${esc(o.鍵)}" data-端="${端}" value="${v}"\n               min="${o.下限}" max="${o.上限}" aria-label="${端 === "a" ? "起始" : "目標"}">\n        <i>${esc(o.單位)}</i>\n        <button class="lvstep" data-梯="${esc(o.鍵)}" data-端="${端}" data-走="1" aria-label="加一">＋</button>\n      </span>\n      ${o.標 ? `<span class="lvt" data-梯標="${esc(o.鍵)}" data-端="${端}"></span>` : ""}\n      <span class="lvends">\n        <button class="lvend" data-梯="${esc(o.鍵)}" data-端="${端}" data-到="min">最小</button>\n        <button class="lvend" data-梯="${esc(o.鍵)}" data-端="${端}" data-到="max">最大</button>\n      </span>\n    </div>`;
 return `<div class="lvpair" data-梯組="${esc(o.鍵)}">\n      ${盒("a", o.起始)}\n      <div class="lvmid"><span class="lvt">${esc(o.料標 || "要花")}</span>\n        <div class="objs fam" data-梯料="${esc(o.鍵)}">${格.join("")}</div></div>\n      ${盒("b", o.目標)}\n    </div>${o.註 ? `<p class="note">${esc(o.註)}</p>` : ""}`;
}

function 等級圖(數) {
 const 底 = window.素材基底 + "介面/品質框/其他_com_bg_shuliangdi.png";
 return `<span class="lvbar" style="background-image:url('${底}')">${esc(數 == null ? "" : String(數))}</span>`;
}

function 突破徽(圖, n) {
 const m = Math.max(0, +n || 0);
 return `<span class="rfi${圖 ? "" : " bare"}">` + (圖 ? `<img src="${圖}" alt="" loading="lazy">` : "") + `<span class="ov tag gd">+${m}</span></span>`;
}

function 星圖(數, 上限) {
 const 基 = window.素材基底 + "介面/裝備星級/";
 const n = Math.max(0, +數 || 0), 共 = Math.max(n, +上限 || n);
 let h = "";
 for (let i = 0; i < 共; i++) h += `<img class="xi${i < n ? "" : " dim"}" src="${基}星_${i < n ? "亮" : "暗"}.png" alt="">`;
 return `<span class="xs">${h}</span>`;
}

const _扇位 = [ [ -18.9, -16 ], [ -18.9, 4.4 ], [ -.7, 8.8 ], [ 18.5, 4.4 ], [ 22.5, -16 ] ];

const _扇高 = [ 32, 39, 44, 39, 32 ];

const _扇層 = [ "2", "0", "1" ];

function 扇形(星, 上限) {
 const 基 = window.素材基底 + "介面/突破/";
 const n = Math.max(0, +星 || 0);
 const 層 = n === 0 ? 1 : Math.ceil(n / 5);
 const 層內 = n === 0 ? 0 : (n - 1) % 5 + 1;
 const 亮 = _扇層[Math.min(層, 2)] || "1";
 const 暗 = _扇層[Math.min(層 - 1, 2)] || "2";
 return `<span class="fan">${_扇位.map(((p, i) => `<img src="${基}scyc_icon_xingji${層內 >= i + 1 ? 亮 : 暗}${i + 1}.png" alt=""\n       style="left:calc(50% + ${p[0] * .78}px);bottom:calc(50% + ${p[1] * .78 - 6}px);\n              transform:translate(-50%,50%);height:${_扇高[i] * .78}px">`)).join("")}</span>`;
}

async function _拉桿(o) {
 const 格 = await Promise.all(o.材料.map((m => 引用塊(Object.assign({}, m, {
  "量": 0,
  "顯名": true
 })))));
 const 得格 = o.獲得 ? await Promise.all(o.獲得.材料.map((m => 引用塊(Object.assign({}, m, {
  "量": 0,
  "顯名": true
 }))))) : [];
 const R = (端, v) => `<input type="range" data-梯="${esc(o.鍵)}" data-端="${端}"\n      min="${o.下限}" max="${o.上限}" value="${v}" step="1"\n      aria-label="${端 === "a" ? "起始" : "目標"}">`;
 const 端鈕 = (端, 到, v) => `<button class="rg-end" data-梯="${esc(o.鍵)}" data-端="${端}"\n      data-到="${到}">${到 === "min" ? "最小" : "最大"} ${esc(o.格式 ? o.格式(v) : v)}</button>`;
 return `<div class="rgbox" data-梯組="${esc(o.鍵)}">\n      <div class="rgtop">\n        <span class="rgicon" data-梯圖="${esc(o.鍵)}"></span>\n        <span class="rgnum">\n          <span data-梯數="${esc(o.鍵)}" data-端="a"></span>\n          <span class="dash">–</span>\n          <span data-梯數="${esc(o.鍵)}" data-端="b"></span>\n        </span>\n      </div>\n      <div class="rgrow">\n        ${端鈕("a", "min", o.下限)}\n        <div class="rg${o.軌點 && o.軌點.length ? " hasdots" : ""}">\n          <div class="rg-track"></div><div class="rg-fill" data-梯填="${esc(o.鍵)}"></div>\n          ${R("a", o.起始)}${R("b", o.目標)}\n          ${o.軌點 && o.軌點.length ? `<div class="rgdots">${o.軌點.map((d => `<span class="rgdot" data-階="${d.階}" style="left:${((d.階 - .5 - o.下限) / Math.max(1, o.上限 - o.下限) * 100).toFixed(3)}%">${d.html}</span>`)).join("")}</div>` : ""}\n        </div>\n        ${端鈕("b", "max", o.上限)}\n      </div>\n      ${o.材料.length ? `<span class="lvt">${esc(o.料標 || "要花")}</span>\n      <div class="objs fam" data-梯料="${esc(o.鍵)}">${格.join("")}</div>` : ""}\n      ${o.獲得 ? `<span class="lvt">${esc(o.獲得.標 || "獲得")}</span>\n      <div class="objs fam" data-梯得="${esc(o.鍵)}">${得格.join("")}</div>` : ""}\n      ${o.附文 ? `<p class="rgsub" data-梯文="${esc(o.鍵)}"></p>` : ""}\n    </div>${o.註 ? `<p class="note">${esc(o.註)}</p>` : ""}`;
}

function _階梯算(鍵) {
 const o = _階梯表[鍵];
 if (!o) return;
 const 組 = document.querySelector(`[data-梯組="${CSS.escape(鍵)}"]`);
 if (!組) return;
 const ia = 組.querySelector('input[data-端="a"]'), ib = 組.querySelector('input[data-端="b"]');
 if (!ia || !ib) return;
 let a = Math.max(o.下限, Math.min(o.上限, +ia.value || o.下限));
 let b = Math.max(o.下限, Math.min(o.上限, +ib.value || o.下限));
 if (b < a) b = a;
 ia.value = a;
 ib.value = b;
 if (o.標) 組.querySelectorAll("[data-梯標]").forEach((el => el.textContent = o.標(el.dataset.端 === "a" ? a : b) || ""));
 const 填 = 組.querySelector("[data-梯填]");
 if (填) {
  const 跨 = Math.max(1, o.上限 - o.下限);
  填.style.left = (a - o.下限) / 跨 * 100 + "%";
  填.style.right = (1 - (b - o.下限) / 跨) * 100 + "%";
  組.querySelectorAll("[data-梯數]").forEach((el => {
   const v = el.dataset.端 === "a" ? a : b;
   el.innerHTML = o.格式H ? o.格式H(v) : `${esc(o.格式 ? o.格式(v) : v)}<i>${esc(o.單位)}</i>`;
  }));
  const 圖 = 組.querySelector("[data-梯圖]");
  if (圖 && o.圖) 圖.innerHTML = o.圖(b) || "";
 }
 if (o.附文) {
  const t = 組.querySelector("[data-梯文]");
  if (t) t.textContent = o.附文(a, b) || "";
 }
 組.querySelectorAll(".rgdot[data-階]").forEach((d => {
  const k = +d.dataset.階, 在 = k > a && k <= b;
  d.classList.toggle("off", !在);
  d.querySelectorAll("button").forEach((b2 => b2.disabled = !在));
 }));
 const 更新列 = (料, 材料, 需) => {
  if (!料) return;
  [ ...料.children ].forEach(((格, i) => {
   const m = 材料[i] || {};
   const 鍵 = m.量鍵 || m.名;
   const n = 需[鍵] || 需[String(鍵).split("/").pop()] || 0;
   const 字 = n ? o.量格式 ? o.量格式(n) : _量字(n) : "";
   const ov = 格.querySelector(".ov.num");
   if (ov) ov.textContent = 字;
   const q = 格.querySelector("b .q");
   if (q) q.textContent = n ? "×" + 字 : "";
   格.style.display = n ? "" : "none";
  }));
 };
 const 找 = sel => 組.parentNode.querySelector(sel) || 組.querySelector(sel);
 更新列(找(`[data-梯料="${CSS.escape(鍵)}"]`), o.材料, o.算(a, b) || {});
 if (o.獲得) 更新列(找(`[data-梯得="${CSS.escape(鍵)}"]`), o.獲得.材料, o.獲得.算(a, b) || {});
}

document.addEventListener("click", (e => {
 const b = e.target.closest("[data-梯]");
 if (!b || b.tagName !== "BUTTON") return;
 const o = _階梯表[b.dataset.梯];
 if (!o) return;
 const inp = document.querySelector(`[data-梯組="${CSS.escape(b.dataset.梯)}"] input[data-端="${b.dataset.端}"]`);
 if (!inp) return;
 if (b.dataset.到) inp.value = b.dataset.到 === "min" ? o.下限 : o.上限; else inp.value = (+inp.value || 0) + +b.dataset.走;
 _階梯算(b.dataset.梯);
}));

document.addEventListener("input", (e => {
 const i = e.target.closest("input[data-梯]");
 if (!i) return;
 _階梯算(i.dataset.梯);
}));

function _階梯全算() {
 document.querySelectorAll("[data-梯組]").forEach((el => _階梯算(el.dataset.梯組)));
}

async function 引用排(refs, 標題) {
 const a = (refs || []).filter(Boolean);
 if (!a.length) return "";
 const 卡 = await Promise.all(a.map(引用塊));
 return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : "") + `<div class="objs fam">${卡.join("")}</div>`;
}

const _範快 = new Map;

async function _讀(路, 不錄) {
 if (_範快.has(路)) return _範快.get(路);
 let p = 預載 && 預載.讀 && Object.prototype.hasOwnProperty.call(預載.讀, 路) ? Promise.resolve(預載.讀[路]) : fetch(帶版(路)).then((r => r.ok ? r.json() : null)).catch((() => null));
 if (錄 && !不錄 && !錄.延後 && !/_全索引\.json$|_協議全\.json$/.test(路)) p = p.then((d => {
  錄.讀[路] = d;
  return d;
 }));
 _範快.set(路, p);
 return p;
}

async function 類索引(類) {
 const d = await _讀(基底() + encodeURIComponent(類) + "/_索引.json");
 return d && d.清單 || [];
}

async function 類資料(類, 名, 資料檔) {
 const 路 = String(名).split("/").map(encodeURIComponent).join("/");
 return _讀(基底() + encodeURIComponent(類) + "/" + 路 + "/" + (資料檔 || "資料.json"));
}

async function 開範本(設定) {
 const 類 = 設定.類別;
 const 本頁 = n => _靜態() ? 靜態路(類, n) : "#/" + encodeURIComponent(類) + "/" + encodeURIComponent(n);
 let KW = "";
 const 挑 = 清單 => {
  const k = KW.trim();
  const hit = k ? 清單.filter((o => String(o.名稱 || o.名).includes(k))).slice(0, 40) : [];
  return `<span class="jump"><input id="kw" placeholder="找別的${esc(類)}…" autocomplete="off" value="${esc(KW)}">\n      ${k ? `<ul>${hit.map((o => `<li><a href="${本頁(o.名)}">${esc(o.名稱 || o.名)}</a>\n        <small>${esc(設定.品質為稀有 ? 稀有字(o.品質) : o.品質 || "")}</small></li>`)).join("") || "<li><a>沒有符合的</a></li>"}</ul>` : ""}</span>`;
 };
 async function 畫(名) {
  全索引();
  載格規();
  載協議(類);
  _對照全();
  備妥零件();
  if (名 && !String(名).startsWith("@")) {
   const 檔 = (typeof 設定.資料檔 === "function" ? 設定.資料檔(名) : 設定.資料檔) || "資料.json";
   類資料(類, 名, 檔);
  }
  const 清單 = 設定.清單轉換 ? await 設定.清單轉換(await 類索引(類)) : 列表清單(類, await 類索引(類));
  const app = document.getElementById("app");
  if (!清單.length) {
   app.innerHTML = `<div class="bad">讀不到 <code>素材/${esc(類)}/_索引.json</code>。<br><br>\n        這張範本<b>不帶任何資料</b>,全部執行時讀素材,所以要用本機伺服器看\n        (<code>http://192.168.1.123:8787/…</code>);直接點開檔案瀏覽器不准讀 json。</div>`;
   return;
  }
  if (!名) {
   const grid = await 快列(類, 清單);
   app.innerHTML = `\n        <div class="bar">${麵包(類)}${挑(清單)}<button class="btn" id="th">深淺色</button></div>\n        <h1 class="title" style="margin:0 0 var(--sp3)">${esc(類)}</h1>\n        <p class="note" style="margin:0 0 var(--sp4)">共 ${清單.length} 筆 · 點一個看詳情</p>\n        ${grid || '<p class="note">這一類還沒有可列的內容</p>'}`;
   document.title = 類 + " · 巡夢圖鑑";
   _錄完();
   return;
  }
  let 變 = null;
  if (名 && String(名).startsWith("@")) {
   const g = String(名).slice(1).split("/");
   const 協 = await 載協議(類);
   const v = 協 && (協.另有 || {})[g[0]];
   if (v && g.length >= 3) 變 = {
    "鍵": g[0],
    v: v,
    "條件值": g[1],
    "名": g.slice(2).join("/")
   };
  }
  const 子命中 = 名 ? 清單.find((o => o.名 === 名)) : null;
  const 這 = 變 ? {
   "名": 名,
   "名稱": 變.名.split("/").pop()
  } : 子命中 || (設定.子項 && 名 && 名.includes("/") ? {
   "名": 名,
   "名稱": 名.split("/").pop(),
   "_子項": true
  } : null) || 清單.find((o => o.名 === 設定.預設名)) || 清單[0];
  let x, 讀路;
  if (變) {
   const 夾 = 變.v.夾.replace("<名>", _段(變.名)).replace("<" + 變.v.條件 + ">", _段(變.條件值));
   讀路 = (window.類基底[變.v.基底類] || 基底()) + 夾 + "/" + (變.v.資料檔 || "資料.json");
   x = await _讀(讀路);
  } else {
   const 檔 = (typeof 設定.資料檔 === "function" ? 設定.資料檔(這.名) : 設定.資料檔) || "資料.json";
   讀路 = 基底() + encodeURIComponent(類) + "/" + String(這.名).split("/").map(encodeURIComponent).join("/") + "/" + 檔;
   x = await 類資料(類, 這.名, 檔);
  }
  if (!x) {
   app.innerHTML = `<div class="bad">讀不到 <code>${esc(decodeURIComponent(讀路))}</code></div>`;
   return;
  }
  if (變) {
   x._變 = 變;
   x[變.v.條件] = x[變.v.條件] || 變.條件值;
  }
  x._名 = 這.名;
  x._索 = 這;
  x._類 = 類;
  if (x.品質 == null && x.類型 && x.類型.品質 != null) x.品質 = x.類型.品質;
  if (x.品質 == null && 這.品質 != null) x.品質 = 這.品質;
  const 頁 = await 設定.分頁(x, 清單);
  const _抬 = 設定.抬頭樣式 ? {
   "樣式": 設定.抬頭樣式,
   "框": false
  } : 設定.抬頭不框 ? {
   "框": false
  } : {};
  const 卡 = 設定.抬頭HTML ? await 設定.抬頭HTML(x) : await 引用塊(Object.assign(變 ? {
   "類": 類,
   "名": 變.名,
   [變.v.條件]: 變.條件值,
   "顯名": false
  } : {
   "類": 類,
   "名": 這.名,
   "顯名": false
  }, _抬));
  const 副 = (設定.副標 ? 設定.副標(x) : []) || [];
  if (window._要開頁) {
   const k = 頁.findIndex((t => t[0] === window._要開頁));
   if (k >= 0) 選中頁籤 = k;
   window._要開頁 = null;
  }
  const _屑段 = String(這.名).split("/");
  const _有條 = new Set([ ...(清單 || []).map((o => o.名)), ...(設定.清單轉換 ? 設定.清單轉換(清單) || [] : []).map((o => o.名)) ]);
  const _屑 = _屑段.map(((seg, i) => {
   const 前 = _屑段.slice(0, i + 1).join("/");
   const 可 = i < _屑段.length - 1 && _有條.has(前);
   const 字 = i === _屑段.length - 1 && /^\d+_/.test(seg) && x && x.名稱 ? x.名稱 : seg;
   return [ 字, 可 ? _靜態() ? 靜態路(類, 前) : "#/" + encodeURIComponent(類) + "/" + encodeURIComponent(前) : null ];
  }));
  app.innerHTML = `\n    <div class="bar">${麵包(類, _屑)}\n      ${挑(清單)}<button class="btn" id="th">深淺色</button></div>\n    <div class="top">\n      <div><div class="art">${卡}</div></div>\n      <div><h1 class="title">${esc(x.名稱 || 這.名稱 || 這.名)}</h1>\n        <p class="kind">${esc([ 設定.副標不帶品質 ? null : 設定.品質為稀有 ? 稀有字(x.品質) : x.品質, ...副 ].filter(Boolean).join(" · "))}</p>\n        <p class="desc">${rich(x.說明 || "")}</p></div></div>\n    <div class="tabwrap"><div class="tabs" role="tablist">${頁.map(((t, i) => `<button class="tab" role="tab" aria-selected="${i === 選中頁籤}" data-tab="${i}">${esc(t[0])}</button>`)).join("")}</div></div>\n    ${頁.map(((t, i) => `<div class="panel" data-pi="${i}"${i === 選中頁籤 ? "" : " hidden"}>${typeof t[1] === "function" ? '<p class="note">載入中…</p>' : t[1]}</div>`)).join("")}`;
  window._延頁 = 頁.map((t => typeof t[1] === "function" ? t[1] : null));
  填頁(選中頁籤);
  _階梯全算();
  _錄完();
 }
 function 路由() {
  let h = location.hash || "";
  try {
   h = decodeURIComponent(h);
  } catch (e) {}
  const pm = h.match(/[?#]頁=([^&#?]+)$/);
  window._要開頁 = pm ? pm[1] : null;
  if (pm) h = h.slice(0, pm.index);
  const m = h.match(new RegExp("^#/" + 類 + "/(.+)$"));
  畫(m ? m[1] : 預載 && !預載.清單模式 && 預載.名 || null);
 }
 addEventListener("hashchange", (() => {
  KW = "";
  選中頁籤 = 0;
  路由();
  scrollTo(0, 0);
 }));
 document.addEventListener("click", (e => {
  const t = e.target.closest("[data-tab]");
  if (t) {
   e.preventDefault();
   切(+t.dataset.tab, true);
   return;
  }
  if (e.target.id === "th") {
   切色();
   路由();
  }
 }));
 document.addEventListener("input", (async e => {
  if (e.target.id !== "kw") return;
  KW = e.target.value;
  const p = e.target.selectionStart;
  const j = document.querySelector(".jump");
  if (j) j.outerHTML = 挑(await 類索引(類));
  const n = document.getElementById("kw");
  if (n) {
   n.focus();
   n.setSelectionRange(p, p);
  }
 }));
 路由();
}

let _延n = 0;

function 延後(p, 佔位) {
 const id = "lz" + ++_延n;
 Promise.resolve(typeof p === "function" ? p() : p).then((h => {
  let 試 = 0;
  const 填 = () => {
   const el = document.getElementById(id);
   if (el) {
    el.outerHTML = h || "";
    _階梯全算();
   } else if (++試 < 40) setTimeout(填, 50);
  };
  填();
 })).catch((e => {
  const el = document.getElementById(id);
  if (el) el.outerHTML = `<div class="bad">${esc(e && e.message || e)}</div>`;
 }));
 return `<div id="${id}" class="note">${佔位 || "載入中…"}</div>`;
}

const _色等 = {};

function 快圖退(img) {
 let c;
 try {
  c = JSON.parse(img.dataset.c || "[]");
 } catch (e) {
  c = [];
 }
 const i = (+img.dataset.i || 0) + 1;
 if (i < c.length) {
  img.dataset.i = i;
  img.src = img.dataset.b + c[i];
 } else if (img.dataset.f !== undefined) img.outerHTML = img.dataset.f; else img.style.visibility = "hidden";
}

const _稀字等 = {
 N: 2,
 R: 3,
 SR: 4,
 SSR: 5,
 UR: 6,
 "幸運": 7
};

async function 快列(類, 清單) {
 const 規 = await 載格規();
 if (規 && 規.等級對色 && !Object.keys(_色等).length) for (const [lv, col] of Object.entries(規.等級對色)) if (_色等[col] == null) _色等[col] = +lv;
 await 備妥零件();
 const 罩 = window.格遮罩 ? `-webkit-mask-image:url('${window.格遮罩}');mask-image:url('${window.格遮罩}');-webkit-mask-size:100% 100%;mask-size:100% 100%` : "";
 const 候選 = 類 === "時裝" ? [ "預覽圖_方.png", "展示圖_縮圖.png", "預覽圖.png" ] : 類 === "畫冊收集" ? [ "標題_縮圖.png", "標題.png" ] : 類 === "夢魘" ? [ "完整素體_縮圖.png", "立繪.png" ] : [ "圖.png", "立繪.png", "縮圖.png", "立繪_縮圖.png" ];
 const cj = esc(JSON.stringify(候選));
 const base = window.素材基底 + encodeURIComponent(類) + "/";
 const 本頁 = n => _靜態() ? 靜態路(類, n) : "#/" + encodeURIComponent(類) + "/" + encodeURIComponent(n);
 const 序 = 稀排(清單 || []);
 return `<div class="objs set">` + 序.map((o => {
  const 路 = String(o.名).split("/").map(encodeURIComponent).join("/");
  const 夾 = base + 路 + "/";
  const 等 = _色等[o.品質] ?? _稀字等[o.稀有度];
  const 框 = 等 != null ? _框路(等, 規) : null;
  const 首 = o.圖 ? base + String(o.圖).split("/").map(encodeURIComponent).join("/") : 夾 + 候選[0];
  const 無圖 = 類 === "歷練" && !o.圖;
  return `<a class="obj" href="${本頁(o.名)}" title="${esc(o.名稱 || o.名)}">` + `<span class="rfi${框 ? "" : " bare"}"${框 ? ` style="background-image:url('${框}')"` : ""}>` + (無圖 ? `<span class="ab">${esc(String(o.名稱 || o.名).slice(0, 2))}</span>` : `<img src="${首}" alt="" loading="lazy"${罩 ? ` style="${罩}"` : ""} data-b="${夾}" data-c="${o.圖 ? "[]" : cj}" data-i="0" onerror="快圖退(this)">`) + `</span>` + `<b>${esc(o.名稱 || o.名)}</b></a>`;
 })).join("") + `</div>`;
}

async function 索引排(類, 清單, 這件名, 標題, 上限, 版, 照給的序) {
 if (!清單 || !清單.length) return "";
 const 序 = 照給的序 ? 清單 : 稀排(清單);
 const a = 上限 ? 序.slice(0, 上限) : 序;
 const 卡 = await Promise.all(a.map((o => 引用塊({
  "類": 類,
  "名": o.名
 }))));
 return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : "") + `<div class="objs set${版 ? " " + 版 : ""}">${卡.map(((h, i) => a[i].名 === 這件名 ? h.replace('class="obj', 'class="obj here') : h)).join("")}</div>` + (上限 && 清單.length > 上限 ? `<p class="note">只列前 ${上限} 個,其餘用上面的搜尋框找。</p>` : "");
}