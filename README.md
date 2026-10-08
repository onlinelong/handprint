# 手印 · HANDPRINT — 人类审美的四万年 / Forty Thousand Years of Seeing

一部实时生成的动态影像（约 8 分 17 秒）。所有画面与声音均由代码在浏览器中即时生成，不使用任何外部图像或音频素材。
A real-time generative film (~8:17). Every image and sound is generated live in the browser; no external images or audio.

## 观看 / Watch
直接用 Chrome / Edge / Safari 打开 `index.html`，点击「进入 Enter」。建议全屏并佩戴耳机。
Open `index.html` in a modern browser and click **Enter**. Full screen and headphones recommended.

| 键 Key | 功能 Action |
|---|---|
| 空格 Space | 暂停 / 播放 Pause / play |
| ← → | 上一章 / 下一章 Previous / next chapter |
| M | 静音 Mute |
| F | 全屏 Full screen |
| H | 隐藏界面 Hide interface |

底部时间轴可点击跳转章节。 The timeline at the bottom is clickable.

## 章节 / Chapters
序 Prologue · I 洞穴 The First Mark · II 古希腊 The Measure of All Things · III 北宋山水 Spirit Resonance ·
IV 哥特 Lux Nova · V 文艺复兴 The Vanishing Point · VI 巴洛克 Theatre of Shadow · VII 印象派 Impression, Sunrise ·
VIII 梵高 The Starry Night · IX 立体主义 Simultaneity · X 康定斯基→蒙德里安 The Inner Sound · XI 波洛克 Action ·
XII 罗斯科 Colour Field · XIII 波普 Fifteen Minutes · XIV 数字 Signal & Noise · XV 当下 The Mirror · 尾声 Epilogue

后段章节会“记住”前面的画面：数字时代的信息流由此前各章的实时截图组成，「镜中人」的粒子颜色取自整部艺术史。
Later chapters remember earlier ones: the digital feed is made of live snapshots of previous chapters, and the particles of *The Mirror* are coloured from the whole history.

## 结构 / Structure
- `js/util.js` — 噪声、纹理、绘线器、手与侧脸轮廓 / noise, textures, plotter, hand & profile shapes
- `js/audio.js` — 生成式配乐（Web Audio）/ generative score
- `js/scenes1-3.js` — 17 个章节 / the 17 chapters
- `js/main.js` — 时间线、转场、字幕、界面 / timeline, crossfades, captions, HUD

调试参数 / Debug URL params: `?ch=8` 从第 8 章开始, `&ff=20` 快进 20 秒, `&auto=1` 跳过开场（静音）。
# handprint
