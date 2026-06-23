const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const today = new Date().toISOString().slice(0, 10);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(rootDir, relativePath), content, 'utf8');
}

function indent(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(value) {
  const escaped = escapeHtml(value);
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function replaceBuildSection(content, marker, html) {
  const pattern = new RegExp(
    `([ \\t]*<!-- build:${marker}:start -->)[\\s\\S]*?([ \\t]*<!-- build:${marker}:end -->)`,
    'm'
  );

  return content.replace(pattern, (_, start, end) => {
    return `${start}\n${html}\n${end}`;
  });
}

function replaceLiteral(content, search, replacement) {
  if (!content.includes(search)) {
    throw new Error(`Literal not found: ${search}`);
  }
  return content.replace(search, replacement);
}

function replaceFaqJsonLd(content, replacement) {
  const pattern = /("mainEntity": )(?:"__BUILD_SHARED_FAQ_JSONLD__"|\[[\s\S]*?\])(\s*\n\s*})/m;
  if (!pattern.test(content)) {
    throw new Error('FAQ JSON-LD mainEntity block not found');
  }
  return content.replace(pattern, `$1${replacement}$2`);
}

function renderIndustryInsights() {
  const data = readJson('data/industry_insights.json');
  const featured = data.featured;
  const secondary = data.secondary
    .map((item) => {
      return `
<article
  class="bg-surface-container-lowest p-6 rounded-3xl hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/10">
  <div class="flex gap-4 mb-4">
    <div class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-container-high">
      <img class="w-full h-full object-cover"
        data-alt="${item.imageAlt}"
        src="${item.image}" />
    </div>
    <div>
      <span class="text-[10px] font-bold text-${item.summaryTheme} uppercase tracking-tighter">${item.category}</span>
      <h3 class="font-bold text-lg leading-tight mt-1">${item.title}</h3>
    </div>
  </div>
  <div class="bg-${item.summaryTheme}-fixed/30 p-4 rounded-xl">
    <div class="flex items-center gap-2 mb-1">
      <span class="material-symbols-outlined text-[14px] text-${item.summaryTheme}">${item.summaryIcon}</span>
      <span class="text-[10px] font-bold text-${item.summaryTheme} uppercase">${item.summaryLabel}</span>
    </div>
    <p class="text-xs text-on-surface-variant line-clamp-2">${item.summary}</p>
  </div>
</article>`.trim();
    })
    .join('\n        ');

  return indent(
    `<!-- Bento Grid Insights -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-8">
  <!-- Featured Article -->
  <article class="md:col-span-8 group cursor-pointer">
    <div class="relative overflow-hidden rounded-3xl aspect-[16/9] mb-6 bg-surface-container-high">
      <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        data-alt="${featured.imageAlt}"
        src="${featured.image}" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      <div class="absolute bottom-8 left-8 right-8 text-white">
        <span class="px-3 py-1 bg-tertiary-container rounded-lg text-xs font-bold mb-4 inline-block">${featured.badge}</span>
        <h2 class="text-3xl font-bold font-headline mb-4">${featured.title}</h2>
        <div class="flex items-center gap-4 text-sm font-medium opacity-90">
          <span>作者: ${featured.author}</span>
          <span class="w-1 h-1 rounded-full bg-white"></span>
          <span>${featured.readTime}</span>
        </div>
      </div>
    </div>
    <div class="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20">
      <div class="flex items-start gap-4 mb-4">
        <span class="material-symbols-outlined material-symbols-filled text-primary">${featured.summaryIcon}</span>
        <div>
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1">${featured.summaryLabel}</p>
          <p class="text-on-surface-variant leading-relaxed italic">"${featured.summary}"</p>
        </div>
      </div>
      <button class="mt-4 flex items-center gap-2 text-primary font-bold text-sm group">
        阅读全文 <span
          class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    </div>
  </article>
  <!-- Secondary Articles Column -->
  <div class="md:col-span-4 flex flex-col gap-8">
        ${secondary}
  </div>
</div>`,
    4
  );
}

function renderCustomerLogos() {
  const data = readJson('data/customer_logos.json');
  const slides = data.groups
    .map((group, groupIndex) => {
      const cards = group.items
        .map((item) => {
          return `
<div class="customer-logo-card">
  <img alt="${item.alt}" src="${item.image}" />
  <p>${item.name}</p>
  <span>${item.label}</span>
</div>`.trim();
        })
        .join('\n              ');

      return `
<div class="customer-logo-slide${groupIndex === 0 ? ' is-active' : ''}" data-customer-slide>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              ${cards}
  </div>
</div>`.trim();
    })
    .join('\n          ');

  return indent(
    `<div class="customer-carousel" data-customer-carousel>
          ${slides}
        </div>`,
    8
  );
}

function renderCaseImage(caseItem) {
  const imageClasses = [
    caseItem.layout === 'image-left' ? 'lg:col-span-3 lg:order-1 order-2' : 'lg:col-span-3',
    'relative aspect-[4/3] bg-cover bg-center rounded-3xl overflow-hidden shadow-2xl group',
    caseItem.imageClass,
  ].join(' ');

  if (caseItem.overlayBadgeLabel) {
    return `
<div
  class="${imageClasses}"
  data-alt="${caseItem.imageAlt}">
  <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
  <div
    class="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl flex items-center gap-4">
    <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
      <span class="material-symbols-outlined">${caseItem.overlayBadgeIcon}</span>
    </div>
    <div>
      <p class="text-[10px] font-bold text-secondary uppercase tracking-wider">${caseItem.overlayBadgeLabel}</p>
      <p class="text-base font-bold text-on-surface">${caseItem.overlayBadgeValue}</p>
    </div>
  </div>
</div>`.trim();
  }

  if (caseItem.overlayTag) {
    return `
<div
  class="${imageClasses}"
  data-alt="${caseItem.imageAlt}">
  <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
  <div
    class="absolute top-8 left-8 bg-primary/90 backdrop-blur-md text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-3">
    <span class="material-symbols-outlined">${caseItem.overlayTagIcon}</span>
    ${caseItem.overlayTag}
  </div>
</div>`.trim();
  }

  if (caseItem.stats) {
    const stats = caseItem.stats
      .map(
        (stat) => `
<div class="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary/10">
  <p class="text-[10px] text-secondary font-bold uppercase">${stat.label}</p>
  <p class="text-2xl font-black ${stat.label === '实时温度' ? 'text-primary' : 'text-on-surface'}">${stat.value}</p>
</div>`.trim()
      )
      .join('\n      ');

    return `
<div
  class="${imageClasses}"
  data-alt="${caseItem.imageAlt}">
  <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
  <div class="absolute bottom-8 left-8 flex gap-3">
      ${stats}
  </div>
</div>`.trim();
  }

  return `
<div
  class="${imageClasses}"
  data-alt="${caseItem.imageAlt}">
  <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
  <div class="absolute inset-0 flex items-center justify-center">
    <div
      class="bg-primary/80 backdrop-blur-md p-10 rounded-full border-4 border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
      <span class="material-symbols-outlined text-5xl text-white">${caseItem.centerIcon}</span>
    </div>
  </div>
</div>`.trim();
}

function renderCaseText(caseItem, reverseOrder) {
  const orderClass = reverseOrder ? 'lg:col-span-2 lg:order-2 order-1' : 'lg:col-span-2';
  return `
<div class="${orderClass} flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <span class="text-primary font-bold text-sm tracking-wider uppercase">${caseItem.category}</span>
    <h3 class="text-4xl font-bold text-on-surface font-headline leading-tight">${caseItem.title}</h3>
    <div class="space-y-4">
      <div class="flex gap-3">
        <span class="material-symbols-outlined text-primary">${caseItem.painPointIcon}</span>
        <div>
          <p class="font-bold text-on-surface text-sm">${caseItem.painPointTitle}</p>
          <p class="text-on-surface-variant text-sm">${caseItem.painPoint}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-6">
    <div class="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
      <p class="text-xs font-bold text-primary uppercase mb-2">达康解决方案</p>
      <p class="text-sm text-on-surface-variant">${caseItem.solution}</p>
    </div>
    <div class="bg-primary/5 p-6 rounded-xl">
      <p class="text-xs font-bold text-primary uppercase mb-2">${caseItem.metricLabel}</p>
      <div class="flex items-baseline gap-2">
        <span class="text-4xl font-black text-primary">${caseItem.metricValue}</span>
        <span class="text-sm text-on-surface-variant font-medium">${caseItem.metricText}</span>
      </div>
    </div>
  </div>
  <button class="flex items-center gap-2 text-primary font-bold text-sm group">
    深度阅读案例研究 <span
      class="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
  </button>
</div>`.trim();
}

function renderCustomerCases() {
  const data = readJson('data/customer_cases.json');
  const blocks = data.cases
    .map((caseItem, index) => {
      const reverse = caseItem.layout === 'image-left';
      const commentLabels = ['Government', 'Education', 'Medical', 'Catering'];
      const commentPosition = reverse ? 'Image Left, Text Right' : 'Text Left, Image Right';
      const textBlock = renderCaseText(caseItem, reverse);
      const imageBlock = renderCaseImage(caseItem);
      const content = reverse ? `${imageBlock}\n          ${textBlock}` : `${textBlock}\n          ${imageBlock}`;

      return `<!-- Case ${index + 1}: ${commentLabels[index] || caseItem.slug} (${commentPosition}) -->
<div class="grid lg:grid-cols-5 gap-16 items-center">
          ${content}
</div>`;
    })
    .join('\n        ');

  return indent(blocks, 8);
}

function renderCommonProblems() {
  const data = readJson('data/common_problems.json');
  const cards = data.items
    .map((item, index) => {
      return `<!-- Q${index + 1} -->
<article
  class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow group flex flex-col">
  <div class="flex items-start gap-4 mb-4">
    <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
      <span class="material-symbols-outlined font-semibold">${item.icon}</span>
    </div>
    <h3 class="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">${item.question}</h3>
  </div>
  <p class="text-on-surface-variant leading-relaxed">
    ${renderInlineMarkdown(item.answer)}
  </p>
</article>`;
    })
    .join('\n        ');

  return indent(
    `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${cards}
      </div>`,
    6
  );
}

function renderSharedFaqCards() {
  const data = readJson('data/shared_faq.json');
  const cards = data.items
    .map((item) => {
      return `<article class="rounded-2xl bg-white border border-outline-variant/60 p-7 shadow-sm">
  <h3 class="font-bold text-lg">${item.question}</h3>
  <p class="mt-3 text-sm leading-7 text-slate-600">${item.answer}</p>
</article>`;
    })
    .join('\n          ');

  return indent(
    `<div class="mt-10 grid lg:grid-cols-2 gap-6">
          ${cards}
        </div>`,
    8
  );
}

function renderSharedFaqJsonLd() {
  const data = readJson('data/shared_faq.json');
  return JSON.stringify(
    data.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    null,
    6
  );
}

function updateSitemap(content) {
  return content.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
}

function buildFile(relativePath, transforms) {
  let content = readFile(relativePath);
  for (const transform of transforms) {
    content = transform(content);
  }
  writeFile(relativePath, content);
}

function main() {
  buildFile('pages/industry_insights.html', [
    (content) => replaceBuildSection(content, 'industry-insights', renderIndustryInsights()),
  ]);

  buildFile('pages/customer_case.html', [
    (content) => replaceBuildSection(content, 'customer-logos', renderCustomerLogos()),
    (content) => replaceBuildSection(content, 'customer-cases', renderCustomerCases()),
  ]);

  buildFile('pages/common_problems.html', [
    (content) => replaceBuildSection(content, 'common-problems', renderCommonProblems()),
  ]);

  for (const file of ['index.html', 'pages/company_profile.html']) {
    buildFile(file, [
      (content) => replaceBuildSection(content, 'shared-faq-cards', renderSharedFaqCards()),
      (content) => replaceFaqJsonLd(content, renderSharedFaqJsonLd()),
    ]);
  }

  buildFile('sitemap.xml', [updateSitemap]);
}

main();
