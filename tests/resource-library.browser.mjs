import { chromium, expect } from '@playwright/test';
import { preview } from 'vite';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Run after building: node tests/resource-library.browser.mjs
const server = await preview({ configFile: false, plugins: [{ name: 'static-astro-routes', configurePreviewServer(server) {
  server.middlewares.use((request, response, next) => {
    const url = new URL(request.url, 'http://localhost');
    const route = url.pathname.replace(/\/$/, '');
    if (existsSync(path.join(process.cwd(), 'dist', route, 'index.html'))) request.url = `${route}/index.html${url.search}`;
    next();
  });
} }], preview: { host: '127.0.0.1', port: 4174, strictPort: true } });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const screenshots = path.resolve('../ui-review');
await mkdir(screenshots, { recursive: true });
const context = await browser.newContext({ viewport: { width: 1366, height: 1000 }, colorScheme: 'light' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = 'http://127.0.0.1:4174';
async function ready() { await expect(page.locator('.library-load-status')).toHaveCount(0); await expect(page.locator('.library-more-button').first()).toBeEnabled(); }
async function noOverflow() { expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); }
try {
  await page.goto(`${base}/`);
  await expect(page.getByRole('navigation', { name: 'Choose your class' }).getByRole('link')).toHaveCount(4);
  await page.screenshot({ path: path.join(screenshots, 'home-desktop.png'), fullPage: true, animations: 'disabled' });
  await page.goto(`${base}/study-materials`);
  await ready();
  await expect(page.locator('#subject-title')).toContainText('Biology');
  await page.getByRole('navigation', { name: 'Class 10 subjects' }).getByRole('link', { name: /Physics/ }).click();
  await expect(page.locator('#subject-title')).toContainText('Physics');
  const guides = page.locator('.library-category').first();
  await expect(guides.locator('.library-files a')).toHaveCount(3);
  expect(await guides.locator('.library-fade-preview').evaluate(element => getComputedStyle(element).filter)).toContain('blur');
  await guides.getByRole('button', { name: /Show more/ }).click();
  await expect(guides.locator('.library-files a')).toHaveCount(15);
  await guides.getByRole('button', { name: 'Show less' }).click();
  await expect(guides.locator('.library-files a')).toHaveCount(3);
  const papers = page.locator('.library-category').filter({ has: page.getByRole('heading', { name: 'Sample Papers', exact: true }) });
  await papers.locator('summary').click();
  await expect(papers.locator('.library-files a')).toHaveCount(3);
  for (let i = 0; i < 3; i++) await papers.getByRole('button', { name: /Show more/ }).click();
  await expect(papers.locator('.library-files a')).toHaveCount(53);
  await papers.getByRole('button', { name: 'Show less' }).click();
  await papers.locator('summary').click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(screenshots, 'resources-desktop-light.png'), fullPage: true, animations: 'disabled' });
  await page.goBack();
  await expect(page.locator('#subject-title')).toContainText('Biology');
  await page.goForward();
  await expect(page.locator('#subject-title')).toContainText('Physics');
  await page.getByRole('searchbox', { name: 'Search all Class 10 resources' }).fill('physics vatsal');
  await expect(page.locator('.library-results .library-file-name').first()).toContainText('Vatsal');
  await page.getByRole('searchbox', { name: 'Search all Class 10 resources' }).fill('randomwordthatcannotmatch12345');
  await expect(page.getByRole('heading', { name: 'No matching resources yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('#subject-title')).toContainText('Physics');
  await page.getByRole('button', { name: 'Sample papers', exact: true }).click();
  await page.getByLabel('Subject', { exact: true }).selectOption('physics');
  await expect(page.locator('.library-results [role="status"]')).toContainText('54 results');
  await page.getByRole('button', { name: 'Back to subjects' }).click();
  for (const grade of [12, 11, 9]) {
    await page.locator(`[data-class-link="${grade}"]`).click();
    await expect(page.getByRole('heading', { name: `Class ${grade} resources are on the way.` })).toBeVisible();
    await expect(page.locator(`[data-class-link="${grade}"]`)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.resource-library')).toHaveCount(0);
  }
  await page.getByRole('link', { name: 'Explore Class 10 resources', exact: true }).click();
  await ready();
  await page.goto(`${base}/study-materials#history-civics`);
  await ready();
  await expect(page.locator('#subject-title')).toContainText('History & Civics');
  await page.goto(`${base}/study-materials#physics`);
  await ready();
  for (const width of [360, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow();
    if (width < 1024) {
      const menu = page.getByRole('button', { name: 'Open navigation menu' });
      await menu.click();
      await expect(page.locator('#mobile-nav-toggle')).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(page.locator('#mobile-nav-toggle')).toHaveAttribute('aria-expanded', 'false');
    }
    if (width === 360) {
      await page.getByLabel('Choose a subject', { exact: true }).selectOption('maths');
      await expect(page.locator('#subject-title')).toContainText('Maths');
      await page.getByLabel('Choose a subject', { exact: true }).selectOption('physics');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(screenshots, 'resources-mobile-light.png'), fullPage: true, animations: 'disabled' });
    }
  }
  await page.getByRole('button', { name: 'Search resources', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search study files' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await page.getByRole('dialog').evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  expect(await page.getByRole('dialog').evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Search resources', exact: true })).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search study files' })).toBeFocused();
  await page.keyboard.press('Escape');
  await page.evaluate(() => { localStorage.setItem('theme', 'dark'); document.documentElement.classList.add('dark'); });
  await page.screenshot({ path: path.join(screenshots, 'resources-desktop-dark.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(screenshots, 'resources-mobile-dark.png'), fullPage: true, animations: 'disabled' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.library-content > section').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  // A failed data request keeps real previews usable and can be retried.
  await page.route('**/data/study-materials.json', route => route.abort());
  await page.goto(`${base}/study-materials`);
  await expect(page.getByRole('status')).toContainText('full library couldn’t load');
  await expect(page.locator('.library-category').first().locator('.library-files a')).toHaveCount(3);
  await page.unroute('**/data/study-materials.json');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await ready();
  const plainContext = await browser.newContext({ javaScriptEnabled: false });
  const plainPage = await plainContext.newPage();
  await plainPage.goto(`${base}/study-materials`);
  await plainPage.getByRole('link', { name: 'Browse all Class 10 resources' }).click();
  await expect(plainPage.locator('.file-list a')).toHaveCount(6294);
  await plainContext.close();
  expect(errors).toEqual([]);
  console.log('PASS: class placeholders, subject history/deep links, complete category expansion, search/filter/reset, responsive overflow, mobile menu, global search, reduced motion, and no browser errors.');
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}

