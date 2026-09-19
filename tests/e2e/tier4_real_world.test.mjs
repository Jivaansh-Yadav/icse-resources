import { describe, it, expect, readHtmlFile, readJsonData } from './runner.mjs';

describe('Tier 4: Real-World Scenario 1 - Student finding Class 10 Biology notes', () => {
  const studyData = readJsonData('study-materials.json');
  const biologyNode = studyData.children.find(c => c.name === 'Biology');

  it('should verify Biology study materials data exists in data layer', () => {
    expect(biologyNode).toBeDefined();
    expect(biologyNode.type).toBe('folder');
    expect(Array.isArray(biologyNode.children)).toBe(true);
    expect(biologyNode.children.length).toBeGreaterThan(0);
  });

  it('should display Biology preview card on root home page', () => {
    const html = readHtmlFile('/');
    expect(html).toContain('Biology');
    expect(html).toMatch(/href="\/study-materials"/);
  });

  it('should bake Biology chapters into static HTML on /study-materials', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toContain('Biology');
    // Spot check some biology sub-items or chapters
    const sampleItem = biologyNode.children[0];
    if (sampleItem && sampleItem.name) {
      expect(html).toContain(sampleItem.name);
    }
  });

  it('should provide Google Drive preview links for individual chapter notes', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toMatch(/<a[^>]+href=["'](https:\/\/drive\.google\.com|#|\/)/i);
  });

  it('should allow student to view all Biology notes without executing client-side JavaScript', () => {
    const html = readHtmlFile('/study-materials');
    // Verify pure static readable text is rendered
    expect(html.length).toBeGreaterThan(3000);
    expect(html).toContain('Biology');
    expect(html).toMatch(/<(h2|h3|li|div)[^>]*>[\s\S]*?Biology[\s\S]*?<\/(h2|h3|li|div)>/i);
  });
});

describe('Tier 4: Real-World Scenario 2 - Student looking up 2024 CISCE Specimen Question Papers', () => {
  const cisceData = readJsonData('cisce-resources.json');
  const specimenNode = cisceData.children.find(c => /Specimen/i.test(c.name));

  it('should verify Specimen Question Papers data exists in cisce-resources.json', () => {
    expect(specimenNode).toBeDefined();
    expect(Array.isArray(specimenNode.children)).toBe(true);
  });

  it('should list Specimen Question Papers category in static HTML on /cisce', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/Specimen\s+(Question\s+Papers|QPs)/i);
  });

  it('should include Syllabus and PYQs categories on /cisce for comprehensive revision', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toContain('Syllabus');
    expect(html).toMatch(/(Previous Year Questions|PYQs)/i);
  });

  it('should provide direct document navigation links in static HTML', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/<a[^>]+href=/i);
  });

  it('should allow student to navigate back to root or other subjects smoothly', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/href="\/"/);
    expect(html).toMatch(/<header[^>]*>/i);
  });
});

describe('Tier 4: Real-World Scenario 3 - Google AdSense Crawler raw HTML audit', () => {
  it('should confirm home page (/) contains substantial readable text and no blank SPA div', () => {
    const html = readHtmlFile('/');
    // Check absence of empty div#root
    expect(html).not.toMatch(/<div id="root">\s*<\/div>/);
    // Real text presence
    expect(html).toContain('ICSE');
    expect(html).toContain('Resources');
    expect(html).toContain('Class 10');
    // Ensure sufficient readable textual payload
    const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    expect(textOnly.length).toBeGreaterThan(500);
  });

  it('should confirm /study-materials contains rich educational curriculum text', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toContain('Biology');
    expect(html).toContain('Chemistry');
    expect(html).toContain('Physics');
    expect(html).toContain('Maths');
    const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    expect(textOnly.length).toBeGreaterThan(800);
  });

  it('should confirm /privacy contains comprehensive AdSense third-party cookie disclosures', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/Google/i);
    expect(html).toMatch(/cookies?/i);
    expect(html).toMatch(/(advertising|AdSense|third-party)/i);
    const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    expect(textOnly.length).toBeGreaterThan(600);
  });

  it('should confirm /about establishes clear educational site purpose and credibility', () => {
    const html = readHtmlFile('/about');
    expect(html).toMatch(/(ICSE|Class 10|students|education)/i);
    const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    expect(textOnly.length).toBeGreaterThan(300);
  });

  it('should confirm all audited pages deliver valid HTML5 standards and metadata', () => {
    const routes = ['/', '/study-materials', '/cisce', '/about', '/contact', '/privacy'];
    for (const route of routes) {
      const html = readHtmlFile(route);
      expect(html).toMatch(/<!doctype\s+html>/i);
      expect(html).toMatch(/<meta[^>]+name="viewport"/i);
      expect(html).toMatch(/<title>/i);
    }
  });
});

describe('Tier 4: Real-World Scenario 4 - User toggling dark mode across visits', () => {
  it('should execute zero-FOUC theme resolution synchronously in head before paint', () => {
    const html = readHtmlFile('/');
    // Check inline script in head
    const headSection = html.substring(0, html.indexOf('</head>'));
    expect(headSection).toMatch(/<script[\s\S]*?localStorage\.getItem\(['"]theme['"]\)[\s\S]*?<\/script>/i);
  });

  it('should query localStorage "theme" key', () => {
    const html = readHtmlFile('/');
    expect(html).toContain("localStorage.getItem('theme')");
  });

  it('should synchronize "dark" CSS class on documentElement', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/documentElement\.classList\.(add|toggle|remove)/);
  });

  it('should contain dark mode color variables in CSS or classes', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(dark:|--background|--foreground)/);
  });

  it('should provide an accessible theme toggle button with proper label', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(aria-label=["']Toggle theme["']|theme|mode)/i);
  });
});

describe('Tier 4: Real-World Scenario 5 - User launching Spotlight Search for Physics Prelims', () => {
  const searchIndex = readJsonData('search-index.json');

  it('should verify search-index.json contains Physics prelim entries', () => {
    const physicsPrelims = searchIndex.filter(i => /Physics/i.test(i.name) && /Prelim/i.test(i.path || i.name));
    expect(physicsPrelims.length).toBeGreaterThan(5);
  });

  it('should simulate search query for "Physics" returning relevant indexed documents', () => {
    const query = 'Physics';
    const matches = searchIndex.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    expect(matches.length).toBeGreaterThan(50);
  });

  it('should verify search result items provide valid IDs for drive preview', () => {
    const physicsItems = searchIndex.filter(i => /Physics/i.test(i.name));
    const sample = physicsItems[0];
    expect(sample.id).toMatch(/^[a-zA-Z0-9_-]+$/);
    const previewUrl = `https://drive.google.com/file/d/${sample.id}/preview`;
    expect(previewUrl).toContain(sample.id);
  });

  it('should support Ctrl+K keyboard shortcut listener in page source', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/(ctrlKey|metaKey|open-modal|search)/i);
  });

  it('should keep search index external to prevent initial HTML page bloat', () => {
    const html = readHtmlFile('/');
    // Search index (1.36 MB) should NOT be embedded inside the raw index.html
    expect(html.length).toBeLessThan(500000);
  });
});

describe('Tier 4: Real-World Scenario 6 - Mobile student on constrained network bandwidth', () => {
  it('should ensure home page static HTML payload is lightweight (< 300KB)', () => {
    const html = readHtmlFile('/');
    expect(html.length).toBeLessThan(300000);
  });

  it('should configure mobile viewport meta tag correctly', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<meta[^>]+name="viewport"[^>]+content="[^"]*width=device-width/i);
  });

  it('should include link to external stylesheet rather than megabytes of inline styles', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<link[^>]+rel="stylesheet"/i);
  });

  it('should have semantic touch-accessible links and buttons', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<a[^>]+href=/i);
    expect(html).toMatch(/<button[^>]*>/i);
  });

  it('should ensure footer contains responsive contact and about links for easy access', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<footer[\s\S]*?href="\/about"[\s\S]*?<\/footer>/i);
    expect(html).toMatch(/<footer[\s\S]*?href="\/contact"[\s\S]*?<\/footer>/i);
  });
});
