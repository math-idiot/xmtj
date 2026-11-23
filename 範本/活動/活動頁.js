/* ═══════════════════════════════════════════════════════════════
   活動範本。使用者 2026-11-15 定的三條規矩:

   1. **讀取單位 = 活動/<活動名>/ 這個夾和它的子夾。**
      不管圖片、規則、資料,全部只能從該活動自己的夾出來,不能跨去別的地方抓。
      (所以規則原文也放在 活動夾/規則/,不是去讀 素材/規則/。子夾算同一個單位,
       子活動讀的是最上層那個活動夾的 規則/。)
   2. **第一頁固定「資訊」,最後一頁固定「其他」**,跟其他範本一致。
   3. **品質框不准寫死路徑**:每個物件都有等級(品質 enum),照等級去 素材/系統/ 抓。

   唯一的例外是 素材/系統/ —— 那是全站共用的系統零件(品質框、道具格規格),
   不屬於任何一個物件,規矩 3 本身就是這樣講的。
   ═══════════════════════════════════════════════════════════════ */
/* ═══ 活動頁:活動範本 和 家族範本 共吃這一份 ═══════════════════
   使用者 2026-11-16:「家族可以走活動範本,類型是家族,走活動的範本和資料夾檔案架構」。
   所以渲染只有一份,差別只在**根類**(活動 / 家族)跟目錄 —— 版面、分頁、規則、
   子活動卡全部一模一樣,改一邊兩邊都會變。
   每張 html 自己在 window.活動頁設定 裡給:
     根類      '活動' | '家族'      → 讀 素材/<根類>/,路由 #/<根類>/…
     目錄      [名…]               → 上面那個搜尋框的清單(手改,沒有產生器)
     預設      名                   → 沒有 hash 時看哪一筆
     類型預設  (層深) => 字串        → 資訊.json 沒寫 類型 時填什麼
     上層附註  字串                 → 子層「綁定」那排指回上層的標籤
   ═══════════════════════════════════════════════════════════ */
const 設定 = window.活動頁設定 || {};
const 類別 = 設定.根類 || "活動";

/* ★ 搬家時只改這一行 ★
   活動本體還在 雜物/_待進素材/,確認後搬進 素材/活動/,屆時改成 素材根+'活動/'。 */
const 活動根 = (window.類基底[類別] || window.素材基底) + 類別 + '/';   // 平常讀素材;?pending=1 讀 雜物/_待進素材
const 素材根 = window.素材基底;          // 範本/ 底下是 '../素材/';鏡到 網頁/ 時腳本改成 '素材/'
const 系統根 = 素材根 + '系統/';          // 全站共用零件
/* 告訴協議引擎:活動這一類暫時不在 素材/ 底下。搬進素材後刪掉這一行。 */
// 活動已在素材裡,不用再蓋基底

/* 目錄/預設在每張 html 自己的 活動頁設定 裡,手改,沒有產生器。 */
const 目錄 = 設定.目錄 || [];
const 預設 = 設定.預設 !== undefined ? 設定.預設 : 目錄[0];
/* 資訊.json 沒寫「類型」時填什麼:活動是 主題活動/子活動,家族是 家族/關卡 */
const 類型名 = 深 => (設定.類型預設 || (d => d > 1 ? '子活動' : '主題活動'))(深);

/* ── 讀檔,同一支只讀一次 ─────────────────────────────────── */
const 快取 = new Map();
async function 讀(路){
  if(快取.has(路)) return 快取.get(路);
  const p = fetch(路).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); })
                     .catch(e=>({_讀不到:String(e.message||e), _路:路}));
  快取.set(路,p); return p;
}
/* 路徑可以是空的 —— 家族那一類,類別夾自己就是「家族」這一筆(素材/家族/資訊.json)。
   使用者 2026-11-16:「家族的資料就放在家族下就好了,不需要再包一個資料夾」。 */
const 活徑 = seg => (活動根 + seg.map(encodeURIComponent).join('/')).replace(/\/+$/, '');
const 有圖 = 路 => new Promise(ok=>{ const i=new Image();
  i.onload=()=>ok(true); i.onerror=()=>ok(false); i.src=路; });
const 空 = t => `<p class="note">${esc(t)}</p>`;
/* 素材有兩種「沒有」:欄位不存在、或寫著字串「沒有」(xmhd 整理那批就是這樣寫的)。
   兩種都要當成沒有,不然副標會印「檔期 沒有」、綁定那排會去找一個叫「沒有」的夥伴。 */
const 真 = v => (v == null || v === '' || v === '沒有' || v === '無') ? null : v;
/* 素材 json 有些說明用 **粗體** 寫法,照字面印會看到星號。只做這一個轉換。 */
const 粗 = s => esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
const 勾 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"/></svg>';
const 槓 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>';

/* 品質框、物件卡都在 共用.js 的協議引擎裡了 —— 範本不再自己畫引用。
   畫法只定義在 協議_<類>.json 一個地方,所以同一個東西在哪張範本都一樣。 */

/* ── 活動資源:**走協議引擎**,不自己畫 ─────────────────────
   使用者:「同一個東西不管在哪一張範本出現,在引用上的視覺是一樣的。」
   所以這裡只給指向與修飾,畫法由 協議_資源.json 決定。
   活動限定資源在活動自己的夾裡 → 給 所屬活動,協議會走「另有」那一條。 */
async function 資源板(名單, 活動名){
  if(!名單 || !名單.length) return '';
  /* 活動限定資源在活動自己的夾、家族玩法限定資源在那個玩法自己的夾 ——
     協議的「另有」用哪一條,看引用方給的是 所屬活動 還是 所屬家族(協議_資源 兩條都有)。
     畫法完全一樣,差的只是去哪裡讀。 */
  const 鍵 = 類別 === '活動' ? '所屬活動' : '所屬家族';
  return 引用排(名單.map(n => ({類:'資源', 名:n, [鍵]:活動名})), '活動資源');
}

/* ── 限定招募:這個活動綁的限定卡池(夥伴/寵物),放在活動自己的夾、走協議另有 ──
   使用者 2026-11-17:限定卡池搬回活動底下。 */
async function 招募板(名單, 活動名){
  if(!名單 || !名單.length) return '';
  const 鍵 = 類別 === '活動' ? '所屬活動' : '所屬家族';
  return 引用排(名單.map(n => ({類:'招募', 名:n, [鍵]:活動名})), '限定招募');
}



function 機制板(m, 本層){
  /* 機制卡**常住**:這一系列活動有哪些機制,每一頁都畫同一組,有就打勾、沒有就一條槓。
     卡片右邊只寫**對應的子活動名**(「有X」配「X名」),不寫依據那種長句。
     在子活動頁上,只有屬於自己的那一張打勾、寫自己;其他全部一條槓。
     使用者 2026-11-15:「這幾張卡片常住顯示,有就打勾沒有就像戰令那樣一條槓;
     對應名稱都只顯示子活動;弈念征討就寫弈念征討,不要寫演算積分(弈念征討)」。 */
  if(!m) return '';
  const 別名={儲值禮包:'禮包名'};   // 舊資料的欄名
  const 項=Object.keys(m).filter(k=>k.startsWith('有')).map(k=>{
    const 機=k.slice(1);
    const 名鍵=(m[機+'名']!==undefined)?機+'名':別名[機];
    return [機, 名鍵?m[名鍵]:null, !!m[k]];
  });
  const 畫=項.map(([機,名,有])=>{
    const on = 本層 ? (有 && 名===本層) : 有;
    return `<div class="m ${on?'on':'off'}">${on?勾:槓}<span>${esc(機)}</span>${
      on&&名?`<span class="nm">${esc(名)}</span>`:''}</div>`;
  }).join('');
  return 畫 ? `<h3 class="grp">這個活動有哪些機制</h3><div class="mech">${畫}</div>` : '';
}

/* ── 固定區塊:說明 / 數值 / 獎勵 ─────────────────────────────
   每一頁都畫同一組,沒有的就說「沒有」—— 不是「有資料才長出來」。
   使用者 2026-11-16:「如果都走活動的話就是固定那幾 tab」「全部範本要一樣」。 */
function 說明板(x){
  const 列 = [['這是什麼', x.這是什麼], ['說明', x.說明], ['活動說明', x.活動說明],
              ['功能說明', x.功能說明], ['遊戲說明', x.遊戲說明]]
    .filter(([, v]) => 真(v));
  return `<h3 class="grp">說明</h3>` + (列.length
    ? `<div class="rows">${列.map(([k, v]) => kv(k, String(v))).join('')}</div>`
    : 空('沒有說明'));
}
function 數值板(x){
  const 列 = [['等級', x.等級 != null ? x.等級 + ' 級' : null], ['定位', x.定位],
              ['推薦戰力', x.推薦戰力 != null ? x.推薦戰力.toLocaleString('zh-TW') : null],
              ['家族積分', x.家族積分], ['關卡數', x.關卡數],
              ['每關獎勵次數', x.每關獎勵次數], ['每週獎勵次數', x.每週獎勵次數]]
    .filter(([, v]) => v != null && v !== '');
  return `<h3 class="grp">數值</h3>` + (列.length
    ? `<div class="rows">${列.map(([k, v]) => kv(k, String(v))).join('')}</div>`
    : 空('沒有數值'));
}
/* 獎勵:資訊.json 的 首通獎勵/獎勵,每一筆帶 素材路徑(<類>/<名>)就走引用。
   解不開的碼(素材路徑 null)畫成尚未建檔,缺的要看得見。 */
async function 獎勵板(x){
  const 畫 = async (列, 標) => {
    const a = (列 || []).filter(o => o && o.素材路徑);
    const 缺 = (列 || []).filter(o => o && !o.素材路徑);
    if(!a.length && !缺.length) return '';
    const h = await Promise.all(a.map(o => {
      const i = o.素材路徑.indexOf('/');
      return 引用塊({類: o.素材路徑.slice(0, i), 名: o.素材路徑.slice(i + 1),
                     量: o.數量 > 1 ? o.數量 : null});
    }));
    return `<h3 class="grp">${esc(標)}</h3><div class="objs fam">${h.join('')}${
      缺.map(o => `<span class="obj miss" title="這個獎勵碼還沒解開">
        <span class="rfi bare"><span class="ab">?</span></span>
        <b>${esc(o.原碼)}</b><i>尚未建檔</i></span>`).join('')}</div>`;
  };
  let h = (await 畫(x.首通獎勵, '首通一次')) + (await 畫(x.獎勵, '每次都給'));
  /* 關聯表(素材/_關聯/依活動/<名>.json,ploy 解密來的):這個活動會發什麼,依 grade 分組 */
  const 關 = await 讀(window.素材基底 + '_關聯/依活動/' + encodeURIComponent(String(x.名稱 || '').replace(/\//g, '／')) + '.json').catch(() => null);
  if(關 && (關.給 || []).length){
    const g = new Map();
    for(const r of 關.給){ const k = r.grade ? '第 ' + r.grade + ' 階' : '獎勵'; if(!g.has(k)) g.set(k, []); g.get(k).push(r); }
    for(const [k, rs] of g){
      const 卡 = await Promise.all(rs.map(r => 引用塊({類: r.t.類, 名: r.t.名, 量: r.量 > 1 ? r.量 : null, 附註: r.機率 ? '機率 ' + Math.round(r.機率 * 1000) / 10 + '%' : null})));
      h += `<h3 class="grp">${esc(k)}${關.方式 ? ' <small>' + esc(關.方式) + '</small>' : ''}</h3><div class="objs fam">${卡.join('')}</div>`;
    }
  }
  return h || `<h3 class="grp">獎勵</h3>` + 空('沒有獎勵');
}

/* 商品:固定畫。資訊.json 的 商品 可以是
     字串  → 照寫(活動的兌換商店品項是伺服器下發的,設定表查不到,那就寫清楚拿不到)
     陣列  → 一格一件,價格寫在名字底下(家族商店/家族砍價是設定表裡固定的,查得到) */
async function 商品板(x){
  const v = x.商品;
  if(typeof v === 'string' && 真(v)) return `<h3 class="grp">商品</h3>` + 空(v);
  const a = Array.isArray(v) ? v.filter(o => o && o.商品 && o.商品.素材路徑) : [];
  const 缺 = Array.isArray(v) ? v.filter(o => o && (!o.商品 || !o.商品.素材路徑)) : [];
  if(!a.length && !缺.length) return `<h3 class="grp">商品</h3>` + 空('沒有商品');
  const h = await Promise.all(a.map(o => {
    const p = o.商品.素材路徑, i = p.indexOf('/');
    const 價 = o.價格 && o.價格.名稱
      ? o.價格.名稱 + ' ' + Number(o.價格.數量 || 0).toLocaleString('zh-TW')
      : (o.底價 != null ? '底價 ' + o.底價 : null);
    return 引用塊({類: p.slice(0, i), 名: p.slice(i + 1),
                   量: o.商品.數量 > 1 ? o.商品.數量 : null, 附註: 價});
  }));
  return `<h3 class="grp">商品</h3><div class="objs fam">${h.join('')}${
    缺.map(o => `<span class="obj miss" title="這個商品碼還沒解開">
      <span class="rfi bare"><span class="ab">?</span></span>
      <b>${esc((o.商品 || {}).原碼 || o.編號)}</b><i>尚未建檔</i></span>`).join('')}</div>`;
}

function 依據板(x){
  const d=[['綁定角色',x.綁定角色依據],['機制指標',(x.機制||{}).依據],
           ['排行榜',(x.排行榜||{}).怎麼填]].filter(([,v])=>v);
  if(!d.length) return '';
  return `<h3 class="grp">判定依據</h3><ul class="sup">${d.map(([k,v])=>
    `<li>${粗(v)}<span class="ev">${esc(k)}</span></li>`).join('')}</ul>`;
}



/* ── 規則原文(讀活動夾裡的那一份)──────────────────────── */
function 規則板(R){
  if(!R) return 空('這一層沒有自己的規則說明。');
  if(R._讀不到) return `<div class="bad">規則原文讀不到。<br><code>${esc(R._路)}</code><br><br>
    規則要放在<b>活動自己的夾</b>裡(<code>活動/&lt;活動名&gt;/規則/&lt;規則鍵&gt;.json</code>),
    不從別處抓。</div>`;
  const 段=R.段落||[];
  let 大='', h='', 標=[];
  段.forEach(s=>{
    const t=s.文字||'';
    if(s.層級==='onetitle') 大+=`<h2>${rich(t)}</h2>`;
    else if(s.層級==='twotitle'){ 標.push(t); h+=`<h3 id="g${標.length}">${rich(t)}</h3>`; }
    else h+=`<p class="${/^（\d+）/.test(t)?'ind':''}">${rich(t)}</p>`;
  });
  // 目錄不能用 href="#gN" —— 路由吃 location.hash,改 hash 會跳回預設活動
  const toc = 標.length>1 ? `<div class="toc">${標.map((t,i)=>
    `<a href="javascript:void 0" data-go="g${i+1}">${esc(t)}</a>`).join('')}</div>` : '';
  return `<div class="rule">${大}</div>` + toc + `<div class="rule">${h}</div>`
    + `<p class="note">原文出處:${esc(R.資料來源||'')}</p>`;
}

/* ── 系列活動:這一檔活動底下全部的子活動,每一頁都列同一組 ──────
   資料來自最上層活動的 子活動;在子活動頁上也列整組,自己那張標 here。
   引用卡用入口圖(名字燒在圖上,不配名字),底下只留類型小字 —— 協議負責。
   引用別處的(卡池)沒有入口圖,就用同樣大小的框寫名字。 */
async function 系列板(頂, 路徑){
  const 子 = (頂 && 頂.子活動) || [];
  if(!子.length) return '';
  const 這 = 路徑.length > 1 ? 路徑[路徑.length-1] : null;
  /* 子活動的完整指向 = 上一層的路徑 + 名字。
     根(家族)那一層是空路徑,所以直接就是名字;子活動頁上列的是兄弟,前綴取第一段。 */
  const 父 = 路徑.length > 1 ? 路徑.slice(0, 1) : 路徑;
  const 卡 = await Promise.all(子.map(async s => {
    /* 引用別處的子活動(弈局萬象的兩個限定卡池)—— 走那一類自己的協議,
       不要再畫一個寫名字的空框(使用者 2026-11-16:「你都把招募的範本做出來了,
       為什麼不要把弈局那兩個招募接上」)。素材路徑的第一段就是類別。 */
    if(s.引用){
      const 路 = String((s.引用 || {}).素材路徑 || '').replace(/^素材\//, '');
      const i = 路.indexOf('/');
      if(i > 0) return await 引用塊({類: 路.slice(0, i), 名: 路.slice(i + 1), 顯名:false});
      return `<span class="sub ref" title="${esc(s.名稱)}">
        <span class="ic"><span class="ab">${esc(s.名稱)}</span></span><i>${esc(s.類型 || '')}</i></span>`;
    }
    const h = await 引用塊({類:類別, 名:[...父, s.名稱].join('/'), 顯名:false});
    return s.名稱 === 這 ? h.replace('class="obj', 'class="obj here') : h;
  }));
  return `<div class="objs fam">${卡.join('')}</div>`;
}

/* ── 路由 ─────────────────────────────────────────────── */
const 本頁 = 路徑 => '#/' + encodeURIComponent(類別) + '/' + 路徑.map(encodeURIComponent).join('/');
let KW='';
function 挑(){
  const k=KW.trim();
  /* 根名 = 類別夾自己那一筆(家族)。給了就排在最前面,點了走空路徑。 */
  const 全=(設定.根名?[設定.根名]:[]).concat(目錄);
  const hit=k?全.filter(n=>n.includes(k)).slice(0,40):[];
  return `<span class="jump"><input id="kw" placeholder="找別的${esc(類別)}…" autocomplete="off" value="${esc(KW)}">
    ${k?`<ul>${hit.map(n=>`<li><a href="${本頁(n===設定.根名?[]:[n])}">${esc(n)}</a></li>`).join('')
      ||'<li><a>沒有符合的</a></li>'}</ul>`:''}</span>`;
}

/* ── 組頁:第一頁固定「資訊」,最後一頁固定「其他」 ──────────── */
async function 分頁(x, 路徑, 基){
  // 規則放在**最上層活動夾**的 規則/,子活動也讀同一份(子夾屬於同一個讀取單位)
  const 規 = 真(x.規則鍵)
    ? await 讀(活徑([路徑[0]]) + '/規則/' + encodeURIComponent(x.規則鍵) + '.json') : null;
  /* 最上層那一筆:機制卡和系列活動都從它來,所以每一頁看到的是同一組 */
  const 頂 = 路徑.length > 1 ? await 讀(活徑([路徑[0]]) + '/資訊.json') : x;
  const 本層 = 路徑.length > 1 ? (x.名稱 || 路徑[路徑.length-1]) : null;
  /* 欄位固定六欄,沒有的 rows() 自己畫「—」;兩個區塊也一定畫,空的就說沒有。 */
  /* 綁定的角色 / 地圖 / 所屬活動都是**引用**,不是文字 —— 使用者 2026-11-15。
     子活動自己沒寫的就跟最上層的一樣(整個系列綁同一個角色、同一張地圖)。 */
  const 綁 = [];
  const 角 = 真(x.綁定角色) || (頂 && 真(頂.綁定角色));
  const 圖 = 真(x.綁定地圖) || (頂 && 真(頂.綁定地圖));
  // 底下那行只寫「綁定角色/綁定地圖/所屬活動」,不要再帶協議的類型(歷練地圖、主題活動)
  if(角) 綁.push({類:'夥伴', 名:角, 顯類型:false, 附註:'綁定角色'});
  if(圖) 綁.push({類:'地圖', 名:圖, 所屬活動:路徑[0], 顯類型:false, 附註:'綁定地圖'});
  if(路徑.length>1) 綁.push({類:類別, 名:路徑.slice(0,-1).join('/'), 顯類型:false,
                            附註:設定.上層附註 || '所屬活動'});
  const 資訊 =
    rows([
      ['名稱',     ()=> x.名稱],
      ['類型',     ()=> x.類型 || 類型名(路徑.length)],
      ['檔期',     ()=> 真(x.檔期)],
      ['規則鍵',   ()=> 真(x.規則鍵)],
      /* 這兩欄家族玩法會有、活動多半沒有 —— 一樣固定畫,沒有就一條槓。
         使用者 2026-11-16:「我不是說過我的全部範本要一樣嗎」。 */
      ['解鎖條件', ()=> 真(x.解鎖條件)],
      ['開放時間', ()=> 真(x.開放時間)],
    ], x)
    + 說明板(x)
    + (await 引用排(綁, '綁定') || `<h3 class="grp">綁定</h3>` + 空('沒有綁定'))
    + (await 資源板((頂 && 頂.活動資源) || x.活動資源, 路徑[0])
       || `<h3 class="grp">活動資源</h3>` + 空('沒有活動資源'))
    + (await 招募板((頂 && 頂.限定招募) || x.限定招募, 路徑[0]) || '')
    + (機制板((頂 && 頂.機制) || x.機制, 本層)
       || `<h3 class="grp">這個活動有哪些機制</h3>` + 空('沒有記到機制'))
    + 數值板(x)
    + await 獎勵板(x)
    + await 商品板(x);

  /* 子活動把畫面記在 畫面,不叫 hub畫面;畫布/別名 只有最上層有,子活動頁不要列(不然永遠是「—」) */
  const 頂層 = 路徑.length === 1;
  const 其他 = rows([
    ...(頂層 ? [['別名', ()=> (x.別名||[]).length ? (x.別名||[]).join('、') : null]] : []),
    ['畫面',     ()=> x.hub畫面 ?? x.畫面],
    ...(頂層 ? [['畫布', ()=> x.hub畫布 ? `${x.hub畫布.寬}×${x.hub畫布.高}` : null]] : []),
    // 顯示用原字,不要用 活徑()(那是給 fetch 的,會是百分號編碼)
    ['資料夾',   ()=> (活動根 + 路徑.join('/')).replace(/^\.\.\//,'')],
  ], x)
  + (()=>{ const s=x.資料來源;
      if(!s) return `<h3 class="grp">資料來源</h3>` + 空('沒有記到資料來源');
      const 項 = Array.isArray(s) ? [['',s]] : Object.entries(s);
      return `<h3 class="grp">資料來源</h3><div class="ways">${項.map(([k,v])=>
        (Array.isArray(v)?v:[v]).map(one=>
          `<span class="way"><b>${esc(one)}</b>${k?`<span class="c">${esc(k)}</span>`:''}</span>`
        ).join('')).join('')}</div>`; })()
  + 依據板(x)
  + (x._發佈範圍 ? `<h3 class="grp">這一頁只發佈「每一檔活動都有」的欄位</h3>
      <ul class="bul">${(x._發佈範圍['上網頁(每一檔活動都有)']||[]).map(s=>`<li>${粗(s)}</li>`).join('')}</ul>
      <h3 class="grp">以下只在素材裡留著,不上網頁</h3>
      <ul class="bul">${(x._發佈範圍['只記錄不上網頁(舊活動拿不到)']||[]).map(s=>`<li>${粗(s)}</li>`).join('')}</ul>
      <p class="note long">${粗(x._發佈範圍.為什麼||'')}</p>` : '');

  /* 分頁固定這四個,每一層都一樣。使用者 2026-11-15:
     「我要的是這張範本不管哪個畫面顯示的東西都一樣,如果沒有的那就說沒有」。
     所以不再依資料有無增減分頁,空的那一頁自己說「沒有」。 */
  const 系 = await 系列板(頂, 路徑);
  /* 加分頁:範本可以在「系列活動」和「其他」之間插自己的分頁(玩法範本的「獎勵」)。
     一樣固定出現,沒有的那頁自己說沒有 —— 不然兩種活動的範本就不一樣了(使用者 2026-11-23)。 */
  const 加 = 設定.加分頁 ? await 設定.加分頁(x, 路徑, 基) : [];
  return [
    ['資訊',    資訊],
    ['規則原文', 規則板(規) || 空('沒有規則原文')],
    ['系列活動', 系 || 空('沒有系列活動')],
    ...加,
    ['其他',    其他],
  ];
}

async function render(路徑){
  const 基 = 活徑(路徑);
  const x = await 讀(基+'/資訊.json');
  const app = document.getElementById('app');

  /* 類別夾本身沒有 資訊.json(玩法):空路徑就列目錄,一格一個(引用卡,跟別的列表頁一樣) */
  if(x._讀不到 && !路徑.length && !設定.根名){
    const 卡 = await Promise.all(目錄.map(n => 引用塊({類: 類別, 名: n})));
    app.innerHTML = `<div class="bar">${麵包(類別)}${挑()}<button class="btn" id="th">深淺色</button></div>
      <h1 class="title" style="margin:0 0 var(--sp3)">${esc(類別)}</h1>
      <p class="note" style="margin:0 0 var(--sp4)">共 ${目錄.length} 筆 · 點一個看詳情</p>
      <div class="objs set">${卡.join('')}</div>`;
    document.title = 類別 + ' · 巡夢圖鑑';
    return;
  }
  if(x._讀不到){
    app.innerHTML = `<div class="bar">${麵包(類別)}
      <span class="sp"></span><button class="btn" id="th">深淺色</button></div>
      <h1 class="title">讀不到資料</h1>
      <div class="bad" style="margin-top:var(--sp4)">
        找不到 <code>${esc(x._路)}</code><br><br>
        1. <b>直接用檔案開啟(file://)</b> —— 瀏覽器不准這樣讀 json,
           請用本機伺服器開這一頁<br>
        2. <b>素材/${esc(類別)}/ 裡沒有這一筆</b> —— 這張讀的是 <code>${esc(活動根)}</code>。
      </div>`;
    return;
  }

  const 頁 = await 分頁(x, 路徑, 基);
  const 名 = x.名稱 || 路徑[路徑.length-1] || 設定.根名 || 類別;
  /* 橫幅 = 遊戲裡活動入口那張卡的底圖(hangactionmain/activity_<id>/floor_banner01)。
     png 優先:入口橫幅是 png,舊的螢幕合成是 jpg。
     字也一樣:橫幅上那組小字(ptext_banner01_c)優先,沒有才用活動自己畫面的大字。 */
  const 挑張 = async (b, ...候) => { for(const f of 候) if(await 有圖(b+'/'+f)) return f; return null; };
  const 挑檔 = (...候) => 挑張(基, ...候);
  const [本層橫, 字, 入0] = await Promise.all([
    挑檔('主圖.png','主圖.jpg'), 挑檔('文字_橫幅.png','文字.png'), 有圖(基+'/入口圖.png')]);
  const 入 = 路徑.length > 1 ? false : 入0;   // 子玩法頁不顯示入口圖(使用者 2026-11-15)
  /* 主圖怎麼挑(使用者 2026-11-16 定的):
       這一夾自己有 主圖 → 用自己的,烙自己的字
       沒有              → 往父層找,一層一層往上,找到就用那一張烙自己的字
     家族那一類最上面就是類別夾(素材/家族/主圖.png),所以 n 可以走到 0。
     只有「用自己的主圖、而且那張圖本來就含標題」(主圖已含標題)時才不疊字 —— 
     借來的主圖一定要疊自己的字,不然每一頁看起來都一樣。 */
  let 橫 = 本層橫, 橫基 = 基, 自己的主圖 = !!本層橫;
  if(!橫){
    for(let n = 路徑.length - 1; n >= 0; n--){
      const b = 活徑(路徑.slice(0, n));
      const f = await 挑張(b, '主圖.png', '主圖.jpg');
      if(f){ 橫 = f; 橫基 = b; break; }
    }
  }

  // 麵包屑走共用的 麵包():類別名可以切到別的範本;中間每層用「到那一層為止」的路徑
  const 屑 = 麵包(類別, 路徑.map((n,i)=>[i===路徑.length-1 ? 名 : n, 本頁(路徑.slice(0,i+1))]));

  app.innerHTML = `
  <div class="bar">${屑}${挑()}
    <button class="btn" id="th">深淺色</button></div>
  <div class="ahero${橫?'':' ph'}">
    ${橫?`<img class="bn" src="${橫基}/${橫}" alt="${esc(名)} 主圖">`:''}
    ${橫&&字&&!(自己的主圖&&x.主圖已含標題)?`<span class="vn"></span><span class="tx"><img src="${基}/${字}" alt="${esc(名)}"></span>`:''}
    ${橫?'':`<span class="phtx">${字?`<img src="${基}/${字}" alt="${esc(名)}">`
        :`<b>${esc(名)}</b><i>還沒有主圖</i>`}</span>`}
  </div>
  <div class="ahd">
    <div class="l">
      <h1 class="title">${esc(名)}</h1>
      <p class="kind">${esc([x.類型||類型名(路徑.length),
        真(x.檔期)?('檔期 '+x.檔期):null, 真(x.綁定角色)]
        .filter(Boolean).join(' · '))}</p>
    </div>
    ${入?`<span class="entry"><img src="${基}/入口圖.png" alt=""><b>入口圖</b></span>`:''}
  </div>
  <div class="tabwrap"><div class="tabs" role="tablist">${頁.map((t,i)=>
    `<button class="tab" role="tab" aria-selected="${i===選中頁籤}" data-tab="${i}">${esc(t[0])}</button>`
  ).join('')}</div></div>
  ${頁.map((t,i)=>`<div class="panel"${i===選中頁籤?'':' hidden'}>${t[1]}</div>`).join('')}`;
}

function draw(){
  let h=location.hash||''; try{h=decodeURIComponent(h)}catch(e){}
  if(new RegExp('^#/'+類別+'/?$').test(h)) return render([]);   // 根那一筆
  const m=h.match(new RegExp('^#/'+類別+'/(.+)$'));
  render(m ? m[1].split('/').filter(Boolean) : (預設 ? [預設] : []));
}
/* 捲到規則原文的某一段。段落標題在 .panel 裡,切完頁籤才量得到位置。 */
function 捲到(id){
  const n=document.getElementById(id); if(!n) return;
  n.scrollIntoView({block:'start',behavior:
    matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
addEventListener('hashchange',()=>{KW='';選中頁籤=0;draw();scrollTo(0,0)});
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  const t=e.target.closest('[data-tab]');
  if(t){ e.preventDefault(); 切(+t.dataset.tab, !g);
         if(g) requestAnimationFrame(()=>捲到(g.dataset.go));
         return; }
  if(g){ e.preventDefault(); 捲到(g.dataset.go); return; }
  if(e.target.id==='th'){切色();draw();}
});
document.addEventListener('input',e=>{
  if(e.target.id==='kw'){KW=e.target.value;const p=e.target.selectionStart;
    const j=document.querySelector('.jump'); if(j) j.outerHTML=挑();
    const n=document.getElementById('kw'); if(n){n.focus();n.setSelectionRange(p,p);}}
});
draw();
