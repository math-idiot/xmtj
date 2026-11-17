/* 六張範本共用。只做兩件事:
   1. 把任何一筆素材「被引用時」畫成同一個樣子(靠 引用表.js)
   2. 共用的小工具:跳脫、欄位列、分頁
   素材基底:範本/ 底下是 ../素材/;鏡像到 網頁/ 時腳本會改成 素材/ */
window.素材基底 = window.素材基底 || '../../素材/';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rich=s=>esc(s).replace(/&lt;color=#[0-9a-fA-F]{3,8}&gt;([\s\S]*?)&lt;\/color&gt;/g,'<span class="hl">$1</span>');
const has=v=>!(v===null||v===undefined||v===''||(Array.isArray(v)&&!v.length)||
               (typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length));
const NIL='—';
const QN={1:'白',2:'綠',3:'藍',4:'紫',5:'橙',6:'紅',7:'幸運'};
/* ── 一整組東西出現時,一律**稀有度由低排到高** ──────────────
   使用者 2026-11-15 定的規矩:「只要有出現一整組的東西,就是稀有度從低排到高」。
   次序照遊戲自己的品質編號:白1 綠2 藍3 紫4 橙5 紅6 幸運7。
   同稀有度的維持原本順序,有星級的低星在前;查不到品質的排在最後、不動它們的相對順序。 */
const 稀階 = {白:1,綠:2,藍:3,紫:4,橙:5,紅:6,幸運:7, N:2,R:3,SR:4,SSR:5,UR:6,SP:7};
const 稀序 = o => { const q = o && (o.品質 ?? o.稀有度 ?? o.質);
  return (typeof q === 'number') ? q : (稀階[q] ?? 99); };
/* 品質顏色 → 稀有度字母(時裝/珍寶/坐騎/寵物 都用 N/R/SR/SSR/UR,使用者 2026-11-17)。
   對映 = 寵物品質碼 2N/3R/4SR/5SSR/6UR,顏色 綠/白=N、藍=R、紫=SR、橙=SSR、紅/金=UR。
   只改「顯示的字」,不改 x.品質 本身 —— 品質框還是靠顏色挑圖。 */
const _稀字 = {'白':'N','綠':'N','綠色':'N','藍':'R','青':'R','紫':'SR','橙':'SSR','金橙':'SSR','紅':'UR','金':'UR','彩':'UR'};
function 稀有字(色){ return _稀字[色] || 色 || ''; }

const 稀排 = 清單 => (清單 || []).map((o, i) => [o, i])
  .sort((a, b) => 稀序(a[0]) - 稀序(b[0])
              || ((+a[0].星 || 0) - (+b[0].星 || 0))
              || ((+a[0].等級 || 0) - (+b[0].等級 || 0))
              || a[1] - b[1])
  .map(p => p[0]);

const 基底=()=>window.素材基底;
const 品質框=q=>{const n=typeof q==='number'?QN[q]:q; if(!n) return null;
  const m={白:'01_白',綠:'02_綠',藍:'03_藍',紫:'04_紫',橙:'05_橙',紅:'06_紅',幸運:'07_幸運'}[n];
  return m?基底()+'介面/品質框/品質框_'+m+'.png':null;};

/* ── 引用:查得到就畫,查不到就明講「尚未建檔」 ───────────── */
const 查引=(類,名)=>(window.引用表||{})[類+'|'+名]||(window.引用表||{})[名]||null;
function 引用(目標,o){
  o=o||{};
  const e = typeof 目標==='string' ? 查引(o.類||'',目標) : 目標;
  const 名 = (e&&e.名) || o.名 || (typeof 目標==='string'?目標:'?');
  if(!e){
    // 還沒建檔 —— 不要靜靜地不畫,缺什麼要看得見
    return `<span class="obj miss" title="素材裡還沒有這一筆">
      <span class="rfi bare"><span class="ab">?</span></span>
      <b>${esc(名)}</b><i>尚未建檔</i></span>`;
  }
  const 顯 = Object.assign({}, e.顯||{}, o.顯||{});
  const 框 = 顯.品質框!==false ? 品質框(e.質) : null;
  const 圖 = e.圖 ? 基底()+e.路+'/'+e.圖 : null;
  const 量 = o.數量!==undefined&&o.數量!==null&&顯.數量!==false ? o.數量 : null;
  const 附 = [o.附註, (顯.等級&&e.級!=null)?e.級+' 級':null].filter(Boolean).join(' · ');
  const 內 = `<span class="rfi${框?'':' bare'}${o.小?' sml':''}"${框?` style="background-image:url('${框}')"`:''}>${
      圖?`<img src="${圖}" alt="" loading="lazy">`:`<span class="ab">${esc(String(名).slice(0,3))}</span>`}</span>`
    + (量!=null?`<u>${esc(量)}</u>`:'')
    + (顯.名稱!==false?`<b>${esc(名)}</b>`:'')
    + (附?`<i>${esc(附)}</i>`:'');
  const cls='obj'+(o.這件?' here':'')+(o.負?' minus':'');
  if(o.連結!==false&&e.連&&e.連.檔){
    const h = e.連.錨 ? e.連.檔+e.連.錨
            : e.連.檔+'#/'+encodeURIComponent(e.連.類)+'/'+encodeURIComponent(e.連.名);
    return `<a class="${cls}" href="${h}" title="${esc(名)}">${內}</a>`;
  }
  return `<span class="${cls}" title="${esc(名)}">${內}</span>`;
}
const 引用群=(arr,o)=>`<div class="objs">${(arr||[]).map(x=>引用(x.目標??x,Object.assign({},o,x.選項||x))).join('')}</div>`;

/* ── 欄位列 ─────────────────────────────────────────── */
const kv=(k,v)=>`<div class="row"><dt>${esc(k)}</dt><dd>${v??NIL}</dd></div>`;
function rows(defs,x){
  return `<div class="rows">${defs.map(([k,fn])=>{
    let v; try{v=fn(x)}catch(e){v=null}
    if(!has(v)) return kv(k,`<span class="dim">${NIL}</span>`);
    /* 值可能是物件(例 活動限定資源的 資料來源 = {名稱與說明:…, 圖:…})
       —— 直接丟進樣板會變成 [object Object],攤成「鍵:值」。 */
    /* 欄位要塞 HTML(配了圖的那幾欄)就包成 {html:'…'},其餘一律當文字 esc 掉 */
    if(v && typeof v === 'object' && typeof v.html === 'string') return kv(k, v.html);
    if(typeof v === 'object' && !Array.isArray(v))
      v = Object.entries(v).map(([a,b]) => a + ':' + b).join('、');
    else if(Array.isArray(v)) v = v.map(o => typeof o === 'object' ? JSON.stringify(o) : o).join('、');
    return kv(k, typeof v==='string'?rich(v):v);
  }).join('')}</div>`;
}
/* ── 分頁 ───────────────────────────────────────────── */
let 選中頁籤=0;
/* 延後算的分頁(開範本 把函式放在 window._延頁):第一次切到才算,算完就丟掉函式 */
async function 填頁(i){
  const f = (window._延頁 || [])[i];
  if(!f) return;
  window._延頁[i] = null;
  const p = document.querySelector(`.panel[data-pi="${i}"]`);
  try{ const h = await f(); if(p) p.innerHTML = h || '<p class="note">沒有</p>'; _階梯全算(); }
  catch(e){ if(p) p.innerHTML = `<div class="bad">${esc(e && e.message || e)}</div>`; }
}
function 切(i,聚焦){
  選中頁籤=i;
  填頁(i);
  document.querySelectorAll('.tab').forEach((b,k)=>{b.setAttribute('aria-selected',k===i);b.tabIndex=k===i?0:-1;});
  document.querySelectorAll('.panel').forEach((p,k)=>{p.hidden=k!==i;});
  if(聚焦){const t=document.querySelectorAll('.tab')[i]; if(t) t.focus();}
}
/* ── 麵包屑:巡夢圖鑑 / <類> / … ──────────────────────────────
   「巡夢圖鑑」和類別名都連回總覽頁(範本/index.html),在那裡切到別的類。
   使用者 2026-11-15:「麵包屑不能正常作業」→ 先做了下拉選單 →「不要下拉選單」。 */
/* 中段:[[名字, 連結], …],最後一段不給連結 */
function 麵包(類, 中段){
  const 段 = (中段 || []).map(([n, h], i, a) =>
    `<i>/</i>${(h && i < a.length - 1) ? `<a href="${h}">${esc(n)}</a>` : esc(n)}`).join('');
  return `<span class="crumb"><a href="../index.html">巡夢圖鑑</a><i>/</i>`
    + `<a href="${encodeURIComponent(類)}範本.html">${esc(類)}</a>`
    + 段 + `</span>`;
}
/* ── 深淺色 ─────────────────────────────────────────── */
function 切色(){
  const r=document.documentElement;
  const cur=r.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  r.dataset.theme=cur==='dark'?'light':'dark';
}

/* ── 引用群組:有標題的一排圖卡;空的就不畫 ───────────────── */
function 引群(標題,arr,o){
  if(!arr||!arr.length) return '';
  return (標題?`<h3 class="grp">${esc(標題)}</h3>`:'')
    +`<div class="objs">${arr.map(x=>引用(x.名||x.編||'?',Object.assign({
        類:x.類,名:x.名,數量:x.量,附註:x.附註},o||{}))).join('')}</div>`;
}
/* ── 去處 / 反查:也要能點,不是純文字 ─────────────────── */
function 去處板(R){
  let h='';
  if(R.去處&&R.去處.length) h+=`<h3 class="grp">遊戲標示的去處</h3>
    <div class="objs">${R.去處.map(x=>引用(x.名,{類:x.類,名:x.名,附註:x.條件||null})).join('')}</div>`;
  if(R.歷練取得&&R.歷練取得.length) h+=`<h3 class="grp">歷練</h3><div class="objs">${
    R.歷練取得.map(e=>(e.事件||[]).map(n=>引用(n,{類:'歷練',名:n,附註:(e.地圖||[])[0]||null})).join('')).join('')
    ||'<span class="dim">—</span>'}</div>`;
  // 反查列的是**設定表的表名**(DropLib / ShopDefine…),那是出處不是物件,
  // 畫成圖卡會一片「尚未建檔」—— 用文字列就好。
  if(R.反查來源&&R.反查來源.length) h+=`<h3 class="grp">來源</h3><div class="ways">${
    R.反查來源.map(x=>`<span class="way"><b>${esc(x.名)}</b></span>`).join('')}</div>`;
  if(R.反查&&R.反查.length) h+=`<h3 class="grp">反查到的設定表</h3><div class="ways">${
    R.反查.map(x=>`<span class="way"><b class="mono">${esc(x.名)}</b>${
      x.筆數?`<span class="c">${x.筆數} 筆</span>`:''}${x.信心?`<span class="c">${esc(x.信心)}</span>`:''}</span>`).join('')}</div>
    <p class="note">這一列是掃全部設定表的獎勵欄找出來的「哪張表會發這個東西」,是出處不是玩法名。</p>`;
  return h;
}
const 指令板=x=>x.請求獲取指令
  ?`<div class="cmd">${esc(x.請求獲取指令.格式)}<br><b>${esc(x.請求獲取指令.範例)}</b></div>
    <p class="note">${esc(x.請求獲取指令.說明||'')}</p>`:'';

/* ── 獲取:設定表的 GetWay 途徑 + 從敘述文字推斷的來源 ─────── */
function 獲取板(x){
  let h='';
  const g=x.獲取途徑||x.獲取||[];
  if(g.length) h+=`<h3 class="grp">設定表的去處</h3><div class="objs">${
    g.map(o=>引用(o.功能||o.名稱,{類:'玩法',名:o.功能||o.名稱,
      附註:o.開啟條件||null})).join('')}</div>
    ${g.some(o=>o.說明)?`<p class="note">${esc(g.map(o=>o.說明).filter(Boolean).join(' / '))}</p>`:''}`;
  const t=x.獲取推斷;
  if(t) h+=`<h3 class="grp">從敘述文字推斷</h3><div class="objs">${
    引用(t.來源,{類:'活動',名:t.來源,附註:t.方式})}</div>
    <p class="note">原句「${esc(t.原句||'')}」。${esc(t.依據||'')} ${esc(t.待確認||'')}</p>`;
  return h;
}

/* ── 名字 → 它是哪一類的哪一筆 ──────────────────────────────
   素材裡的「來源/去處」只給名字,不給分類。以前是用字面猜(看到「·」就當夥伴、
   看到「(開出)」就當道具),猜不到的就畫成一張「尚未建檔」。
   現在一律拿名字去**各類的索引**對:對得到就走協議畫成跳得過去的方塊,
   對不到就誠實列成文字,不假裝它是個物件。
   同名跨類的(全庫 245 種編號撞號,名字也會撞)優先選有協議的那一類。 */
let _全索;
function 全索引(){
  if(!_全索) _全索 = (async () => {
    const top = await fetch(基底() + '_索引.json').then(r => r.ok ? r.json() : null).catch(() => null);
    const 類表 = (((top || {}).清單) || []).map(c => c.名 || c.類 || c).filter(Boolean);
    const m = new Map();
    await Promise.all(類表.map(async 類 => {
      let L = [];
      try{ L = await 類索引(類); }catch(e){}
      for(const o of (L || [])){
        /* 別名:同一個東西在不同設定表叫不同名字(招募卡池 RecruitPool.name 是
           「祈願守護」,但道具的 get_way → GetWay 叫「祈願珍寶」)。
           兩個名字都要對得到同一筆,不然引用就斷在那裡。 */
        const 別 = Array.isArray(o.別名) ? o.別名 : (o.別名 ? [o.別名] : []);
        for(const k of new Set([o.名稱, o.名, ...別].filter(Boolean))){
          if(!m.has(k)) m.set(k, []);
          m.get(k).push({類, 名:o.名});
        }
        if(o.編號 != null){
          const nk = '@號@' + 類 + '@' + o.編號;
          if(!m.has(nk)) m.set(nk, []);
          m.get(nk).push({類, 名:o.名, 種類:o.種類, 星:o.星});
        }
        /* 兩層的類(裝備 琉璃冠/1星、飾框 天幕/一念枯榮)另外記一份父夾鍵,
           別的地方只寫父夾名字時(組合的成員就是)才對得到。排序交給 稀排/星序。 */
        const 父 = String(o.名).includes('/') ? String(o.名).split('/')[0] : null;
        if(父){
          const pk = '@父@' + 父;
          if(!m.has(pk)) m.set(pk, []);
          m.get(pk).push({類, 名:o.名, 星:o.星});
        }
      }
    }));
    return m;
  })();
  return _全索;
}
let _對照檔;
function _對照全(){
  if(!_對照檔) _對照檔 = fetch(window.協議基底 + '_來源對照.json')
    .then(r => r.ok ? r.json() : null).catch(() => null).then(d => d || {});
  return _對照檔;
}
const 來源對照 = async () => ((await _對照全()).規則) || [];
/* 設定表名 → 類(RecruitPool → 招募):項目帶 來源表 時用 */
const 表對類 = async 表 => (((await _對照全()).表) || {})[表] || null;
/* 名字不是物件名的時候(商店上架、貼紙集換·年節小吃、掉落庫 87036)查對照表。
   回 {類,名} 代表「它其實是這一類的這一筆」;回 {類:''} 代表「這不是物件,畫文字」。 */
async function 對照(名){
  for(const r of await 來源對照()){
    let re; try{ re = new RegExp(r.比對); }catch(e){ continue; }
    const m = re.exec(名);
    if(!m) continue;
    if(!r.類) return {類:''};
    const n = String(r.名 || '$0').replace(/\$(\d)/g, (_, i) => m[+i] || '');
    return {類:r.類, 名:n};
  }
  return null;
}

async function 找物(名){
  let k = String(名 == null ? '' : 名).trim();
  if(!k) return null;
  const 索 = await 全索引();
  const 挑 = async hit => {
    for(const h of hit){ if(await 載協議(h.類)) return h; }   // 有協議 = 畫得出來也點得進去
    return hit[0] || null;
  };
  if(索.has(k)) return 挑(索.get(k));
  /* 反查來源寫成「七夕頭像裝扮禮盒(開出)」,括號是我自己加的註記不是名字的一部分 */
  const 去括 = k.replace(/[((](開出|開出內容|掉落|來源待查)[))]\s*$/, '').trim();
  if(去括 !== k && 索.has(去括)) return 挑(索.get(去括));
  /* 遊戲的敘述常常是「<類別>「<名字>」」:好感獎勵寫 表情「約嗎」,
     真正的名字只有引號裡那段(約嗎 在 素材/貼圖)。
     引號有全形「」『』和半形 "" 幾種寫法,都剝一次。
     使用者 2026-11-16:「夥伴那邊引用不到」。 */
  const 引號 = /[「『"']([^「」『』"']+)[」』"']/.exec(k);
  if(引號 && 索.has(引號[1])) return 挑(索.get(引號[1]));
  /* 指到父夾的(組合寫「琉璃冠」,但裝備是一星一筆 琉璃冠/1星)→ 給最低星那一筆 */
  const 子 = 索.get('@父@' + 去括);
  if(子 && 子.length) return 挑([...子].sort((a, b) => (+a.星 || 0) - (+b.星 || 0)));
  /* 還是對不到 → 查 範本/_來源對照.json(商店上架那種系統講法) */
  const 對 = await 對照(去括);
  if(對 && 對.類){
    const 再 = 索.get(對.名);
    if(再) return 挑(再);
    return {類:對.類, 名:對.名, 缺:true};   // 那一類素材還沒建 → 畫成「尚未建檔」但分類是對的
  }
  return null;
}

/* ── 獎勵碼 → 物件 ──────────────────────────────────────────
   `<類型>_<編號>_<數量>`,類型定義在 ConstDefine 的 ResNumType。坑:
     兩段且第一格是資源編號   10_6            = 靈玉 ×6(10 靈玉 / 126 精塵 / 301 銀兩)
     四段且類型 15           15_200031_3_1   = 裝備多一段星級
     三段且類型 215          215_4022_2592000 第三格是秒數不是數量
     類型 2(道具)在素材被拆成道具/寶石/精粹/碎片/花/資源,編號要跨這幾類找
   對不到就回 null,呼叫端照原碼列文字 —— 不要瞎猜。 */
const 獎勵類型 = {'2':'道具','14':'夥伴','15':'裝備','17':'精粹','44':'飾框','117':'寵物','122':'珍寶','215':'飾框'};
const 道具系 = ['道具','寶石','精粹','碎片','花','珍藏碎片','意志','資源'];
const 限種類 = {'44':['頭像框','聊天氣泡','宮牌','天幕','頭像'], '215':['稱號']};
let _資源號;
async function 資源編號表(){
  if(!_資源號) _資源號 = (async () => {
    const m = new Map();
    for(const o of await 類索引('資源')) if(o.資源編號 != null) m.set(String(o.資源編號), o.名);
    return m;
  })();
  return _資源號;
}
async function 解獎勵(碼){
  const s = String(碼 == null ? '' : 碼).trim();
  if(!/^\d+(_\d+)*$/.test(s)) return null;
  const g = s.split('_');
  const 索 = await 全索引();
  const 查號 = (類, 號, 種) => {
    const a = 索.get('@號@' + 類 + '@' + 號) || [];
    const b = 種 ? a.filter(o => 種.includes(o.種類)) : a;
    return b[0] || null;
  };
  const 資 = await 資源編號表();
  if(g.length === 2 && 資.has(g[0])) return {類:'資源', 名:資.get(g[0]), 量:+g[1]};
  if(g[0] === '15' && g.length === 4){
    const h = 查號('裝備', g[1]);
    if(!h) return null;
    return {類:'裝備', 名:String(h.名).split('/')[0] + '/' + g[2] + '星', 量:+g[3]};
  }
  const 類 = 獎勵類型[g[0]];
  if(!類 || g.length < 2) return null;
  const 量 = (g.length >= 3 && g[0] !== '215') ? +g[2] : 1;
  const 候 = (g[0] === '2') ? 道具系 : [類];
  for(const c of 候){
    const h = 查號(c, g[1], 限種類[g[0]]);
    if(h) return {類:c, 名:h.名, 量};
  }
  return null;
}
/* 一串獎勵碼(逗號分隔)→ 一排引用;解不開的照原碼列文字 */
async function 獎勵排(碼串, 標題){
  const 段 = String(碼串 || '').split(',').map(x => x.trim()).filter(Boolean);
  if(!段.length) return '';
  const 結 = await Promise.all(段.map(async s => {
    const r = await 解獎勵(s);
    return r ? {卡: await 引用塊({類:r.類, 名:r.名, 量:r.量 > 1 ? r.量 : null})}
             : {文: `<span class="way"><b class="mono">${esc(s)}</b></span>`};
  }));
  const 卡 = 結.filter(r => r.卡).map(r => r.卡), 文 = 結.filter(r => r.文).map(r => r.文);
  return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : '')
    + (卡.length ? `<div class="objs fam">${卡.join('')}</div>` : '')
    + (文.length ? `<div class="ways">${文.join('')}</div>` : '');
}
/* 一排「名字」:對得到的畫成引用方塊,對不到的列文字。 */
async function 名字排(項, 標題, 修){
  /* 量跟著那一筆走 —— 給引用塊疊在格子裡(遊戲就是數字疊在格子上,沒有 ×)。
     呼叫端不要自己拼 '×N' 塞進附註,那樣只有找不到的那幾筆才看得到,而且會長出 ×。
     設定表有些欄位本來就寫成「金錠×10」這種一串,所以這裡順手拆開,
     拆完是引用 + 數字,不是一行字。 */
  const _拆量 = s => {
    const t = String(s).trim();
    /* 有 × 的:「夥伴經驗×4000」。沒 × 直接黏數字的也要拆:「金錠20」。
       但名字本身結尾就是數字的不能拆(「1級攻擊寶石」結尾不是數字,沒事;
       真的以數字結尾的物件極少,所以只在「拆完剩下的名字非空」時才拆)。 */
    let m = /^(.+?)\s*[×xX*]\s*([\d,]+)$/.exec(t);
    if(!m) m = /^(.+?[^\d\s])\s*([\d,]{1,9})$/.exec(t);
    return m && m[1].trim() ? {名: m[1].trim(), 量: m[2].replace(/,/g, '')} : {名: t};
  };
  const 一 = (項 || []).map(it => typeof it === 'string'
      ? _拆量(it) : Object.assign(_拆量(it.名稱 || it.名 || it.功能 || ''),
                   it.量 != null ? {量: it.量} : (it.數量 != null ? {量: it.數量} : {}),
                   {附: it.附 || it.開啟條件 || it.條件 || it.備註}));
  const 有名 = 一.filter(o => o.名);
  if(!有名.length) return '';
  /* 平行:一個一個 await 會慢到一頁要好幾秒 */
  const 結 = await Promise.all(有名.map(async o => {
    const h = await 找物(o.名);
    const 額 = {類:h ? h.類 : null, 名:h ? h.名 : o.名};
    if(o.量 != null && o.量 !== '') 額.量 = o.量;
    if(o.附) 額.附註 = o.附;
    /* 對不到素材就畫缺塊「尚未建檔」,不要降級成一行字 ——
       使用者 2026-11-16:「就給他說尚未建檔就好」。 */
    return h ? {卡: await 引用塊(Object.assign(額, 修 || {}))}
             : {卡: _缺塊({名: o.名 + (o.量 ? ' ' + _量字(o.量) : '')}, '素材裡還沒有這一筆')};
  }));
  const 卡 = 結.filter(r => r.卡).map(r => r.卡), 文 = 結.filter(r => r.文).map(r => r.文);
  return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : '')
    + (卡.length ? `<div class="objs fam">${卡.join('')}</div>` : '')
    + (文.length ? `<div class="ways">${文.join('')}</div>` : '');
}

/* ── 獲取方式:每一個來源名都對到它是哪一類,依類分組 ──────────────
   使用者 2026-11-15:「裝備的獲取方式就分兩種,道具跟活動」「有提到資源/地圖/活動/夥伴等等這些都要引用」。
   推廣成:所有來源 → 找物() 對到類 → 依類分組畫成引用;對不到的才列文字。
   來源有四處:獲得途徑.遊戲標示(遊戲裡「可前往×××」那排)、反查來源、反查來源明細、歷練取得(事件)。
   頁面上不放「反查結論」「獎勵碼說明」這種過程說明 —— 使用者要的是結果。 */
const 組序 = ['道具','活動','商店','歷練','夥伴','寵物','珍寶','裝備','資源','地圖'];
async function 獲取頁(x){
  const 收 = [];
  const 標 = (x.獲得途徑 && x.獲得途徑.遊戲標示) || x.獲取途徑 || x.獲取 || [];
  for(const g of 標) 收.push({名: (g && (g.名稱 || g.功能)) || g, 附: g && g.開啟條件});
  for(const s of (x.反查來源明細 || [])) 收.push({名: s.名稱});
  for(const s of (x.反查來源 || [])) 收.push({名: s});
  /* 有些類把取得方式寫在別的欄:能力/表情符號/貼圖的 取得方式·獲取說明、
     碎片/道具的 獲得途徑.正向來源[].來源(確證的)、獲得途徑.反查[].名稱。
     不收這幾處的話,那幾類的「獲取」整頁都是空的(能力 92/114、表情符號 35/35)。 */
  const 途 = x.獲得途徑 || {};
  for(const r of (途.正向來源 || [])) if(r && r.來源) 收.push({名: r.來源, 附: r.信心 && r.信心 !== '確證' ? r.信心 : null});
  /* 玩法來源:去那個玩法自己的獎勵表翻出來的,能寫到第幾關。
     跟 遊戲標示(get_way → GetWay)不一樣,兩邊都權威,同名就只留一筆。
     例:精粹的 get_way 只寫「精粹商城」,但 EliteSummit.show_reward 確實會發 —— 那就是名士之爭。
     一個東西常常好幾關都會掉,所以照玩法收攏成一筆,附註寫在哪幾關。 */
  const 玩 = new Map();
  for(const r of (x.玩法來源 || [])) if(r && r.玩法){
    if(!玩.has(r.玩法)) 玩.set(r.玩法, []);
    玩.get(r.玩法).push(r);
  }
  /* **引用只寫那個玩法本身,不掛關卡/首領/等級**
     (使用者 2026-11-16:「引用活動不應該帶等級…除非把每個等級分成名仕的子活動」)。
     等級是「第幾關」的屬性,不是這個玩法的屬性 —— 要精確到關,
     得先讓每一關各自成為一筆素材,再引用那一筆。哪一關給什麼寫在玩法自己那一頁。 */
  for(const [名] of 玩) 收.push({名});
  /* 反查的名稱只在**沒有別的來源**時才拿來墊底。
     使用者 2026-11-16:「氣運怎麼能獲得寶石」—— 寶石的官方登記(ItemDefine.get_way → GetWay)
     只有「進行歷練」,氣運是反查掃到同一個掉落庫掃出來的雜訊。
     但有 64 筆(時裝 46、道具 16…)整頁只剩反查,全砍會變空白,所以是墊底不是刪掉。 */
  if(!收.length) for(const r of (途.反查 || [])) if(r && r.名稱) 收.push({名: r.名稱});
  const 說 = [].concat(x.獲取說明 || []).filter(t => typeof t === 'string');
  for(const t of 說) 收.push({名: t});
  /* 取得方式 常常只是 獲取說明 加「獲得」兩個字(心醫等級技能選擇 / 心醫等級技能選擇獲得),不要重複列 */
  if(typeof x.取得方式 === 'string' && !說.some(t => x.取得方式.startsWith(t))) 收.push({名: x.取得方式});
  if(typeof x.取得途徑 === 'string') 收.push({名: x.取得途徑});   // 稱號:IdentityDefine.get_way → GetWay
  if(x.獲取推斷 && x.獲取推斷.來源) 收.push({名: x.獲取推斷.來源});
  const 見 = new Set(), 組 = new Map(), 文 = [];
  const 放 = (類, r) => { if(!組.has(類)) 組.set(類, []); 組.get(類).push(r); };
  /* 活動限定的東西:所屬活動本身就是來源;活動來源 是那個活動底下哪幾個子活動會給 */
  if(x.所屬活動){
    for(const a of (x.活動來源 || [])) 放('活動', {類:'活動', 名:a.活動, 附註:a.說明 || null});
    放('活動', {類:'活動', 名:x.所屬活動, 附註:'所屬活動'});
    (x.活動來源 || []).forEach(a => 見.add('活動|' + a.活動)); 見.add('活動|' + x.所屬活動);
  }
  /* 同一件事被記了兩次:歷練取得 的事件名「內廷贈寶」+ 反查來源 的「內廷贈寶歷練」。
     後面那個是反查自己接上去的,接的字就是類別名,去掉後跟前面一樣就不重複列。 */
  const 全名 = new Set(收.map(o => String(o.名 || '').trim()).filter(Boolean));
  for(const e of (x.歷練取得 || [])) for(const ev of (e.事件 || [])) 全名.add(String(ev).trim());
  const 去 = [];
  for(const o of 收){
    const n = String(o.名 || '').trim();
    if(!n || /待查/.test(n) || 見.has(n)) continue;
    if(n.length > 2 && n.endsWith('歷練') && 全名.has(n.slice(0, -2))) continue;
    見.add(n); 去.push({n, 附: o.附});
  }
  const 對 = await Promise.all(去.map(o => 找物(o.n)));   // 平行
  去.forEach((o, i) => {
    const h = 對[i];
    if(h && h.類){
      const k = h.類 + '|' + h.名;
      if(見.has(k)) return; 見.add(k);
      放(h.類, {類: h.類, 名: h.名, 附註: o.附 || null});
    } else 文.push(o.n);
  });
  /* 歷練取得:事件名就是歷練的一筆(歷練還沒建檔,會畫成「尚未建檔」),附註寫在哪張地圖 */
  for(const e of (x.歷練取得 || []))
    for(const ev of (e.事件 || [])){
      const k = '歷練|' + ev;
      if(見.has(k)) continue; 見.add(k);
      放('歷練', {類: '歷練', 名: ev, 附註: (e.地圖 || []).join('、') || null});
    }
  /* 道具 / 活動 / 商店 / 歷練 四組**固定畫**,沒有就寫「沒有」—— 每一筆顯示的東西一樣。
     其他類(夥伴、寵物…)有才畫。 */
  const 固定 = ['道具','活動','商店','歷練'];
  const 類序 = [...new Set([...固定, ...[...組.keys()].sort((a, b) =>
    ((組序.indexOf(a) + 1) || 99) - ((組序.indexOf(b) + 1) || 99))])];
  if(!組.size && !文.length) return '';
  let h = '';
  for(const 類 of 類序)
    h += 組.has(類) ? await 引用排(組.get(類), 類) : `<h3 class="grp">${esc(類)}</h3><p class="note">沒有</p>`;
  if(文.length) h += `<h3 class="grp">其他</h3><div class="ways">${
    文.map(n => `<span class="way"><b>${esc(n)}</b></span>`).join('')}</div>`;
  return h;
}

/* ── 用途:拿去哪裡用 ──────────────────────────────────────────
   用途.前往 / 用途.被消耗於 / 活動限定資源的 用在哪。有名字的走引用,只有設定表名的列文字
   (表名對照對不到中文名的不編名字)。 */
async function 用途頁(x){
  const u = (x.用途 && typeof x.用途 === 'object' && !Array.isArray(x.用途)) ? x.用途 : {};
  const 項 = [...(u.前往 || []), ...(u.被消耗於 || [])];
  const 名 = [], 表 = [], 定 = [];
  for(const o of 項){
    if(typeof o === 'string'){ 名.push({名: o}); continue; }
    const 類 = o.來源表 ? await 表對類(o.來源表) : null;
    if(o.名稱 && 類) 定.push({類, 名: o.名稱, 顯類型:false});
    else if(o.名稱) 名.push({名: o.名稱});
    else if(o.來源表) 表.push(o.來源表 + (o.欄位 ? '.' + o.欄位 : ''));
  }
  /* 前往 跟 被消耗於 常常是同一個名字(邀約帖:夥伴邀約),定了類的那邊為準,不要重複 */
  const 已 = new Set(定.map(r => r.名));
  for(let i = 名.length - 1; i >= 0; i--) if(已.has(名[i].名)) 名.splice(i, 1);
  /* 用在哪是原句;已經拆成 活動用途 的就不要再印原句 */
  const 在 = x.活動用途 ? null : x.用在哪;
  if(Array.isArray(在)) 在.forEach(n => 名.push({名: (n && (n.名稱 || n.名)) || n}));
  else if(typeof 在 === 'string') 名.push({名: 在});
  /* 活動限定的東西:用在那個活動的哪幾個子活動 */
  /* 資源被能力吃掉(閱歷/心得/靈感/醫界…):AbilityLevel.items 算出來的,
     轉移那 114 個全部吃閱歷,列出來會洗版 —— 轉移只寫一句,升級的才畫引用。 */
  const 能 = (x.能力用途 || []).filter(o => o.用在 !== '轉移').map(o => ({類:'能力', 名:o.能力, 顯類型:false}));
  const 轉 = (x.能力用途 || []).filter(o => o.用在 === '轉移').length;
  const 活 = [...(x.活動用途 || []).map(a => ({類:'活動', 名:a.活動, 附註:a.說明 || null, 顯類型:false})), ...定];
  let h = 活.length ? await 引用排(活, '拿去哪裡用') : '';
  if(名.length) h += await 名字排(名, 活.length ? null : '拿去哪裡用');
  if(能.length) h += await 索引排('能力', 能.map(o => ({名:o.名})), null, '升級這些能力');
  if(轉) h += `<p class="note">另外,全部 ${轉} 個能力的「轉移」都花這個。</p>`;
  if(表.length) h += `${(名.length || 活.length) ? '' : '<h3 class="grp">拿去哪裡用</h3>'}<div class="ways">${
    [...new Set(表)].map(t => `<span class="way"><b class="mono">${esc(t)}</b></span>`).join('')}</div>`;
  const 堆 = u.堆上去會發生什麼;
  if(Array.isArray(堆) && 堆.length) h += `<h3 class="grp">效果</h3><ul class="bul">${
    堆.map(t => `<li>${rich(String(t))}</li>`).join('')}</ul>`;
  return h;
}

/* ── 條件細項:解鎖條件那種「成長等級 247 + 鎮魘塔 560 層」 ── */

/* 一筆物件底下有好幾張圖(權位:名牌 + 徽章 + 圖示)時,一起畫出來 */
function 圖組(x){
  const g=x.圖片; if(!g||typeof g!=='object') return '';
  const 路=x._素材; if(!路) return '';
  if(Array.isArray(g)) return '';
  const 項=Object.entries(g).filter(([k,v])=>typeof v==='string'&&v.endsWith('.png'));
  if(!項.length) return '';
  return `<h3 class="grp">這一筆的圖</h3><div class="objs">${項.map(([k,v])=>
    `<span class="obj"><span class="rfi bare"><img src="${window.素材基底+路+'/'+v}" alt="" loading="lazy"></span>
      <b>${esc(k)}</b><i class="mono">${esc(v)}</i></span>`).join('')}</div>`;
}


/* ══════════════════════════════════════════════════════════════════
   協議驅動的引用器(2026-11-15)

   使用者:「我要的是同一個東西不管在哪一張範本出現,在引用上的視覺是一樣的。
            這就是我的協議的用途。」

   流程(方向不要搞反):
     引用方 → 呼叫目標類型的協議 協議_<類>.json
            → 協議去被引用方的夾抓它要的東西
            → 在引用方畫出跳轉方塊
   **被引用方不決定自己長什麼樣。** 畫法只定義在協議一個地方。

   引用方只給 {類, 名, 量, 樣式…};名 是指向(可多層,例 青竹腕/1星),
   其餘是修飾(不影響跳轉)。

   顯示開關(都可省略,省略就用協議的 修飾預設,再沒有就用協議的「畫」):
     框      要不要畫品質框     (對應遊戲的 hide_quality)
     顯量    要不要畫數量字     (對應遊戲的 b_show_num)
     顯名    要不要畫名字       (對應遊戲的 b_show_name)
     顯圖 / 顯等級 / 顯類型
   **全部有無傳入保護** —— 少給、給 undefined、協議沒寫,都不會壞。

   舊的 引用() 留著不動 —— 還有 11 張範本在用,一張一張換過來。
   ══════════════════════════════════════════════════════════════════ */

window.協議基底 = window.協議基底 || '../';          // 協議檔跟範本同層
/* 某一類暫時不在 素材/ 底下時用這個蓋過去(例 {活動:'../../雜物/_待進素材/'})。
   **寫在這裡不要寫在各張範本裡**,引用別類的範本才會跟著一致。現在全部都在素材裡,空的。 */
window.類基底 = window.類基底 || {};
/* 預覽還沒搬進素材的活動:網址加 ?pending=1,活動這一類就改讀 雜物/_待進素材/活動/。
   給使用者(和審查)在搬進素材之前先看 xmhd 整理好的活動長怎樣;不加就是正常讀素材。 */
if(/[?&]pending=1/.test(location.search)) window.類基底['活動'] = '../../雜物/_待進素材/';
/* 格子要用的三張遊戲零件。**來源只能是素材** —— 這三張本來指著 雜物/,
   是我自己破的例外;現在一律走 素材/介面/格子零件/:
     格遮罩.png        com_mask_djk0,128×128(素材舊那張 126×126 是裁緊版,會差一圈)
     寶石孔底.png      com_baoshi_0,18×18
     珍寶等級底.png    com_bg_shuliangdi@commonqualitynew,128×32(跟 fpj 那張同名不同張)
   檔案放在 雜物\_類索引\_介面零件\,點 搬進素材.bat 就會進 素材/介面/格子零件/。
   **還沒搬進去的時候要當成沒有**:遮罩用一張讀不到的圖會把整張道具圖遮光,
   所以開畫之前先探一次,讀不到就不套(變成直角,但圖還在)。 */
const 格子零件 = n => 基底() + '介面/格子零件/' + n;
const _有圖檔 = u => new Promise(r => {
  const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u;
});
let _零件好了;
function 備妥零件(){
  if(!_零件好了) _零件好了 = (async () => {
    for(const [k, f] of [['格遮罩','格遮罩.png'], ['寶石孔底','寶石孔底.png'], ['珍寶等級底','珍寶等級底.png']]){
      if(window[k]) continue;                       // 頁面自己指定過就不動
      const u = 格子零件(f);
      window[k] = (await _有圖檔(u)) ? u : null;
    }
  })();
  return _零件好了;
}

const _協議快取 = new Map();
async function 載協議(類){
  if(_協議快取.has(類)) return _協議快取.get(類);
  const p = fetch(window.協議基底 + encodeURIComponent(類) + '/' + encodeURIComponent(類) + '協議.json')
    .then(r => r.ok ? r.json() : null).catch(() => null);
  _協議快取.set(類, p); return p;
}

/* 品質框的規格在 素材/系統/道具格.json —— 協議不重複寫,也不寫死路徑 */
let _格規快取 = null;
async function 載格規(){
  if(_格規快取) return _格規快取;
  _格規快取 = fetch(基底() + '系統/道具格.json')
    .then(r => r.ok ? r.json() : null)
    .then(d => (d && d.網頁端 && d.網頁端.品質框) || {})
    .catch(() => ({}));
  return _格規快取;
}
function _框路(等級, 規){
  const 色 = ((規||{}).等級對色 || {})[String(等級)];
  if(!等級 || !色 || !(規||{}).圖在哪) return null;
  return 基底() + String(規.圖在哪).split('(')[0].trim()
    .replace('<兩位數等級>', String(等級).padStart(2,'0')).replace('<色>', 色);
}

const _段 = 名 => String(名).split('/').map(encodeURIComponent).join('/');
/* 協議的 範本 還沒做的話,連結點下去會 404 —— 探一次(每個類一次,存 sessionStorage),
   沒有就不給連結,卡片照畫。範本做好了自己就會變成跳轉,協議不用改。 */
const _範本在 = new Map();
async function _有範本(類, 連樣){
  if(!連樣) return false;
  const u = String(連樣).split('#')[0];
  if(_範本在.has(u)) return _範本在.get(u);
  let ok = null;
  try{ const c = sessionStorage.getItem('範本在|' + u); if(c != null) ok = c === '1'; }catch(e){}
  if(ok === null){
    const r = await fetch(u, {method:'HEAD'}).catch(() => null);
    ok = !!(r && r.ok);
    try{ sessionStorage.setItem('範本在|' + u, ok ? '1' : '0'); }catch(e){}
  }
  _範本在.set(u, ok); return ok;
}
const _挖 = (o, 路) => String(路).split('.')
  .reduce((a,k) => (a && a[k] !== undefined) ? a[k] : undefined, o);
const _是檔名 = s => /\.(png|jpe?g|webp|gif|svg)$/i.test(s);

/* 協議的「取」:一串候選,由前往後找第一個有值的。
   候選是資料路徑就去挖(挖到的值當檔名);候選本身是檔名就直接用。 */
/* 候選可以是:檔名(直接用)、資料路徑(去挖)、或 @推導(引擎算出來的)。
   會有 @推導 是因為實測各類 json 不整齊 —— 例如 引用 區只有「品質」顏色名、
   沒有「品質原碼」,但品質框要的是等級(enum)。顏色名到處都有,反查就行,
   不必為了這個去改 1,900 筆素材。 */
const _推導 = {
  /* 星級上限 = 那個陣列有幾項。實測各類的欄位名不一樣:
     裝備/珍藏 是 星級(list)、珍寶是 階(int)、寵物是 品質(list,N/R/SR/SSR 四階)。
     所以協議寫 @長度:<路徑>,引擎算長度。 */
  '@長度': null,   // 由 _取 特別處理(帶參數的推導)
  /* 主線章節卡的圖:設定表 MainInstanceFemale.background(plot_icon_NN),
     190 章只共用 9 張 → 集中放 主線/圖/,配 取基準.圖=類夾 */
  '@章節圖': (資料) => {
    const b = _挖(資料, 'background') ?? _挖(資料, '卡片圖');
    return b ? ('圖/' + b + '.png') : null;
  },
  /* 寵物的「品質」不是顏色名,是**四階的陣列**(N/R/SR/SSR,每階不同 id/資質/技能)。
     所以顏色反查取不到,框就畫不出來(使用者 2026-11-15:「寵物有框你沒畫」)。
     改從稀有度轉:對照表在 道具格.json 遊戲端.品質底.稀有度對照。
     取**最高階**當這隻寵物的代表品質 —— 當下是哪一階是玩家狀態,引用端要指定就傳 階。 */
  '@稀有度轉等級': (資料, 夾, 規) => {
    const a = _挖(資料, '引用.品質') ?? _挖(資料, '品質');
    if(!Array.isArray(a) || !a.length) return null;
    const 稀 = {N:2, R:3, SR:4, SSR:5, UR:6, SP:7};
    let 最 = null;
    for(const t of a){ const v = 稀[(t || {}).稀有度]; if(v && (最 === null || v > 最)) 最 = v; }
    return 最;
  },
  /* 組合(時裝套裝那種)沒有自己的圖,用**成員那一套的完整圖縮圖**
     (使用者 2026-11-15:「時裝的組合就放時裝的完整圖縮圖」)。
     路徑相對 素材/ 根,所以協議要配 取基準.圖="素材"。 */
  '@組合圖': (資料) => {
    const 類 = _挖(資料, '組合類型'), 名 = _挖(資料, '名稱');
    if(!名) return null;
    if(類 === '時裝套裝') return '時裝/' + 名 + '/展示圖_縮圖.png';
    return null;
  },
  /* 星級陣列裡的某一欄(寶石孔/基礎屬性…)。要先知道是第幾星 ——
     星號從指向末段解(青竹腕/1星 → 1),所以引擎會把它塞進 資料._星 再呼叫。 */
  '@星級欄': null,   // 帶參數,由 _取 特別處理
  '@品質轉等級': (資料, 夾, 規) => {
    const 色 = _挖(資料,'引用.品質') ?? _挖(資料,'品質');
    if(!色) return null;
    const 對 = (規 || {}).等級對色 || {};
    for(const k of Object.keys(對)) if(對[k] === 色) return +k;
    return null;
  }
};
/* 圖的候選要真的載得起來才算數 —— 不然會畫出破圖。
   素材實測有 38 張是登記了但檔案不在的,那些要退回文字佔位(R7:缺的要看得見)。
   瀏覽器自己會快取,同一張不會重複探。 */
const _圖快取 = new Map();
function _能載(u){
  if(_圖快取.has(u)) return _圖快取.get(u);
  const p = new Promise(ok => { const i = new Image();
    i.onload = () => ok(true); i.onerror = () => ok(false); i.src = u; });
  _圖快取.set(u, p); return p;
}
async function _挑圖(資料, 候選, 夾, 規, 解析){
  for(const c of (候選 || [])){
    let v = _取(資料, [c], 夾, 規);
    // **先套 取基準再探測** —— 不然探到的是還沒解析的相對路徑,一定 404
    if(typeof v === 'string' && 解析) v = 解析(v);
    if(typeof v === 'string' && _是檔名(v) && await _能載(v)) return v;
  }
  return null;
}
function _取(資料, 候選, 夾, 規){
  for(const c of (候選 || [])){
    if(typeof c === 'string' && c[0] === '@'){
      let v;
      if(c.startsWith('@長度:')){          // @長度:星級 → 那個陣列有幾項
        const a = _挖(資料, c.slice(4));
        v = Array.isArray(a) ? a.length : null;
      } else if(c.startsWith('@星級欄:')){   // @星級欄:寶石孔 → 星級[星-1].寶石孔
        const a = _挖(資料, '星級'), k = +(資料._星 || 0);
        v = (Array.isArray(a) && k > 0 && a[k-1]) ? a[k-1][c.slice(5)] : null;
      } else {
        v = (_推導[c] || (()=>null))(資料, 夾, 規);
      }
      if(v !== undefined && v !== null && v !== '') return v;
      continue;
    }
    if(_是檔名(c)) return 夾 + '/' + c;
    const v = _挖(資料, c);
    if(v !== undefined && v !== null && v !== ''){
      return (typeof v === 'string' && _是檔名(v)) ? 夾 + '/' + v : v;
    }
  }
  return null;
}

/* 畫一塊引用。回傳 HTML 字串。 */
async function 引用塊(ref){
  if(!ref || !ref.類 || !ref.名) return '';
  await 備妥零件();
  const 協 = await 載協議(ref.類);
  if(!協 || !協.夾) return _缺塊(ref, '沒有 協議_' + ref.類 + '.json');

  /* 指向的末段可能帶星級(青竹腕/1星)—— 每個星級是不同的裝備,
     所以它是指向不是修飾。這裡把數字解出來給畫星和取星級欄用。 */
  const _末 = String(ref.名).split('/').pop();
  const _末數 = (/^(\d+)星$/.exec(_末) || [])[1];

  /* 協議的「另有」:同一類但放在別的地方(例 活動限定資源在活動自己的夾)。
     引用方給了該變體的「條件」欄位就走那一條。 */
  let 夾樣 = 協.夾, 檔 = 協.資料檔 || '資料.json', 基類 = ref.類, 連樣 = 協.連結;
  for(const v of Object.values(協.另有 || {})){
    if(v && v.條件 && ref[v.條件] != null && ref[v.條件] !== ''){
      夾樣 = v.夾; 檔 = v.資料檔 || 檔; 基類 = v.基底類 || 基類;
      /* 變體放在別的地方,連結也要跟著變 —— 不然會連到不存在的正規路徑
         (活動限定資源 演算符 連到 素材/資源/演算符,那裡根本沒有這一筆)。 */
      if(v.連結) 連樣 = v.連結;
      break;
    }
  }
  /* 依名字層級切資料檔/取欄位:同一類有兩層(時裝:整套名沒有「/」讀 套裝.json、
     部件名帶「/」讀 資料.json)。協議給 層={深度:{資料檔,取}},照 名 的段數挑。
     整套引用用整套的圖、部件引用用部件的圖(使用者 2026-11-17:貼紙冊要引用單一部位)。 */
  let 取規 = 協.取;
  if(協.層){
    const _深 = String(ref.名).split('/').length;
    const L = 協.層[_深] || 協.層[String(_深)];
    if(L){ if(L.資料檔) 檔 = L.資料檔; if(L.取) 取規 = L.取; if(L.連結) 連樣 = L.連結; }
  }
  /* 星級夾已經建好了(裝備/星河冠/5星/ 自己有 資料.json),所以指向直接用,
     **不要再剝掉 N星 回父夾讀** —— 父夾現在沒有 資料.json。 */
  let 路 = 夾樣.replace('<名>', _段(ref.名));
  路 = 路.replace(/<([^>]+)>/g, (m,k) => ref[k] != null ? _段(ref[k]) : m);
  const 基 = (window.類基底[基類] || 基底()) + 路;
  const 資料 = await fetch(基 + '/' + 檔)
    .then(r => r.ok ? r.json() : null).catch(() => null);
  if(!資料) return _缺塊(ref, '素材裡還沒有這一筆');

  // 修飾:引用方給的優先,沒給就用協議的預設
  const 修 = Object.assign({}, 協.修飾預設 || {}, ref);
  if(_末數 != null) 資料._星 = +_末數;   // 給 @星級欄 用
  const 規 = await 載格規();          // 推導(@品質轉等級)要用,所以先載
  /* 取基準:某些類的圖不是放在那一筆自己的夾裡 ——
       類夾 = 整類共用(戰鬥狀態 195 個狀態只有 74 張圖示)
       素材 = 指到別類(組合用成員那一套的縮圖)
     這個要在探測圖之前套,所以先做成一個 resolver。 */
  const 基準 = 協.取基準 || {};
  const _解 = k => v => {
    const b = 基準[k];
    if(!b || typeof v !== 'string') return v;
    const 檔 = v.startsWith(基) ? v.slice(基.length + 1) : v;
    if(b === '素材') return 基底() + 檔;
    if(b === '類夾') return (window.類基底[ref.類] || 基底()) + ref.類 + '/' + 檔;
    return v;
  };
  const V = {};
  for(const k of Object.keys(取規 || {})){
    const c = 取規[k];
    // 「圖」在某些類是依樣式分組的(活動:入口圖/文字/橫幅)
    const 單 = (c && !Array.isArray(c) && typeof c === 'object')
      ? (c[修.樣式] || Object.values(c)[0]) : c;
    V[k] = (k === '圖') ? await _挑圖(資料, 單, 基, 規, _解('圖'))
                        : _解(k)(_取(資料, 單, 基, 規));
  }

  /* 畫哪些元件:協議的「畫」是底線,呼叫端可以逐項關掉或打開。
     這跟遊戲自己的做法一樣 —— 素材/系統/道具格.json 的「遊戲端.呼叫端決定的」
     就列著 b_show_num / b_show_name / hide_quality,同一支流程各畫面傳不同參數。
     三層保護:呼叫端給的 → 協議的 修飾預設 → 這裡的安全預設。 */
  /* 子類覆蓋:同一類底下某個子類畫法不同(例 飾框的天幕不畫品質框,
     但頭像框/稱號/宮牌要畫)。看指向的**第一段**。
     使用者 2026-11-15:「你猜我為什麼要每一種做一個協議,就是因為不要你硬塞」——
     同理,子類也不該被硬塞成跟兄弟一樣。 */
  const _子類 = String(ref.名).split('/')[0];
  const _覆 = (協.子類覆蓋 || {})[_子類] || {};
  const _開 = (名, 底) => {
    const v = (ref[名] !== undefined) ? ref[名]
            : (_覆[名] !== undefined) ? _覆[名]
            : ((協.修飾預設 || {})[名] !== undefined) ? 協.修飾預設[名]
            : 底;
    return v === undefined ? !!底 : !!v;
  };
  const 畫 = Array.isArray(協.畫) ? 協.畫 : ['圖','名稱'];
  const 要 = {
    品質框: _開('框',  畫.includes('品質框')),
    圖:     _開('顯圖', 畫.includes('圖')),
    量:     _開('顯量', 畫.includes('量')),
    名稱:   _開('顯名', 畫.includes('名稱')),
    類型:   _開('顯類型', 畫.includes('類型')),
    序號:   _開('顯序號', 畫.includes('序號')),
    星:     _開('顯星',   畫.includes('星')),
    寶石孔: _開('顯寶石孔', 畫.includes('寶石孔')),
  };
  /* ── 玩家狀態:有傳才畫,沒傳就不畫 ──────────────────────────
     強化等級(30級)、角標(+2)、狀態(裝備中/攜帶中/佩戴中)、數量(931)
     這四樣都是**那個玩家當下的狀態**,不是物件本身的資料 ——
     素材裡永遠不會有,所以不能當協議的預設,否則每個引用都掛一條空的「—級」。
     使用者 2026-11-15:「一樣防無傳入,有傳再畫,沒傳就不畫。」
     星星不在此列 —— 那是物件固有的(裝備 1星/2星 是不同的裝備)。 */
  const _有 = v => v !== undefined && v !== null && v !== '';

  const 框 = 要.品質框 ? _框路(V.等級, 規) : null;
  /* 圖鋪滿格子(128×128),圓角交給遊戲自己的遮罩 com_mask_djk0。
     不要縮圖 —— 圖槽本來就是滿格,縮了是縮兩次。 */
  const 罩 = window.格遮罩 ? ` style="-webkit-mask-image:url('${window.格遮罩}');mask-image:url('${window.格遮罩}')"` : '';
  /* 圖比例(高/寬):協議可以按樣式給,例如夥伴的 全身 是 1.27。
     寫成 CSS 變數 --比,.rfi 的高度跟著它算。 */
  const _比 = (協.圖比例 && (協.圖比例[修.樣式] != null ? 協.圖比例[修.樣式]
              : 協.圖比例[Object.keys(協.圖比例)[0]])) || null;
  const 內 = (要.圖 && V.圖)
    ? `<img${罩} src="${V.圖}" alt="" loading="lazy">`
    /* 沒有圖:名字本來就會畫在格子底下的話,框裡就留空(虛線框自己會說「這裡還沒有圖」)——
       不然同一個名字會出現兩次。沒有要畫名字的場合才把名字寫進框裡,
       而且要切到 6 個字 + 允許換行,切 3 個字會變成「名士之」那種半截
       (使用者 2026-11-16 指出)。 */
    : (要.名稱 ? '' : `<span class="ab">${esc(String(V.名稱 || ref.名 || '?').slice(0,10))}</span>`);

  /* 疊在格子裡的東西 —— 遊戲就是疊在 128 格子裡,不是格子下面另起一行。
     使用者 2026-11-15 拿遊戲截圖對照指出來的。 */
  let 疊 = '';
  /* 強化等級:協議的「畫」決定這一類有沒有等級條,**值由呼叫端給**。
     沒給就畫**空的條**(有遮罩、沒有字)—— 使用者 2026-11-15:
     「等級改成如果不傳入的話就遮罩無字」。
     這樣版面不會因為有沒有等級而跳動,也不會憑空編一個數字出來。 */
  const _等 = _有(ref.強化等級) ? ref.強化等級 : null;
  const 有等級條 = 畫.includes('等級') || _有(ref.強化等級);
  if(_末數 != null && (V.星數 == null || V.星數 === '')) V.星數 = +_末數;
  if(要.星 && V.星數 != null){
    const 上限 = +(V.星上限 ?? V.星數) || 0, 現 = +V.星數 || 0;
    const 亮 = 基底() + '介面/裝備星級/星_亮.png';
    const 暗 = 基底() + '介面/裝備星級/星_暗.png';
    let 顆 = '';
    for(let i = 0; i < 上限; i++)
      顆 += `<i style="left:calc(var(--c) * ${(i * 15.256 / 128).toFixed(5)});background-image:url('${i < 現 ? 亮 : 暗}')"></i>`;
    if(顆) 疊 += `<span class="ov st${有等級條 ? ' up' : ''}">${顆}</span>`;
  }
  /* 數量:遊戲格子裡就是**數字**,沒有 ×(使用者 2026-11-15 拿遊戲畫面對照:
     「人家就沒有那個 x40,40 就是 40」;遊戲字型 FZDocKai 裡也根本沒有 × 這個字形)。
     不能堆疊的類(裝備)例外 —— 遊戲不會在格子裡寫數量,改寫在名字旁邊。 */
  if(要.量 && _有(ref.量) && 協.可堆疊 !== false)
    疊 += `<span class="ov num">${esc(_量字(ref.量))}</span>`;
  if(有等級條){
    /* 三類三套 prefab,底圖還是三張同名不同張的 com_bg_shuliangdi:
         commonfpj        128×32 → 裝備 / 寵物 / 坐騎
         commonqualitynew 128×32 → **珍寶**(border 63/19/63/6,不一樣)
         commonquality    42×20  → 沒人用
       素材現有那張(介面/品質框/其他_com_bg_shuliangdi.png)量出來是 128×32 = fpj 版。
       珍寶那張還在 雜物/,等使用者決定搬進素材。 */
    const 類 = ref.類;
    const 珍 = (類 === '珍寶');
    const 底 = 珍 ? window.珍寶等級底 : (基底() + '介面/品質框/其他_com_bg_shuliangdi.png');
    const 樣 = 珍 ? ' gd' : (類 === '裝備') ? ' eq' : (類 === '坐騎') ? ' car' : '';
    // 坐騎是「N階N級」一個 Text(expert_train_16 = %s階%s級),不是只有級
    const 字 = (_等 === null) ? ''
      : (類 === '坐騎' && _有(ref.階)) ? (ref.階 + '階' + _等 + '級')
      : (_等 + '級');
    疊 += `<span class="ov lv${樣}"${底 ? ` style="background-image:url('${底}')"` : ''}>${
      esc(字)}</span>`;
  }
  /* 寶石孔:裝備專屬。幾格亮 = EquipStar 該星級的 gem_num(資料裡的「寶石孔」欄位)。
     座標來自 compproppart_gem:中心 x=114.7、y 由上而下 111.2/93.2/75.1/57.1、每格 16.96。 */
  if(要.寶石孔){
    const 數 = +(V.寶石孔 ?? 0) || 0;
    if(數 > 0){
      const 底 = window.寶石孔底;
      const Y = [111.2, 93.2, 75.1, 57.1];
      let 孔 = '';
      for(let i = 0; i < Math.min(數, 4); i++)
        孔 += `<i style="top:calc(var(--c) * ${((128 - Y[i]) / 128).toFixed(5)})${
          底 ? `;background-image:url('${底}')` : ''}"></i>`;
      疊 += `<span class="ov gem">${孔}</span>`;
    }
  }
  // 角標:裝備沒有(它是寶石孔跟星),其餘類有傳才畫
  if(_有(ref.角標) && ref.類 !== '裝備')
    疊 += `<span class="ov tag${ref.類 === '珍寶' ? ' gd' : ''}">${esc(ref.角標)}</span>`;
  if(_有(ref.狀態)) 疊 += `<span class="ov bn">${esc(ref.狀態)}</span>`;

  /* 版式=原樣:不是道具格的類(聊天貼圖/表情符號/活動入口圖),
     不套 128 方格的品質框與圓角遮罩,照原比例容納。 */
  const 原 = (協.版式 === '原樣') ? ' raw' : '';
  const _樣 = [框 ? `background-image:url('${框}')` : null,
               (_比 && +_比 !== 1) ? `--比:${_比}` : null].filter(Boolean).join(';');
  const 格 = `<span class="rfi${框 ? '' : ' bare'}${原}"${
      _樣 ? ` style="${_樣}"` : ''}>${內}${疊}</span>`;

  let h = 格;
  /* 序號跟在名字前面(劇情章節:「06 鏡中迷局」) */
  const 號 = (要.序號 && V.序號 != null && V.序號 !== '')
    ? `<span class="no">${esc(V.序號)}</span> ` : '';
  /* 不可堆疊的類(裝備):數量不進格子,寫在名字旁邊 —— 使用者 2026-11-15:
     「需要兩個就在旁邊寫個 ×2,因為裝備不能堆疊」。 */
  const 旁量 = (協.可堆疊 === false && _有(ref.量))
    ? `<span class="q">×${esc(_量字(ref.量))}</span>` : '';
  if(要.名稱 || 號 || 旁量)
    h += `<b>${號}${要.名稱 ? esc(V.名稱 || ref.名) : ''}${旁量}</b>`;
  /* 名字底下那一行:協議的「類型」+ 呼叫端給的附註(機率、條件這種)。
     附註跟數量一樣是呼叫端的事 —— 被引用方不知道自己在別人那邊是幾 % 開出來的。 */
  const 附 = [要.類型 ? V.類型 : null, _有(ref.附註) ? ref.附註 : null].filter(Boolean).join(' · ');
  if(附) h += `<i>${esc(附)}</i>`;

  const 有範 = await _有範本(基類 === ref.類 ? ref.類 : 基類, 連樣);
  const 到 = !有範 ? null : 連樣
    ? 連樣.replace(/<([^>]+)>/g, (m, k) => k === '名' ? _段(ref.名)
        : (ref[k] != null ? _段(ref[k]) : m))
    : null;
  const 題 = esc(V.提示 || V.名稱 || ref.名);
  /* 建檔了、只是還沒有圖:畫成虛線框(跟缺塊同一個樣子,但**不寫「尚未建檔」**,
     因為資料是有的)。不標的話看起來會像壞掉的半成品 —— 使用者 2026-11-16 問的就是這個。 */
  const 缺圖 = (要.圖 && !V.圖) ? ' noimg' : '';
  return 到 ? `<a class="obj${缺圖}" href="${到}" title="${題}">${h}</a>`
            : `<span class="obj${缺圖}" title="${題}">${h}</span>`;
}
/* 等級:協議要求帶,拿不到畫 —(R7 缺的要看得見),不是不畫 */
/* 遊戲裡顯示的是「30級」(語系鍵 common_lv_3 = "%s級"),不是 "Lv 30" */
const _等級字 = V => (V.強化等級 != null && V.強化等級 !== '')
  ? (V.強化等級 + '級') : '—級';

/* 「×2」「x2」「2」都收,格子裡一律畫成 2 */
const _量字 = v => String(v).replace(/^\s*[×xX*]\s*/, '');

function _缺塊(ref, why){
  return `<span class="obj miss" title="${esc(why)}">
    <span class="rfi bare"><span class="ab">?</span></span>
    <b>${esc(ref.名)}</b><i>尚未建檔</i></span>`;
}

/* 資料裡的「變體」= 這一筆所屬的家族(同一系列各品質/各級)。
   變體只給 名稱+編號,要對回索引才知道資料夾叫什麼(同名多筆時編號才分得開)。
   索引有編號就用編號對,沒有就退回用名字對。 */
async function 變體排(類, x, 清單, 標題){
  const v = x.變體 || [];
  if(v.length < 2) return '';
  const 由號 = new Map((清單 || []).filter(o => o.編號 != null).map(o => [String(o.編號), o]));
  const 由名 = new Map((清單 || []).map(o => [o.名稱 || o.名, o]));
  const 見 = new Set(), 出 = [];
  for(const e of v){
    const o = (e.編號 != null && 由號.get(String(e.編號))) || 由名.get(e.名稱);
    if(!o || 見.has(o.名)) continue;
    見.add(o.名); 出.push(o);
  }
  return 索引排(類, 出, x._名, 標題);
}

/* ── 互動式階梯:從 a 練到 b 要花多少 ──────────────────────────
   使用者 2026-11-16:「升級/心途/突破的用跟裝備同一套互動式的,不要用表格」。
   畫面是:起始(− 數字 +) → 中間一排材料格 → 目標(− 數字 +),按了就重算。

   版面與樣式早就在 共用.css 裡(.lvpair/.lvbox/.lvstep/.lvends/.lvt),
   但在這之前沒有任何範本用它 —— 等級分頁一直是表格。

   材料格只畫一次,之後改數字只換格子上疊的那個數 ——
   每次重算都 await 引用塊 會卡,而且材料種類本來就固定。

   opt = {
     鍵:      這一組的 id(同一頁可以有好幾組)
     下限/上限: 數字
     單位:    '級' / '階'
     起始/目標: 預設值
     材料:    [{類, 名}]          固定那幾樣,順序就是畫出來的順序
     算:      (a, b) => ({名: 量}) 從 a 到 b 每一樣要幾個;回傳 0 或缺就不畫數字
     格式:    (值) => 字串           **拉桿上那兩個值**怎麼寫(選填)
     量格式:  (量) => 字串           **材料格上的數字**怎麼寫(選填);銀兩那種九位數縮成「18.7億」
     標:      (值) => 字串           數字底下那行小字(選填);心途用它寫「3 階 10 級」
     料標:    材料那排前面那行小字(選填);預設「要花」,好感那種是「拿到」
     附文:    (a, b) => 字串   材料下面那行**會跟著拉桿變**的小字(選填);能力用它寫研習時間
     註:      下面那行小字(選填)
   } */
const _階梯表 = {};
/* 心醫等級門檻表(共用):列「<動>到哪 → 要心醫幾級」,放在拉桿下面。
   使用者 2026-11-17。各養成表自己帶 心醫門檻:[{到,需}]。 */
let _心醫表;
async function 心醫表(){
  if(_心醫表 === undefined)
    _心醫表 = await fetch(window.素材基底 + '系統/_心醫等級.json').then(r => r.ok ? r.json() : null).catch(() => null);
  return _心醫表;
}
/* 心醫等級「查表型」上限(夥伴升級 / 裝備強化):心醫等級到哪、最高能升到幾級。
   跟 心醫門檻板(逐階 CB)不同,這個是連續上限查表(HangIncomeLv)。使用者 2026-11-17。 */
async function 心醫上限板(欄){
  const r = await 心醫表(); if(!r || !r.變化點) return '';
  return `<h3 class="grp">心醫等級上限</h3>`
    + `<table class="aff"><thead><tr><th>心醫等級</th><th>最高可升到</th></tr></thead><tbody>${
      r.變化點.map(o => `<tr><td>${o.心醫等級起} 級起 · ${esc(o.階級)}</td><td>${o[欄]} 級</td></tr>`).join('')}</tbody></table>`;
}

function 心醫門檻板(列, 動){
  if(!列 || !列.length) return '';
  return `<h3 class="grp">心醫等級門檻</h3>`
    + `<table class="aff"><thead><tr><th>${esc(動)}到</th><th>需要心醫等級</th></tr></thead><tbody>${
      列.map(o => `<tr><td>${esc(o.到)}</td><td>${o.需} 級</td></tr>`).join('')}</tbody></table>`;
}

async function 階梯板(opt){
  const o = Object.assign({單位:'級', 材料:[], 註:null}, opt);
  if(!o.材料.length || typeof o.算 !== 'function') return '';
  /* 素材裡沒有的那一格就不要畫 —— 這是算耗材的工具,畫一個永遠點不進去、
     數字也不會亮的「尚未建檔」格沒有用
     (使用者 2026-11-16:「不在素材裡面的就不用顯示了,他顯示了也沒用」)。
     注意:獲取/好感那些地方還是要留「尚未建檔」,那裡缺什麼要看得見。 */
  const _在 = await Promise.all(o.材料.map(m =>
    類資料(m.類, m.名).then(d => !!d).catch(() => false)));
  o.材料 = o.材料.filter((m, i) => _在[i]);
  if(!o.材料.length) return '';
  _階梯表[o.鍵] = o;
  if(o.樣式 === '拉桿') return _拉桿(o);
  const 格 = await Promise.all(o.材料.map((m, i) =>
    引用塊(Object.assign({}, m, {量: 0, 顯名: true}))));
  const 盒 = (端, v) => `<div class="lvside">
      <span class="lvt">${端 === 'a' ? '從' : '練到'}</span>
      <span class="lvbox">
        <button class="lvstep" data-梯="${esc(o.鍵)}" data-端="${端}" data-走="-1" aria-label="減一">−</button>
        <input type="number" data-梯="${esc(o.鍵)}" data-端="${端}" value="${v}"
               min="${o.下限}" max="${o.上限}" aria-label="${端 === 'a' ? '起始' : '目標'}">
        <i>${esc(o.單位)}</i>
        <button class="lvstep" data-梯="${esc(o.鍵)}" data-端="${端}" data-走="1" aria-label="加一">＋</button>
      </span>
      ${o.標 ? `<span class="lvt" data-梯標="${esc(o.鍵)}" data-端="${端}"></span>` : ''}
      <span class="lvends">
        <button class="lvend" data-梯="${esc(o.鍵)}" data-端="${端}" data-到="min">最小</button>
        <button class="lvend" data-梯="${esc(o.鍵)}" data-端="${端}" data-到="max">最大</button>
      </span>
    </div>`;
  return `<div class="lvpair" data-梯組="${esc(o.鍵)}">
      ${盒('a', o.起始)}
      <div class="lvmid"><span class="lvt">${esc(o.料標 || '要花')}</span>
        <div class="objs fam" data-梯料="${esc(o.鍵)}">${格.join('')}</div></div>
      ${盒('b', o.目標)}
    </div>${o.註 ? `<p class="note">${esc(o.註)}</p>` : ''}`;
}

/* 拉桿版:同一份 opt,換一種畫法。opt.樣式 = '拉桿' 就走這條。
   使用者 2026-11-16 要先看一個樣子再決定要不要套到全部,所以兩種畫法並存。 */
/* 升星的扇形:五瓣各自是預先轉好角度的獨立圖,照 prefab 的座標疊。
   座標出處 素材/介面/突破/_說明.json(comphero_part_cultivate.prefab 的 star1~star5)。

   亮燈規則來自原始碼 luamain/ExpertToolMgr.lua 的 SetAwakeImgStar:
     層 = ceil(星 / 5)                     ExpertAwakeStarFloorNum = 5
     層內 = (星 - 1) % 5 + 1
     第 i 瓣:層內 >= i 就用「這一層的亮燈」,否則用「**前一層的亮燈**」
   所以第 6 星是 1 瓣第二層色 + 4 瓣第一層色 —— 金色會繼續亮著,不是變灰
   (使用者 2026-11-16 問的就是這個)。第一層的暗燈才是真的暗色(xingji2N)。 */
/* 等級圖示:遊戲自己就是把數字畫在那條數量底條上(com_bg_shuliangdi),
   沒有另外的 Lv. 圖。所以這裡把素材現有的那張底條 + 數字組起來
   (使用者 2026-11-16:「把遊戲裡面顯示等級的東西拉出來並且自由組合」)。 */
function 等級圖(數){
  const 底 = window.素材基底 + '介面/品質框/其他_com_bg_shuliangdi.png';
  return `<span class="lvbar" style="background-image:url('${底}')">${
    esc(數 == null ? '' : String(數))}</span>`;
}

/* 裝備/珍寶那種「N 顆星」的圖示:亮的用 星_亮,其餘 星_暗。
   遊戲裡星星是緊密重疊排的(約 65%),這裡沿用 .xs/.xi 那組樣式。 */
/* 突破徽:遊戲裡「突破」不是星星,是物件右上角一個**金色 +N**(使用者 2026-11-17)。
   珍寶、寵物的突破都長這樣。沿用引用塊同一組金色角標樣式(.ov.tag.gd)。
   圖 = 那個物件自己的圖.png;拉桿的圖示槽要同步字串,所以自己組、不走 async 引用塊。 */
function 突破徽(圖, n){
  const m = Math.max(0, +n || 0);
  return `<span class="rfi${圖?'':' bare'}">`
    + (圖 ? `<img src="${圖}" alt="" loading="lazy">` : '')
    + `<span class="ov tag gd">+${m}</span></span>`;
}

function 星圖(數, 上限){
  const 基 = window.素材基底 + '介面/裝備星級/';
  const n = Math.max(0, +數 || 0), 共 = Math.max(n, +上限 || n);
  let h = '';
  for(let i = 0; i < 共; i++)
    h += `<img class="xi${i < n ? '' : ' dim'}" src="${基}星_${i < n ? '亮' : '暗'}.png" alt="">`;
  return `<span class="xs">${h}</span>`;
}

const _扇位 = [[-18.9,-16.0],[-18.9,4.4],[-0.7,8.8],[18.5,4.4],[22.5,-16.0]];
const _扇高 = [32,39,44,39,32];
const _扇層 = ['2', '0', '1'];          // [0]=真的沒亮 [1]=第一層亮 [2]=第二層亮
function 扇形(星, 上限){
  const 基 = window.素材基底 + '介面/突破/';
  const n = Math.max(0, +星 || 0);
  const 層 = n === 0 ? 1 : Math.ceil(n / 5);
  const 層內 = n === 0 ? 0 : (n - 1) % 5 + 1;
  const 亮 = _扇層[Math.min(層, 2)] || '1';
  const 暗 = _扇層[Math.min(層 - 1, 2)] || '2';
  return `<span class="fan">${_扇位.map((p, i) =>
    `<img src="${基}scyc_icon_xingji${層內 >= i + 1 ? 亮 : 暗}${i + 1}.png" alt=""
       style="left:calc(50% + ${p[0] * 0.78}px);bottom:calc(50% + ${p[1] * 0.78 - 6}px);
              transform:translate(-50%,50%);height:${_扇高[i] * 0.78}px">`).join('')}</span>`;
}

async function _拉桿(o){
  const 格 = await Promise.all(o.材料.map(m => 引用塊(Object.assign({}, m, {量:0, 顯名:true}))));
  const R = (端, v) => `<input type="range" data-梯="${esc(o.鍵)}" data-端="${端}"
      min="${o.下限}" max="${o.上限}" value="${v}" step="1"
      aria-label="${端 === 'a' ? '起始' : '目標'}">`;
  const 端鈕 = (端, 到, v) => `<button class="rg-end" data-梯="${esc(o.鍵)}" data-端="${端}"
      data-到="${到}">${到 === 'min' ? '最小' : '最大'} ${esc(o.格式 ? o.格式(v) : v)}</button>`;
  return `<div class="rgbox" data-梯組="${esc(o.鍵)}">
      <div class="rgtop">
        <span class="rgicon" data-梯圖="${esc(o.鍵)}"></span>
        <span class="rgnum">
          <span data-梯數="${esc(o.鍵)}" data-端="a"></span>
          <span class="dash">–</span>
          <span data-梯數="${esc(o.鍵)}" data-端="b"></span>
        </span>
      </div>
      <div class="rgrow">
        ${端鈕('a', 'min', o.下限)}
        <div class="rg">
          <div class="rg-track"></div><div class="rg-fill" data-梯填="${esc(o.鍵)}"></div>
          ${R('a', o.起始)}${R('b', o.目標)}
        </div>
        ${端鈕('b', 'max', o.上限)}
      </div>
      <span class="lvt">${esc(o.料標 || '要花')}</span>
      <div class="objs fam" data-梯料="${esc(o.鍵)}">${格.join('')}</div>
      ${o.附文 ? `<p class="rgsub" data-梯文="${esc(o.鍵)}"></p>` : ''}
    </div>${o.註 ? `<p class="note">${esc(o.註)}</p>` : ''}`;
}

/* 重算:只換材料格上疊的那個數字,不重畫格子 */
function _階梯算(鍵){
  const o = _階梯表[鍵]; if(!o) return;
  const 組 = document.querySelector(`[data-梯組="${CSS.escape(鍵)}"]`); if(!組) return;
  const ia = 組.querySelector('input[data-端="a"]'), ib = 組.querySelector('input[data-端="b"]');
  if(!ia || !ib) return;
  let a = Math.max(o.下限, Math.min(o.上限, +ia.value || o.下限));
  let b = Math.max(o.下限, Math.min(o.上限, +ib.value || o.下限));
  if(b < a) b = a;                      // 目標不能低於起始
  ia.value = a; ib.value = b;
  if(o.標) 組.querySelectorAll('[data-梯標]').forEach(el =>
    el.textContent = o.標(el.dataset.端=== 'a' ? a : b) || '');
  /* 拉桿:畫選取區、更新上面那塊固定位置的圖示與「x – y」 */
  const 填 = 組.querySelector('[data-梯填]');
  if(填){
    const 跨 = Math.max(1, o.上限 - o.下限);
    填.style.left = ((a - o.下限) / 跨 * 100) + '%';
    填.style.right = ((1 - (b - o.下限) / 跨) * 100) + '%';
    組.querySelectorAll('[data-梯數]').forEach(el => {
      const v = el.dataset.端 === 'a' ? a : b;
      /* 格式H 回的是 HTML(數字大、國字小),沒給就照 格式 + 單位 畫 */
      el.innerHTML = o.格式H ? o.格式H(v)
        : `${esc(o.格式 ? o.格式(v) : v)}<i>${esc(o.單位)}</i>`;
    });
    const 圖 = 組.querySelector('[data-梯圖]');
    if(圖 && o.圖) 圖.innerHTML = o.圖(b) || '';
  }
  if(o.附文){ const t = 組.querySelector('[data-梯文]');
    if(t) t.textContent = o.附文(a, b) || ''; }
  const 需 = o.算(a, b) || {};
  const 料 = 組.parentNode.querySelector(`[data-梯料="${CSS.escape(鍵)}"]`)
          || 組.querySelector(`[data-梯料="${CSS.escape(鍵)}"]`);
  if(!料) return;
  [...料.children].forEach((格, i) => {
    const m = o.材料[i] || {};
    /* 量鍵:畫圖還是用 名,但數量照 量鍵 查 —— 兩格畫同一張圖、數量卻不同時用
       (寵物突破:本尊 vs 任意同等寵物,同一個意志圖、數量不一樣。使用者 2026-11-17)。 */
    const 鍵 = m.量鍵 || m.名;
    const n = 需[鍵] || 需[String(鍵).split('/').pop()] || 0;
    /* 數量有兩種畫法:能堆疊的疊在格子裡(.ov.num),
       不能堆疊的(裝備)寫在名字旁邊(.q) —— 兩邊都要更新,
       不然裝備那幾頁永遠停在 ×0。 */
    /* 格式 是給拉桿上那兩個值用的(例「紫 2 星」),**不能拿來寫材料數量** ——
       材料要的是純數字,大數字才縮寫。要另外縮寫就給 量格式。 */
    const 字 = n ? (o.量格式 ? o.量格式(n) : _量字(n)) : '';
    const ov = 格.querySelector('.ov.num');
    if(ov) ov.textContent = 字;
    const q = 格.querySelector('b .q');
    if(q) q.textContent = n ? '×' + 字 : '';
    /* 這一段區間用不到的材料**整格不畫** —— 不是淡掉
       (使用者 2026-11-16 圈的就是那些灰格子:「不用到的就不顯示」)。
       拉桿一動就會重算,要用到的時候自己會回來。 */
    格.style.display = n ? '' : 'none';
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-梯]'); if(!b || b.tagName !== 'BUTTON') return;
  const o = _階梯表[b.dataset.梯]; if(!o) return;
  const inp = document.querySelector(
    `[data-梯組="${CSS.escape(b.dataset.梯)}"] input[data-端="${b.dataset.端}"]`);
  if(!inp) return;
  if(b.dataset.到) inp.value = b.dataset.到 === 'min' ? o.下限 : o.上限;
  else inp.value = (+inp.value || 0) + (+b.dataset.走);
  _階梯算(b.dataset.梯);
});
document.addEventListener('input', e => {
  const i = e.target.closest('input[data-梯]'); if(!i) return;
  _階梯算(i.dataset.梯);
});
/* 畫完要先算一次,不然材料格上是 0。分頁是延後畫的,所以每次畫完都要再掃一遍。 */
function _階梯全算(){
  document.querySelectorAll('[data-梯組]').forEach(el => _階梯算(el.dataset.梯組));
}

/* ── 引用分兩種(使用者 2026-11-15 拿遊戲畫面講的)──────────────
   單獨引用排在一起:各是各的東西(寶箱開出內容、獲取方式的來源),各自可以帶數量。
     → 緊密靠左排、間隔固定、格子不拉寬,長度隨數量變(.objs.fam)
   引用家族:一整組同類的東西(同部位各星、同星各部位)。
     → 走 索引排(),用整組的版面(.objs)
   兩條以前都吐 class="objs",長得一樣 —— 現在分開。 */
async function 引用排(refs, 標題){
  const a = (refs || []).filter(Boolean);
  if(!a.length) return '';
  const 卡 = await Promise.all(a.map(引用塊));
  return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : '')
    + `<div class="objs fam">${卡.join('')}</div>`;
}


/* ══════════════════════════════════════════════════════════════════
   範本外框(2026-11-15)

   10 張範本的外框本來一模一樣(抬頭 + 分頁 + 挑選框 + 路由 + 事件),
   各自複製一份。抽到這裡之後,每張範本只剩自己的 類別 / 副標 / 欄位 / 分頁。

   使用者 2026-11-15:「從現在開始所有的範本和協議裡面不會有焊死的東西,全部改。」
   所以資料一律執行時讀:
     素材/_索引.json          有哪些類(加新類別只改這張)
     素材/<類>/_索引.json     該類全部的東西(已攤平,名帶完整相對路徑)
     素材/<類>/<名>/資料.json 那一筆自己的

   引用一律走協議引擎 —— **包括自己引用自己**(使用者:「自己的範本要引用
   自己的東西也是要透過協議的」),這樣同一個東西在哪張頁面都長一樣。
   ══════════════════════════════════════════════════════════════════ */

const _範快 = new Map();
async function _讀(路){
  if(_範快.has(路)) return _範快.get(路);
  const p = fetch(路).then(r => r.ok ? r.json() : null).catch(() => null);
  _範快.set(路, p); return p;
}
/* 這一類全部的東西(索引)。回陣列,讀不到回空陣列。 */
async function 類索引(類){
  const d = await _讀(基底() + encodeURIComponent(類) + '/_索引.json');
  return (d && d.清單) || [];
}
/* 一筆的完整資料。名可以多層(星河冠/5星)。 */
async function 類資料(類, 名, 資料檔){
  const 路 = String(名).split('/').map(encodeURIComponent).join('/');
  return _讀(基底() + encodeURIComponent(類) + '/' + 路 + '/' + (資料檔 || '資料.json'));
}

/* 開一張範本。
   設定 = {
     類別,                         這張是哪一類
     副標(x)        → [字串…]      標題底下那一行
     欄位 = {資訊:[[標題,取值fn]…], 其他:[…]}
     分頁(x, 清單)  → [[標題, HTML]…]   可以是 async
     預設名?                        沒有 hash 時看哪一筆(不給就用索引第一筆)
   } */
async function 開範本(設定){
  const 類 = 設定.類別;
  const 本頁 = n => '#/' + encodeURIComponent(類) + '/' + encodeURIComponent(n);
  let KW = '';

  const 挑 = 清單 => {
    const k = KW.trim();
    const hit = k ? 清單.filter(o => String(o.名稱 || o.名).includes(k)).slice(0, 40) : [];
    return `<span class="jump"><input id="kw" placeholder="找別的${esc(類)}…" autocomplete="off" value="${esc(KW)}">
      ${k ? `<ul>${hit.map(o => `<li><a href="${本頁(o.名)}">${esc(o.名稱 || o.名)}</a>
        <small>${esc(設定.品質為稀有 ? 稀有字(o.品質) : (o.品質 || ''))}</small></li>`).join('') || '<li><a>沒有符合的</a></li>'}</ul>` : ''}</span>`;
  };

  async function 畫(名){
    /* 清單轉換:某些類的 _索引 是零件層(時裝部件 545 筆),但範本要用的是**套裝層**。
       範本給一個轉換把索引歸成要顯示的清單,**不改素材**(使用者 2026-11-17:不動素材)。 */
    const 清單 = 設定.清單轉換 ? await 設定.清單轉換(await 類索引(類)) : await 類索引(類);
    const app = document.getElementById('app');
    if(!清單.length){
      app.innerHTML = `<div class="bad">讀不到 <code>素材/${esc(類)}/_索引.json</code>。<br><br>
        這張範本<b>不帶任何資料</b>,全部執行時讀素材,所以要用本機伺服器看
        (<code>http://192.168.1.123:8787/…</code>);直接點開檔案瀏覽器不准讀 json。</div>`;
      return;
    }
    /* 列表頁:進一個類但沒指定單筆 → 列出該類全部(使用者 2026-11-17:
       中央入口點一類 → 列出該範本下所有東西,再點一筆進詳情)。 */
    if(!名){
      const grid = await 索引排(類, 清單, null, null);
      app.innerHTML = `
        <div class="bar">${麵包(類)}${挑(清單)}<button class="btn" id="th">深淺色</button></div>
        <h1 class="title" style="margin:0 0 var(--sp3)">${esc(類)}</h1>
        <p class="note" style="margin:0 0 var(--sp4)">共 ${清單.length} 筆 · 點一個看詳情</p>
        ${grid || '<p class="note">這一類還沒有可列的內容</p>'}`;
      document.title = 類 + ' · 巡夢圖鑑';
      return;
    }
    /* 變體指向 @<另有鍵>/<條件值>/<名>(例 @活動資源/弈局萬象/演算符):
       不在這一類的索引裡,資料夾照協議「另有」那一條的 夾 樣板去找 —— 跟引用時是同一條規則。 */
    let 變 = null;
    if(名 && String(名).startsWith('@')){
      const g = String(名).slice(1).split('/');
      const 協 = await 載協議(類);
      const v = 協 && (協.另有 || {})[g[0]];
      if(v && g.length >= 3) 變 = {鍵: g[0], v, 條件值: g[1], 名: g.slice(2).join('/')};
    }
    /* 子項:名帶「/」且不在清單裡(時裝部件)→ 合成一筆,走子項頁(使用者 2026-11-17:
       部件點進去要到**自己的頁**,有自己的詞條)。設定.子項=true 才開。 */
    const 子命中 = 名 ? 清單.find(o => o.名 === 名) : null;
    const 這 = 變 ? {名, 名稱: 變.名.split('/').pop()}
             : (子命中
                || (設定.子項 && 名 && 名.includes('/')
                    ? {名, 名稱: 名.split('/').pop(), _子項: true} : null)
                || 清單.find(o => o.名 === 設定.預設名) || 清單[0]);
    let x, 讀路;
    if(變){
      const 夾 = 變.v.夾.replace('<名>', _段(變.名)).replace('<' + 變.v.條件 + '>', _段(變.條件值));
      讀路 = (window.類基底[變.v.基底類] || 基底()) + 夾 + '/' + (變.v.資料檔 || '資料.json');
      x = await _讀(讀路);
    } else {
      const 檔 = (typeof 設定.資料檔 === 'function' ? 設定.資料檔(這.名) : 設定.資料檔) || '資料.json';
      讀路 = 基底() + encodeURIComponent(類) + '/' + String(這.名).split('/').map(encodeURIComponent).join('/') + '/' + 檔;
      x = await 類資料(類, 這.名, 檔);
    }
    if(!x){ app.innerHTML = `<div class="bad">讀不到 <code>${esc(decodeURIComponent(讀路))}</code></div>`; return; }
    if(變){ x._變 = 變; x[變.v.條件] = x[變.v.條件] || 變.條件值; }
    x._名 = 這.名; x._索 = 這;
    /* 道具/寶石/精粹/碎片/花 這一系(ItemDefine 來的)品質在 `類型.品質` 底下,
       別的類是平的。範本一律讀 x.品質,所以在這裡補平,不要每張自己判。 */
    if(x.品質 == null && x.類型 && x.類型.品質 != null) x.品質 = x.類型.品質;
    if(x.品質 == null && 這.品質 != null) x.品質 = 這.品質;

    const 頁 = await 設定.分頁(x, 清單);
    /* 抬頭那張也走協議。範本可以指定用哪個圖樣式 ——
       夥伴引用用大頭照(128×128)、抬頭用全身立繪(使用者 2026-11-16)。 */
    const _抬 = 設定.抬頭樣式 ? {樣式: 設定.抬頭樣式} : {};
    /* 自訂抬頭:某些類(時裝套裝)的資料檔不是 資料.json、抬頭圖也不走部件協議,
       範本自己給一段 HTML(使用者 2026-11-17 做時裝)。 */
    const 卡 = 設定.抬頭HTML ? (await 設定.抬頭HTML(x)) : await 引用塊(Object.assign(
      變 ? {類, 名:變.名, [變.v.條件]:變.條件值, 顯名:false} : {類, 名:這.名, 顯名:false}, _抬));
    const 副 = (設定.副標 ? 設定.副標(x) : []) || [];

    app.innerHTML = `
    <div class="bar">${麵包(類)}
      ${挑(清單)}<button class="btn" id="th">深淺色</button></div>
    <div class="top">
      <div><div class="art">${卡}</div></div>
      <div><h1 class="title">${esc(x.名稱 || 這.名稱 || 這.名)}</h1>
        <p class="kind">${esc([設定.副標不帶品質 ? null : (設定.品質為稀有 ? 稀有字(x.品質) : x.品質), ...副]
          .filter(Boolean).join(' · '))}</p>
        <p class="desc">${rich(x.說明 || '')}</p></div></div>
    <div class="tabwrap"><div class="tabs" role="tablist">${頁.map((t, i) =>
      `<button class="tab" role="tab" aria-selected="${i === 選中頁籤}" data-tab="${i}">${esc(t[0])}</button>`
    ).join('')}</div></div>
    ${頁.map((t, i) => `<div class="panel" data-pi="${i}"${i === 選中頁籤 ? '' : ' hidden'}>${
      typeof t[1] === 'function' ? '<p class="note">載入中…</p>' : t[1]}</div>`).join('')}`;
    /* 延後算的分頁:現在選中的那頁馬上算,其他的點到才算 */
    window._延頁 = 頁.map(t => typeof t[1] === 'function' ? t[1] : null);
    填頁(選中頁籤);
    _階梯全算();     // 不是延後畫的那幾頁,階梯也要先算一次
  }

  function 路由(){
    let h = location.hash || ''; try{ h = decodeURIComponent(h); }catch(e){}
    const m = h.match(new RegExp('^#/' + 類 + '/(.+)$'));
    畫(m ? m[1] : null);
  }
  addEventListener('hashchange', () => { KW = ''; 選中頁籤 = 0; 路由(); scrollTo(0, 0); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]');
    if(t){ e.preventDefault(); 切(+t.dataset.tab, true); return; }
    if(e.target.id === 'th'){ 切色(); 路由(); }
  });
  document.addEventListener('input', async e => {
    if(e.target.id !== 'kw') return;
    KW = e.target.value; const p = e.target.selectionStart;
    const j = document.querySelector('.jump');
    if(j) j.outerHTML = 挑(await 類索引(類));
    const n = document.getElementById('kw');
    if(n){ n.focus(); n.setSelectionRange(p, p); }
  });
  路由();
}

/* 一排引用,給列表頁籤用。清單是索引項,標出「這件」。 */
async function 索引排(類, 清單, 這件名, 標題, 上限, 版, 照給的序){
  if(!清單 || !清單.length) return '';   // 空的就整組不畫,不要留一個空標題
  /* 預設:一整組 → 稀有度由低排到高。
     呼叫端自己排過(例 碎片的「同等同屬」要屬性碎片在前、夥伴碎片在後)就傳 照給的序,
     不然 稀排 會拿等級再排一次,把呼叫端排好的順序蓋掉。 */
  const 序 = 照給的序 ? 清單 : 稀排(清單);
  const a = 上限 ? 序.slice(0, 上限) : 序;
  const 卡 = await Promise.all(a.map(o => 引用塊({類, 名:o.名})));
  return (標題 ? `<h3 class="grp">${esc(標題)}</h3>` : '')
    + `<div class="objs set${版 ? ' ' + 版 : ''}">${卡.map((h, i) =>
        a[i].名 === 這件名 ? h.replace('class="obj', 'class="obj here') : h).join('')}</div>`
    + (上限 && 清單.length > 上限
        ? `<p class="note">只列前 ${上限} 個,其餘用上面的搜尋框找。</p>` : '');
}
