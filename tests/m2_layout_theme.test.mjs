#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    \x1b[31m${err.message}\x1b[0m`);
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    \x1b[31m${err.message}\x1b[0m`);
  }
}

console.log('\n\x1b[1m\x1b[36m=== Milestone 2: Layout, Styles & Theme System Verification Suite ===\x1b[0m\n');

// -------------------------------------------------------------
// Suite 1: Tailwind CSS Configuration (tailwind.config.mjs)
// -------------------------------------------------------------
console.log('\x1b[1m\x1b[34m▶ Suite 1: Tailwind CSS Configuration (tailwind.config.mjs)\x1b[0m');

const tailwindPath = path.join(ROOT, 'tailwind.config.mjs');
test('tailwind.config.mjs exists', () => {
  assert.ok(fs.existsSync(tailwindPath), 'tailwind.config.mjs should exist at root');
});

await asyncTest('tailwind.config.mjs exports valid ESM config with darkMode: ["class"]', async () => {
  const tailwindModule = await import(pathToFileURL(tailwindPath).href);
  const config = tailwindModule.default;
  assert.ok(config, 'Config must have default export');
  assert.deepEqual(config.darkMode, ['class'], 'darkMode must be ["class"]');
});

await asyncTest('tailwind.config.mjs includes all Astro, JSX, TSX content paths', async () => {
  const tailwindModule = await import(pathToFileURL(tailwindPath).href);
  const config = tailwindModule.default;
  assert.ok(Array.isArray(config.content), 'content must be an array');
  const globPattern = config.content.find(p => p.includes('astro') && p.includes('tsx'));
  assert.ok(globPattern, 'content must include glob with astro and tsx');
});

await asyncTest('tailwind.config.mjs maps all required HSL color tokens', async () => {
  const tailwindModule = await import(pathToFileURL(tailwindPath).href);
  const colors = tailwindModule.default.theme.extend.colors;
  const requiredTokens = [
    'background', 'foreground', 'primary', 'secondary',
    'muted', 'accent', 'destructive', 'border', 'input',
    'ring', 'card', 'popover'
  ];

  for (const token of requiredTokens) {
    assert.ok(colors[token], `Token ${token} must be defined in colors`);
    const val = typeof colors[token] === 'object' ? colors[token].DEFAULT : colors[token];
    assert.ok(val.includes(`var(--${token})`), `Token ${token} value must reference var(--${token})`);
  }
});

await asyncTest('tailwind.config.mjs includes accordion, fade-in, and scale-in keyframes & animations', async () => {
  const tailwindModule = await import(pathToFileURL(tailwindPath).href);
  const keyframes = tailwindModule.default.theme.extend.keyframes;
  const animation = tailwindModule.default.theme.extend.animation;

  const requiredKeyframes = ['accordion-down', 'accordion-up', 'fade-in', 'scale-in'];
  for (const k of requiredKeyframes) {
    assert.ok(keyframes[k], `Keyframe ${k} must be defined`);
    assert.ok(animation[k], `Animation ${k} must be defined`);
  }
});

// -------------------------------------------------------------
// Suite 2: Global Stylesheet & Animations (src/index.css)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[34m▶ Suite 2: Global Stylesheet & Animations (src/index.css)\x1b[0m');

const cssPath = path.join(ROOT, 'src/index.css');
test('src/index.css exists', () => {
  assert.ok(fs.existsSync(cssPath), 'src/index.css must exist');
});

const cssContent = fs.readFileSync(cssPath, 'utf8');

test('src/index.css defines Tailwind directives', () => {
  assert.match(cssContent, /@tailwind\s+base;/);
  assert.match(cssContent, /@tailwind\s+components;/);
  assert.match(cssContent, /@tailwind\s+utilities;/);
});

test('src/index.css contains :root and .dark HSL design tokens', () => {
  assert.match(cssContent, /:root\s*\{/);
  assert.match(cssContent, /\.dark\s*\{/);
  assert.match(cssContent, /--background:/);
  assert.match(cssContent, /--foreground:/);
  assert.match(cssContent, /--primary:/);
  assert.match(cssContent, /--border:/);
});

test('src/index.css defines splash screen 3D book keyframes and classes', () => {
  assert.match(cssContent, /@keyframes\s+splash-book-shrink/);
  assert.match(cssContent, /@keyframes\s+book-cover-open/);
  assert.match(cssContent, /@keyframes\s+book-page-1/);
  assert.match(cssContent, /@keyframes\s+book-page-2/);
  assert.match(cssContent, /@keyframes\s+book-page-3/);
  assert.match(cssContent, /@keyframes\s+splash-text-in/);
  assert.match(cssContent, /@keyframes\s+splash-bar-grow/);
  assert.match(cssContent, /@keyframes\s+splash-fade-out/);
  assert.match(cssContent, /\.splash-book/);
  assert.match(cssContent, /\.book-cover/);
});

test('src/index.css defines folder navigation slide animation keyframes and classes', () => {
  assert.match(cssContent, /@keyframes\s+slide-out-left/);
  assert.match(cssContent, /@keyframes\s+slide-out-right/);
  assert.match(cssContent, /@keyframes\s+slide-in-from-right/);
  assert.match(cssContent, /@keyframes\s+slide-in-from-left/);
  assert.match(cssContent, /\.slide-exit-left/);
  assert.match(cssContent, /\.slide-exit-right/);
  assert.match(cssContent, /\.slide-enter-left/);
  assert.match(cssContent, /\.slide-enter-right/);
});

// -------------------------------------------------------------
// Suite 3: Base Layout & Zero-FOUC Theme Hydration (src/layouts/BaseLayout.astro)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[34m▶ Suite 3: Base Layout & Zero-FOUC Theme Hydration (src/layouts/BaseLayout.astro)\x1b[0m');

const layoutPath = path.join(ROOT, 'src/layouts/BaseLayout.astro');
test('src/layouts/BaseLayout.astro exists', () => {
  assert.ok(fs.existsSync(layoutPath), 'BaseLayout.astro must exist');
});

const layoutContent = fs.readFileSync(layoutPath, 'utf8');

test('BaseLayout imports Header, Footer, and index.css', () => {
  assert.match(layoutContent, /import\s+Header\s+from\s+["']\.\.\/components\/Header\.astro["']/);
  assert.match(layoutContent, /import\s+Footer\s+from\s+["']\.\.\/components\/Footer\.astro["']/);
  assert.match(layoutContent, /import\s+["']\.\.\/index\.css["']/);
});

test('BaseLayout contains zero-FOUC synchronous inline script in <head>', () => {
  assert.match(layoutContent, /<script\s+is:inline>[\s\S]*?<\/script>/i);
  assert.match(layoutContent, /localStorage\.getItem\(['"]theme['"]\)/);
  assert.match(layoutContent, /matchMedia\(['"]\(prefers-color-scheme:\s*dark\)['"]\)/);
  assert.match(layoutContent, /document\.documentElement\.classList\.add\(['"]dark['"]\)/);
  assert.match(layoutContent, /document\.documentElement\.classList\.remove\(['"]dark['"]\)/);
});

test('BaseLayout includes essential SEO and social metadata tags', () => {
  assert.match(layoutContent, /<meta\s+charset="UTF-8"\s*\/>/i);
  assert.match(layoutContent, /<meta[^>]+name="viewport"[^>]+content=/i);
  assert.match(layoutContent, /<meta[^>]+name="description"[^>]+content=/i);
  assert.match(layoutContent, /<link[^>]+rel="icon"[^>]+href="\/favicon\.svg"/i);
  assert.match(layoutContent, /<meta[^>]+property="og:image"[^>]+content=/i);
});

test('BaseLayout renders Header, <main class="min-h-screen">, Footer, and modals slot', () => {
  assert.match(layoutContent, /<Header\s+/);
  assert.match(layoutContent, /<main[^>]*class="[^"]*min-h-screen[^"]*"[^>]*>/);
  assert.match(layoutContent, /<slot\s*\/>/);
  assert.match(layoutContent, /<Footer\s*\/>/);
  assert.match(layoutContent, /<slot\s+name="modals"\s*\/>/);
});

// -------------------------------------------------------------
// Suite 4: Header Component (src/components/Header.astro)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[34m▶ Suite 4: Header Component (src/components/Header.astro)\x1b[0m');

const headerPath = path.join(ROOT, 'src/components/Header.astro');
test('src/components/Header.astro exists', () => {
  assert.ok(fs.existsSync(headerPath), 'Header.astro must exist');
});

const headerContent = fs.readFileSync(headerPath, 'utf8');

test('Header renders site title and logo linking to /', () => {
  assert.match(headerContent, /<a[^>]+href="\/"[^>]*>[\s\S]*?ICSE[\s\S]*?Resources[\s\S]*?<\/a>/i);
});

test('Header contains static navigation links to core sections', () => {
  assert.match(headerContent, /href="\/study-materials"/);
  assert.match(headerContent, /href="\/cisce"/);
  assert.match(headerContent, /href="\/quizzes"/);
  assert.match(headerContent, /href="\/about"/);
  assert.match(headerContent, /href="\/contact"/);
});

test('Header includes Search trigger button with Ctrl+K badge dispatching app:open-modal', () => {
  assert.match(headerContent, /app:open-modal/);
  assert.match(headerContent, /modal:\s*['"]search['"]/);
  assert.match(headerContent, /Ctrl\+K/);
});

test('Header registers global Ctrl+K keyboard shortcut', () => {
  assert.match(headerContent, /(ctrlKey|metaKey)[\s\S]*?(k|K)/);
  assert.match(headerContent, /dispatchEvent\(new\s+CustomEvent\(['"]app:open-modal['"]/);
});

test('Header includes Donate, Info, Discord, Reddit, and GitHub action triggers', () => {
  assert.match(headerContent, /modal:\s*['"]donate['"]/);
  assert.match(headerContent, /modal:\s*['"]info['"]/);
  assert.match(headerContent, /discord\.gg\/xGD8SnvuKX/);
  assert.match(headerContent, /reddit\.com\/r\/ICSE/);
  assert.match(headerContent, /github\.com\/Jivaansh-Yadav\/class-10-icse/);
});

test('Header mounts ThemeToggle island with client:load', () => {
  assert.match(headerContent, /<ThemeToggle\s+client:load\s*\/>/);
});

// -------------------------------------------------------------
// Suite 5: Footer Component (src/components/Footer.astro)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[34m▶ Suite 5: Footer Component (src/components/Footer.astro)\x1b[0m');

const footerPath = path.join(ROOT, 'src/components/Footer.astro');
test('src/components/Footer.astro exists', () => {
  assert.ok(fs.existsSync(footerPath), 'Footer.astro must exist');
});

const footerContent = fs.readFileSync(footerPath, 'utf8');

test('Footer contains compliance links (/privacy, /about, /contact, /study-materials, /cisce)', () => {
  assert.match(footerContent, /href="\/privacy"/);
  assert.match(footerContent, /href="\/about"/);
  assert.match(footerContent, /href="\/contact"/);
  assert.match(footerContent, /href="\/study-materials"/);
  assert.match(footerContent, /href="\/cisce"/);
});

test('Footer includes mandatory Google AdSense third-party cookie disclosure', () => {
  assert.match(footerContent, /Google AdSense/i);
  assert.match(footerContent, /cookies/i);
  assert.match(footerContent, /advertising/i);
  assert.match(footerContent, /AboutAds\.info/i);
});

test('Footer includes disclaimer regarding independence from CISCE', () => {
  assert.match(footerContent, /Disclaimer:/i);
  assert.match(footerContent, /not officially affiliated with, endorsed by, or sponsored by/i);
  assert.match(footerContent, /CISCE/i);
});

test('Footer includes copyright notice and developer attribution', () => {
  assert.match(footerContent, /©\s*\{currentYear\}\s*ICSE Resources\.\s*All rights reserved\./);
  assert.match(footerContent, /Jivaansh Yadav/);
});

// -------------------------------------------------------------
// Suite 6: ThemeToggle Island (src/components/islands/ThemeToggle.tsx)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[34m▶ Suite 6: ThemeToggle Island (src/components/islands/ThemeToggle.tsx)\x1b[0m');

const togglePath = path.join(ROOT, 'src/components/islands/ThemeToggle.tsx');
test('src/components/islands/ThemeToggle.tsx exists', () => {
  assert.ok(fs.existsSync(togglePath), 'ThemeToggle.tsx must exist');
});

const toggleContent = fs.readFileSync(togglePath, 'utf8');

test('ThemeToggle imports React hooks and Sun/Moon from lucide-react', () => {
  assert.match(toggleContent, /import\s+React,\s*\{[^}]*useState[^}]*\}\s+from\s+["']react["']/);
  assert.match(toggleContent, /import\s+\{[^}]*Moon[^}]*Sun[^}]*\}\s+from\s+["']lucide-react["']/);
});

test('ThemeToggle toggles dark class on documentElement and updates localStorage', () => {
  assert.match(toggleContent, /document\.documentElement\.classList\.(add|remove)\(["']dark["']\)/);
  assert.match(toggleContent, /localStorage\.setItem\(["']theme["'],\s*nextTheme\)/);
  assert.match(toggleContent, /window\.dispatchEvent\(new\s+CustomEvent\(["']theme-change["']/);
});

test('ThemeToggle provides accessible aria-label="Toggle theme"', () => {
  assert.match(toggleContent, /aria-label=["']Toggle theme["']/);
  assert.match(toggleContent, /title=["']Toggle theme["']/);
});

// -------------------------------------------------------------
// Suite 7: Zero-FOUC Theme Logic Simulation
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[34m▶ Suite 7: Zero-FOUC Theme Logic Simulation\x1b[0m');

function simulateAntiFOUCScript(mockLocalStorageTheme, mockPrefersDark) {
  const classList = new Set();
  const mockDocumentElement = {
    classList: {
      add: (c) => classList.add(c),
      remove: (c) => classList.delete(c),
      contains: (c) => classList.has(c),
    }
  };

  // Replicate exact script logic from BaseLayout.astro
  const stored = mockLocalStorageTheme;
  const prefersDark = mockPrefersDark;
  const theme = stored ? stored : (prefersDark ? 'dark' : 'light');
  if (theme === 'dark') {
    mockDocumentElement.classList.add('dark');
  } else {
    mockDocumentElement.classList.remove('dark');
  }

  return classList.has('dark') ? 'dark' : 'light';
}

test('Anti-FOUC logic respects explicit dark localStorage', () => {
  const result = simulateAntiFOUCScript('dark', false);
  assert.equal(result, 'dark');
});

test('Anti-FOUC logic respects explicit light localStorage even if OS prefers dark', () => {
  const result = simulateAntiFOUCScript('light', true);
  assert.equal(result, 'light');
});

test('Anti-FOUC logic falls back to prefers-color-scheme dark when localStorage empty', () => {
  const result = simulateAntiFOUCScript(null, true);
  assert.equal(result, 'dark');
});

test('Anti-FOUC logic falls back to prefers-color-scheme light when localStorage empty', () => {
  const result = simulateAntiFOUCScript(null, false);
  assert.equal(result, 'light');
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
console.log(`Total: ${totalTests} | Passed: \x1b[32m${passedTests}\x1b[0m | Failed: \x1b[31m${failedTests}\x1b[0m`);
console.log('-------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
