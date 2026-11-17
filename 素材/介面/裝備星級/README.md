# 裝備星級的星星

裝備圖示底部那排星星,拼 N 顆就是 N 星。

- `星_亮.png` 59×59 金色實心(有的星等)
- `星_暗.png` 灰色空心(沒有的星等)

**來源**:`commonfpj` atlas 的 `com_icon_xing03`(亮)/ `com_icon_xing04`(暗),由 mumu 重切。

**不要自己畫 SVG 代替。** 使用者明確要求用遊戲素材。

## 先前切壞的原因(mumu 查出來的,兩個 bug 疊在一起)

1. sprite 的位置**不在 `m_Rect`**(那永遠是 `(0,0,w,h)`),在 **`m_RD.textureRect`**。
2. 打包 atlas 有**多頁**(commonnew 有 3 頁且同名),要從 **sprite 自己參照的那一頁**裁
   (`m_RD.texture` 的 path_id),不是檔案裡第一個 Texture2D。

正確裁法:

    rd = s.m_RD; tr = rd.textureRect; page = pages[rd.texture.path_id]
    W, H = page.size
    im = page.crop((round(tr.x), round(H - tr.y - tr.height),
                    round(tr.x + tr.width), round(H - tr.y)))

這兩個 bug 影響的不只星星,是**所有打包 atlas**,先前資源圖那批切壞也是同一個原因。
`工具/切atlas.py` 還沒修,mumu 的正確版在 `/srv/share/mumu/巡夢少女_解包/cut_stars.py`。

## 排法

**重疊 65%**(每顆往右推的距離 = 星寬 × 0.35),不是並排。使用者拍板,
對標截圖在 `原始圖/裝備星級/預覽_定案65.png`。
金星 × 當前星級 + 灰星 ×(上限 − 當前)。

## `scyc_icon_xingji` 不是星星,是**角色覺醒圖**

`commonnew` 的 `scyc_icon_xingji01-05 / 11-15 / 21-25` 名字裡有 `xingji`(星級),
但切出來是淚滴 / 花瓣形的光點。**不是壞檔,也不是廢的** —— 那是角色覺醒的圖。
mumu 已經正確切好 15 張存在 `原始圖/角色覺醒圖/`,做角色素材時用得到。

(我一度以為那組是星星的亮/暗/特殊三種狀態,猜錯了。)
