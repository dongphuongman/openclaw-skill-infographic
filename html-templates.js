const COMMON_STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 800px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
`;

const PALETTES = {
  warm: {
    headerBg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 40%, #d4a574 100%)',
    headerText: '#fff', titleAccent: '#ffeaa7',
    bg1: '#faf5ef', bg2: '#f5ebe0',
    text: '#2c1810', textMuted: '#7a6b5d',
    accent: '#8b3a2a', priceBg: 'rgba(139,58,42,0.08)',
    footerBg: 'linear-gradient(135deg, #c0392b, #d4a574)',
    stripColors: ['#8b6f47','#6b8e5a','#c0956c','#7a9e7e','#a67c52'],
  },
  cool: {
    headerBg: 'linear-gradient(135deg, #1a5276 0%, #2980b9 40%, #5dade2 100%)',
    headerText: '#fff', titleAccent: '#aed6f1',
    bg1: '#f0f5fa', bg2: '#e3ecf5',
    text: '#1a2a3a', textMuted: '#5a6a7a',
    accent: '#1a5276', priceBg: 'rgba(26,82,118,0.08)',
    footerBg: 'linear-gradient(135deg, #1a5276, #5dade2)',
    stripColors: ['#34698a','#2e86ab','#5dade2','#76c7e3','#48a9a6'],
  },
  pastel: {
    headerBg: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 40%, #dfe6e9 100%)',
    headerText: '#fff', titleAccent: '#ffeaa7',
    bg1: '#fafafa', bg2: '#f0eff5',
    text: '#2d3436', textMuted: '#636e72',
    accent: '#6c5ce7', priceBg: 'rgba(108,92,231,0.08)',
    footerBg: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    stripColors: ['#fab1a0','#81ecec','#ffeaa7','#dfe6e9','#a29bfe'],
  },
  bold: {
    headerBg: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 50%, #e17055 100%)',
    headerText: '#2d3436', titleAccent: '#d63031',
    bg1: '#fafafa', bg2: '#fff3e0',
    text: '#2d3436', textMuted: '#636e72',
    accent: '#d63031', priceBg: 'rgba(214,48,49,0.08)',
    footerBg: 'linear-gradient(135deg, #e17055, #fdcb6e)',
    stripColors: ['#d63031','#e17055','#fdcb6e','#00b894','#0984e3'],
  },
};

const CARD_COLORS = [
  '#e8f5e9','#fce4ec','#e3f2fd','#f3e5f5','#fff9c4',
  '#e0f2f1','#fff3e0','#e8eaf6','#fbe9e7','#f1f8e9',
];

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function foodGuide(data) {
  const p = PALETTES[data.color] || PALETTES.warm;
  const items = data.items || [];
  const categories = data.categories || [];

  let stripHtml = '';
  if (categories.length) {
    stripHtml = `<div class="strip">${categories.map((c, i) =>
      `<div class="strip-item" style="background:${p.stripColors[i % p.stripColors.length]}">${esc(c)}</div>`
    ).join('')}</div>`;
  }

  const itemsHtml = items.map((item, i) => `
    <div class="food-item" style="background:${i % 2 === 0 ? p.bg1 : p.bg2}">
      <div class="food-visual">${esc(item.emoji || '🍽️')}</div>
      <div class="food-info">
        <div class="food-name" style="color:${p.accent}">${esc(item.name)}</div>
        ${item.origin ? `<div class="food-origin"><span class="oi">®</span> ${esc(item.origin)}</div>` : ''}
        ${item.description ? `<div class="food-desc">
          <span class="di">🍳</span> ${esc(item.description)}
        </div>` : ''}
        ${item.price ? `<div class="food-price" style="background:${p.priceBg};color:${p.accent}">
          💰 ${esc(item.price)}
        </div>` : ''}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><style>
${COMMON_STYLES}
body { background: ${p.bg1}; color: ${p.text}; }
.header {
  background: ${p.headerBg};
  padding: 36px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255,215,0,.12) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,.08) 0%, transparent 40%);
}
.header-inner { position: relative; z-index: 1; }
.flag { font-size: 26px; margin-bottom: 6px; }
.header h1 {
  font-size: 48px; font-weight: 700; color: ${p.headerText};
  text-shadow: 2px 3px 6px rgba(0,0,0,.25);
  font-style: italic; line-height: 1.15;
}
.header h1 span { display: block; font-size: 60px; color: ${p.titleAccent}; }
.header .sub {
  margin-top: 8px; color: rgba(255,255,255,.82);
  font-size: 14px; font-style: italic;
}
.strip { display: flex; height: 48px; }
.strip-item {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600; color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,.4);
}
.food-item {
  display: grid; grid-template-columns: 160px 1fr;
  min-height: 170px; border-bottom: 1px solid rgba(0,0,0,.06);
}
.food-visual {
  display: flex; align-items: center; justify-content: center;
  font-size: 72px; padding: 16px;
  border-right: 1px solid rgba(0,0,0,.06);
}
.food-info { padding: 20px 24px; display: flex; flex-direction: column; justify-content: center; }
.food-name { font-size: 28px; font-weight: 700; font-style: italic; margin-bottom: 4px; line-height: 1.2; }
.food-origin { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: ${p.textMuted}; font-style: italic; margin-bottom: 6px; }
.oi {
  width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid ${p.textMuted};
  display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-style: normal; flex-shrink: 0;
}
.food-desc { font-size: 13px; line-height: 1.6; color: ${p.text}; margin-bottom: 8px; }
.di { margin-right: 4px; }
.food-price {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 16px;
  font-size: 12.5px; font-weight: 600; width: fit-content;
}
.footer {
  background: ${p.footerBg};
  padding: 16px 24px; text-align: center;
  color: rgba(255,255,255,.85); font-size: 11.5px; font-style: italic;
}
</style></head><body>
<div class="header"><div class="header-inner">
  <div class="flag">${esc(data.flag || '🇻🇳')}</div>
  <h1>${esc(data.title || 'Tiêu đề')}<br><span>${esc(data.titleAccent || '')}</span></h1>
  ${data.subtitle ? `<p class="sub">${esc(data.subtitle)}</p>` : ''}
</div></div>
${stripHtml}
<div class="food-list">${itemsHtml}</div>
${data.footer ? `<div class="footer">${esc(data.footer)}</div>` : ''}
</body></html>`;
}

function listCards(data) {
  const p = PALETTES[data.color] || PALETTES.pastel;
  const items = data.items || [];

  const itemsHtml = items.map((item, i) => `
    <div class="card" style="background:${CARD_COLORS[i % CARD_COLORS.length]}">
      <div class="card-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="card-body">
        <div class="card-emoji">${esc(item.emoji || '')}</div>
        <div class="card-name">${esc(item.name)}</div>
        ${item.description ? `<div class="card-desc">${esc(item.description)}</div>` : ''}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><style>
${COMMON_STYLES}
body { background: #fff; color: ${p.text}; }
.header {
  background: ${p.headerBg};
  padding: 40px 30px; text-align: center;
}
.header h1 {
  font-size: 44px; font-weight: 800; color: ${p.headerText};
  text-shadow: 1px 2px 4px rgba(0,0,0,.2);
  letter-spacing: -0.5px;
}
.header .sub { margin-top: 6px; color: rgba(255,255,255,.8); font-size: 14px; }
.cards { padding: 24px 32px 32px; display: flex; flex-direction: column; gap: 14px; }
.card {
  display: flex; align-items: center; gap: 18px;
  padding: 18px 22px; border-radius: 12px;
  min-height: 70px;
}
.card-num {
  font-size: 28px; font-weight: 800; color: rgba(0,0,0,.18);
  min-width: 44px; text-align: center;
}
.card-body { flex: 1; }
.card-emoji { font-size: 14px; margin-bottom: 2px; }
.card-name { font-size: 18px; font-weight: 700; color: ${p.text}; line-height: 1.3; }
.card-desc { font-size: 13px; color: ${p.textMuted}; margin-top: 3px; line-height: 1.5; }
.footer {
  background: ${p.footerBg};
  padding: 14px 24px; text-align: center;
  color: rgba(255,255,255,.85); font-size: 11px;
}
</style></head><body>
<div class="header">
  <h1>${esc(data.title || 'Tiêu đề')}</h1>
  ${data.subtitle ? `<p class="sub">${esc(data.subtitle)}</p>` : ''}
</div>
<div class="cards">${itemsHtml}</div>
${data.footer ? `<div class="footer">${esc(data.footer)}</div>` : ''}
</body></html>`;
}

function grid(data) {
  const p = PALETTES[data.color] || PALETTES.pastel;
  const items = data.items || [];
  const cols = data.columns || 3;

  const itemsHtml = items.map((item, i) => `
    <div class="cell" style="background:${CARD_COLORS[i % CARD_COLORS.length]}">
      <div class="cell-num">${String(i + 1).padStart(2, '0')}</div>
      ${item.emoji ? `<div class="cell-emoji">${esc(item.emoji)}</div>` : ''}
      <div class="cell-name">${esc(item.name)}</div>
      ${item.description ? `<div class="cell-desc">${esc(item.description)}</div>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><style>
${COMMON_STYLES}
body { background: #fff; color: ${p.text}; }
.header {
  background: ${p.headerBg};
  padding: 36px 30px; text-align: center;
}
.header h1 {
  font-size: 42px; font-weight: 800; color: ${p.headerText};
  text-shadow: 1px 2px 4px rgba(0,0,0,.2);
}
.header .sub { margin-top: 6px; color: rgba(255,255,255,.8); font-size: 14px; }
.grid {
  display: grid; grid-template-columns: repeat(${cols}, 1fr);
  gap: 14px; padding: 28px 28px 32px;
}
.cell {
  border-radius: 12px; padding: 20px 16px;
  text-align: center; min-height: 120px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.cell-num { font-size: 13px; font-weight: 800; color: rgba(0,0,0,.2); margin-bottom: 4px; }
.cell-emoji { font-size: 32px; margin-bottom: 6px; }
.cell-name { font-size: 15px; font-weight: 700; color: ${p.text}; line-height: 1.3; }
.cell-desc { font-size: 12px; color: ${p.textMuted}; margin-top: 4px; line-height: 1.45; }
.footer {
  background: ${p.footerBg};
  padding: 14px 24px; text-align: center;
  color: rgba(255,255,255,.85); font-size: 11px;
}
</style></head><body>
<div class="header">
  <h1>${esc(data.title || 'Tiêu đề')}</h1>
  ${data.subtitle ? `<p class="sub">${esc(data.subtitle)}</p>` : ''}
</div>
<div class="grid">${itemsHtml}</div>
${data.footer ? `<div class="footer">${esc(data.footer)}</div>` : ''}
</body></html>`;
}

function timeline(data) {
  const p = PALETTES[data.color] || PALETTES.cool;
  const items = data.items || [];

  const itemsHtml = items.map((item, i) => `
    <div class="tl-item">
      <div class="tl-dot" style="background:${p.stripColors[i % p.stripColors.length]}">
        ${item.emoji ? esc(item.emoji) : (i + 1)}
      </div>
      <div class="tl-content">
        <div class="tl-name">${esc(item.name)}</div>
        ${item.description ? `<div class="tl-desc">${esc(item.description)}</div>` : ''}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><style>
${COMMON_STYLES}
body { background: ${p.bg1}; color: ${p.text}; }
.header {
  background: ${p.headerBg};
  padding: 36px 30px; text-align: center;
}
.header h1 {
  font-size: 42px; font-weight: 800; color: ${p.headerText};
  text-shadow: 1px 2px 4px rgba(0,0,0,.2);
}
.header .sub { margin-top: 6px; color: rgba(255,255,255,.8); font-size: 14px; }
.timeline { padding: 28px 40px 32px; position: relative; }
.timeline::before {
  content: ''; position: absolute; left: 64px; top: 28px; bottom: 32px;
  width: 3px; background: ${p.accent}20; border-radius: 2px;
}
.tl-item { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; position: relative; }
.tl-dot {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: #fff;
  flex-shrink: 0; z-index: 1;
}
.tl-content { flex: 1; padding-top: 8px; }
.tl-name { font-size: 17px; font-weight: 700; margin-bottom: 3px; }
.tl-desc { font-size: 13px; color: ${p.textMuted}; line-height: 1.55; }
.footer {
  background: ${p.footerBg};
  padding: 14px 24px; text-align: center;
  color: rgba(255,255,255,.85); font-size: 11px;
}
</style></head><body>
<div class="header">
  <h1>${esc(data.title || 'Tiêu đề')}</h1>
  ${data.subtitle ? `<p class="sub">${esc(data.subtitle)}</p>` : ''}
</div>
<div class="timeline">${itemsHtml}</div>
${data.footer ? `<div class="footer">${esc(data.footer)}</div>` : ''}
</body></html>`;
}

const TEMPLATES = { 'food-guide': foodGuide, 'list-cards': listCards, grid, timeline };

function generateHtml(data) {
  const templateFn = TEMPLATES[data.template];
  if (!templateFn) {
    const available = Object.keys(TEMPLATES).join(', ');
    throw new Error(`Unknown template "${data.template}". Available: ${available}`);
  }
  return templateFn(data);
}

module.exports = { generateHtml, TEMPLATES, PALETTES };
