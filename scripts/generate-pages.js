import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PAGES } from './pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const templatePath = path.join(rootDir, 'index.html');
const template = fs.readFileSync(templatePath, 'utf8');

const pages = PAGES;

console.log('Generating separate HTML pages inside pages/ directory...');

pages.forEach((page) => {
  let content = template;

  // 1. Replace Title
  content = content.replace(
    /<title>.*?<\/title>/s,
    `<title>${page.title}</title>`
  );

  // 2. Replace Meta Description
  content = content.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/>/s,
    `<meta name="description" content="${page.description}" />`
  );

  // 3. Replace Canonical Link
  content = content.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/>/s,
    `<link rel="canonical" href="${page.canonical}" />`
  );

  // 4. Replace Open Graph Tags
  content = content.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/>/s,
    `<meta property="og:title" content="${page.title}" />`
  );
  content = content.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/>/s,
    `<meta property="og:description" content="${page.description}" />`
  );
  content = content.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/>/s,
    `<meta property="og:url" content="${page.canonical}" />`
  );

  // 5. Replace Twitter Cards
  content = content.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/>/s,
    `<meta name="twitter:title" content="${page.title}" />`
  );
  content = content.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/>/s,
    `<meta name="twitter:description" content="${page.description}" />`
  );

  // Each generated document knows its route and its source/build depth.
  const depth = page.filePath.split('/').length - 1;
  const context = '<script id="brik-page-context">window.__DEFAULT_ROUTE__ = ' + JSON.stringify(page.route) + '; window.__BRIK_PAGE__ = ' + JSON.stringify({sourceDepth:depth,outputDepth:depth-1}) + ';</script>';
  content = content.replace(/<script id="brik-page-context">[\s\S]*?<\/script>/, context);
  if (page.private) content = content.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');

  const destPath = path.join(rootDir, page.filePath);
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`✓ Generated: ${page.filePath} (${page.route})`);
});

console.log('Generated ' + pages.length + ' separate pages.');
