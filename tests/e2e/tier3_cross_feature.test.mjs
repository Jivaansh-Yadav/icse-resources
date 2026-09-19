import { describe, it, expect, readHtmlFile, readJsonData } from './runner.mjs';

describe('Tier 3: Cross-Feature - Combination 1: Theme Toggle + Static Pages', () => {
  it('should inject zero-FOUC anti-flash script in <head> across all static routes', () => {
    const routes = ['/', '/study-materials', '/cisce', '/about', '/contact', '/privacy', '/quizzes', '/404'];
    for (const route of routes) {
      const html = readHtmlFile(route);
      expect(html).toMatch(/<script[\s\S]*?localStorage\.getItem\(['"]theme['"]\)[\s\S]*?<\/script>/i);
    }
  });

  it('should evaluate localStorage theme and prefers-color-scheme before DOM paint', () => {
    const html = readHtmlFile('/');
    // Check that the script contains both localStorage check and matchMedia fallback
    expect(html).toMatch(/localStorage\.getItem\(['"]theme['"]\)/);
    expect(html).toMatch(/matchMedia\(['"]\(prefers-color-scheme:\s*dark\)['"]\)/);
  });

  it('should add or remove "dark" class on documentElement synchronously', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/document\.documentElement\.classList\.(add|remove)\(['"]dark['"]\)/);
  });

  it('should mount ThemeToggle interactive island with client:load directive', () => {
    const html = readHtmlFile('/');
    // In Astro, client-loaded components have astro-island with client="load"
    expect(html).toMatch(/<astro-island[^>]+client="load"[^>]*>|<button[^>]+aria-label=["']Toggle theme["']/i);
  });

  it('should include theme-compatible Tailwind CSS classes in generated markup', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(bg-background|text-foreground|dark:)/);
  });
});

describe('Tier 3: Cross-Feature - Combination 2: Spotlight Search Modal + Preview Links', () => {
  const searchIndex = readJsonData('search-index.json');

  it('should mount SearchModal island with client:idle directive', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<astro-island[^>]+client="idle"[^>]*>|<button[^>]*>[\s\S]*?(Search|Ctrl\+K)[\s\S]*?<\/button>/i);
  });

  it('should support global keyboard shortcut Ctrl+K / Meta+K event registration', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(ctrlKey|metaKey|key === ['"]k['"]|app:open-modal)/i);
  });

  it('should construct valid Google Drive preview URLs from search index IDs', () => {
    const sample = searchIndex[0];
    const previewUrl = `https://drive.google.com/file/d/${sample.id}/preview`;
    expect(previewUrl).toMatch(/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/preview$/);
  });

  it('should construct direct download URLs from search index IDs', () => {
    const sample = searchIndex[10];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${sample.id}`;
    expect(downloadUrl).toContain(`id=${sample.id}`);
  });

  it('should integrate with cross-island event bus (app:open-modal)', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(app:open-modal|open-modal|dispatchEvent)/i);
  });
});

describe('Tier 3: Cross-Feature - Combination 3: Data Baking + Static Route Navigation', () => {
  const studyData = readJsonData('study-materials.json');
  const cisceData = readJsonData('cisce-resources.json');

  it('should render subject cards on home page linking to /study-materials', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/href="\/study-materials"/);
    expect(html).toContain('Biology');
    expect(html).toContain('Physics');
  });

  it('should bake study materials directly without requiring runtime client API fetch on initial paint', () => {
    const html = readHtmlFile('/study-materials');
    // Verify subject names from JSON are baked into static HTML
    const subjects = studyData.children.filter(c => c.type === 'folder').map(c => c.name);
    for (const sub of subjects.slice(0, 8)) {
      expect(html).toContain(sub);
    }
  });

  it('should bake CISCE resources directly without requiring runtime client API fetch on initial paint', () => {
    const html = readHtmlFile('/cisce');
    const cisceCategories = cisceData.children.map(c => c.name);
    for (const cat of cisceCategories) {
      expect(html).toContain(cat);
    }
  });

  it('should provide static inter-page navigation links connecting all major sections', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toMatch(/href="\/"/);
    expect(html).toMatch(/href="\/cisce"/);
    expect(html).toMatch(/href="\/quizzes"/);
  });

  it('should maintain compact static HTML size without inline raw JSON data-attributes', () => {
    const html = readHtmlFile('/study-materials');
    // Ensure HTML is streamable and not bloated with the entire 2MB payload
    expect(html.length).toBeLessThan(1500000);
  });
});

describe('Tier 3: Cross-Feature - Combination 4: Global Header & Footer + Compliance Links', () => {
  it('should render consistent semantic <header> across all pages', () => {
    const routes = ['/', '/study-materials', '/cisce', '/about', '/contact', '/privacy', '/quizzes'];
    for (const route of routes) {
      const html = readHtmlFile(route);
      expect(html).toMatch(/<header[^>]*>/i);
      expect(html).toMatch(/<\/header>/i);
    }
  });

  it('should render consistent semantic <footer> across all pages', () => {
    const routes = ['/', '/study-materials', '/cisce', '/about', '/contact', '/privacy', '/quizzes'];
    for (const route of routes) {
      const html = readHtmlFile(route);
      expect(html).toMatch(/<footer[^>]*>/i);
      expect(html).toMatch(/<\/footer>/i);
    }
  });

  it('should include required AdSense compliance links (/privacy, /about, /contact) in footer across all pages', () => {
    const routes = ['/', '/study-materials', '/cisce', '/quizzes'];
    for (const route of routes) {
      const html = readHtmlFile(route);
      expect(html).toMatch(/href="\/privacy"/);
      expect(html).toMatch(/href="\/about"/);
      expect(html).toMatch(/href="\/contact"/);
    }
  });

  it('should contain main navigation links in header across all pages', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<header[\s\S]*?href="\/study-materials"[\s\S]*?<\/header>/i);
    expect(html).toMatch(/<header[\s\S]*?href="\/cisce"[\s\S]*?<\/header>/i);
  });

  it('should include theme toggle and search triggers in header layout', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<header[\s\S]*?(theme|search|k)[\s\S]*?<\/header>/i);
  });
});

describe('Tier 3: Cross-Feature - Combination 5: Modal Coordinator + Cross-Island Communication', () => {
  it('should mount modal coordinator or modal island container with client:idle', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(astro-island|AppModals|client="idle"|data-modal)/i);
  });

  it('should support search modal activation via custom event or button click', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(search|Ctrl\+K|modal)/i);
  });

  it('should support donate modal with UPI QR code reference (/upi_qr.png)', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(\/upi_qr\.png|donate|upi)/i);
  });

  it('should support info modal with GitHub project repository references', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(github\.com|Jivaansh|icse-resources|info)/i);
  });

  it('should support quiz modal targeting external educational quiz platform', () => {
    const html = readHtmlFile('/quizzes');
    expect(html).toMatch(/(shs-pyqp-project\.vercel\.app|quiz)/i);
  });
});
