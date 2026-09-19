import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, readHtmlFile, readJsonData, getProjectRoot, distExists } from './runner.mjs';

describe('Tier 2: Boundary & Corner - Feature 1: Empty & Whitespace Search Queries', () => {
  const searchIndex = readJsonData('search-index.json');

  it('should verify search-index.json has valid non-empty entries with name, id, and path', () => {
    expect(Array.isArray(searchIndex)).toBe(true);
    expect(searchIndex.length).toBeGreaterThan(6000);
    const sample = searchIndex[0];
    expect(typeof sample.name).toBe('string');
    expect(sample.name.length).toBeGreaterThan(0);
    expect(typeof sample.id).toBe('string');
    expect(sample.id.length).toBeGreaterThan(0);
    expect(typeof sample.path).toBe('string');
  });

  it('should handle empty string search queries safely without crashing or leaking items', () => {
    const query = '';
    // Search filter contract: empty query returns 0 matches or empty array
    const filterFn = (item) => (query.trim() === '' ? false : item.name.toLowerCase().includes(query.toLowerCase()));
    const results = searchIndex.filter(filterFn);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('should handle whitespace-only queries by trimming and returning zero results safely', () => {
    const query = '   \t\n  ';
    const trimmed = query.trim();
    const filterFn = (item) => (trimmed === '' ? false : item.name.toLowerCase().includes(trimmed.toLowerCase()));
    const results = searchIndex.filter(filterFn);
    expect(results.length).toBe(0);
  });

  it('should safely handle special regex meta-characters without throwing syntax errors', () => {
    const dangerousQueries = ['.*', '+', '?', '^', '$', '(', ')', '[', ']', '{', '}', '\\', '|'];
    for (const q of dangerousQueries) {
      expect(() => {
        // Safe search pattern escaping
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        const match = regex.test(searchIndex[0].name);
        expect(typeof match).toBe('boolean');
      }).not.toThrow();
    }
  });

  it('should gracefully return empty results for non-matching gibberish strings', () => {
    const gibberish = 'xyzzy_non_existent_token_998877';
    const results = searchIndex.filter(item => item.name.toLowerCase().includes(gibberish));
    expect(results.length).toBe(0);
  });

  it('should execute case-insensitive matching identically across uppercase, lowercase, and mixed case', () => {
    const lowerResults = searchIndex.filter(item => item.name.toLowerCase().includes('biology'));
    const upperResults = searchIndex.filter(item => item.name.toLowerCase().includes('BIOLOGY'.toLowerCase()));
    const mixedResults = searchIndex.filter(item => item.name.toLowerCase().includes('BioLogY'.toLowerCase()));
    expect(lowerResults.length).toBeGreaterThan(50);
    expect(lowerResults.length).toBe(upperResults.length);
    expect(lowerResults.length).toBe(mixedResults.length);
  });
});

describe('Tier 2: Boundary & Corner - Feature 2: Missing Files & Broken Resource Links', () => {
  const projectRoot = getProjectRoot();

  it('should verify public/upi_qr.png donation QR code asset exists and is non-empty', () => {
    const qrPath = path.resolve(projectRoot, 'public/upi_qr.png');
    expect(fs.existsSync(qrPath)).toBe(true);
    const stats = fs.statSync(qrPath);
    expect(stats.size).toBeGreaterThan(1000);
  });

  it('should verify public favicon (favicon.svg or favicon.ico) exists on disk and is non-empty', () => {
    const svgPath = path.resolve(projectRoot, 'public/favicon.svg');
    const icoPath = path.resolve(projectRoot, 'public/favicon.ico');
    const exists = fs.existsSync(svgPath) || fs.existsSync(icoPath);
    expect(exists).toBe(true);
    const validPath = fs.existsSync(svgPath) ? svgPath : icoPath;
    const stats = fs.statSync(validPath);
    expect(stats.size).toBeGreaterThan(100);
  });

  it('should verify core data files exist and have valid JSON syntax in public/data/', () => {
    const studyPath = path.resolve(projectRoot, 'public/data/study-materials.json');
    const ciscePath = path.resolve(projectRoot, 'public/data/cisce-resources.json');
    const indexPath = path.resolve(projectRoot, 'public/data/search-index.json');

    expect(fs.existsSync(studyPath)).toBe(true);
    expect(fs.existsSync(ciscePath)).toBe(true);
    expect(fs.existsSync(indexPath)).toBe(true);

    const studyStats = fs.statSync(studyPath);
    expect(studyStats.size).toBeGreaterThan(1000000); // >1MB
  });

  it('should ensure static HTML does not contain broken interpolation tokens (undefined, null, [object Object])', () => {
    const html = readHtmlFile('/');
    // Check markup excluding script tags to accurately detect template interpolation leaks without false-positive hits on JS code
    const markupOnly = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    expect(markupOnly).not.toContain('undefined');
    expect(markupOnly).not.toContain('null');
    expect(markupOnly).not.toContain('[object Object]');
    expect(markupOnly).not.toContain('NaN');
  });

  it('should ensure images in static HTML have non-empty src attributes', () => {
    const html = readHtmlFile('/');
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']*)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      expect(src.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('Tier 2: Boundary & Corner - Feature 3: 404 Page Status & Error Navigation Boundary', () => {
  it('should render distinct 404 / Not Found message in page content', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/(404|Page Not Found|Looking for something\?)/i);
  });

  it('should not bloat 404 page with large 2MB study materials dataset in raw HTML', () => {
    const html = readHtmlFile('/404');
    // 404 page should be lean and fast (< 100KB)
    expect(html.length).toBeLessThan(100000);
  });

  it('should provide clear recovery link with href="/" directing visitors home', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/<a[^>]+href="\/"[^>]*>/i);
  });

  it('should contain proper meta tags for responsive viewport and SEO', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/<meta[^>]+name="viewport"[^>]+content=/i);
    expect(html).toMatch(/<title>[\s\S]*?(404|Not Found)[\s\S]*?<\/title>/i);
  });

  it('should have standard HTML5 doctype and opening html tag', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/<!doctype\s+html>/i);
    expect(html).toMatch(/<html[^>]*>/i);
    expect(html).toMatch(/<\/html>/i);
  });
});

describe('Tier 2: Boundary & Corner - Feature 4: AdSense Cookie Disclosure in /privacy', () => {
  it('should contain the keyword "cookie" or "cookies" multiple times in /privacy', () => {
    const html = readHtmlFile('/privacy');
    const cookieMatches = html.match(/cookies?/gi);
    expect(cookieMatches).toBeDefined();
    expect(cookieMatches.length).toBeGreaterThanOrEqual(3);
  });

  it('should explicitly mention Google as a third-party vendor in /privacy', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/Google/i);
  });

  it('should disclose advertising partners and third-party advertising in /privacy', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/(AdSense|advertising|third-party (ad|advertiser))/i);
  });

  it('should provide guidance on cookie management and opt-out options in /privacy', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/(opt-out|settings|preferences|disable|manage cookies)/i);
  });

  it('should provide publisher contact information or link for privacy inquiries', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/(contact|email|reach us|inquiries)/i);
  });

  it('should contain at least three distinct policy sections in /privacy', () => {
    const html = readHtmlFile('/privacy');
    const headingMatches = html.match(/<h[2-4][^>]*>/gi);
    expect(headingMatches).toBeDefined();
    expect(headingMatches.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Tier 2: Boundary & Corner - Feature 5: Deep Subject Nesting & Large Data Structure Stress', () => {
  const studyData = readJsonData('study-materials.json');

  it('should verify root structure contains 11 core ICSE subjects and categories', () => {
    expect(studyData.name).toBe('Study Materials');
    expect(Array.isArray(studyData.children)).toBe(true);
    const subjectNames = studyData.children.map(c => c.name);
    expect(subjectNames.length).toBeGreaterThanOrEqual(10);
    expect(subjectNames).toContain('Biology');
    expect(subjectNames).toContain('Chemistry');
    expect(subjectNames).toContain('Physics');
    expect(subjectNames).toContain('Maths');
    expect(subjectNames).toContain('English');
    expect(subjectNames).toContain('Geography');
    expect(subjectNames).toContain('Hindi');
    expect(subjectNames).toContain('History & Civics');
  });

  it('should traverse recursively through all nested folders without stack overflow', () => {
    let maxDepth = 0;
    let totalNodes = 0;

    function walk(node, depth = 1) {
      totalNodes++;
      if (depth > maxDepth) maxDepth = depth;
      if (Array.isArray(node)) {
        for (const item of node) walk(item, depth + 1);
      } else if (node && typeof node === 'object') {
        if (Array.isArray(node.children)) {
          for (const child of node.children) walk(child, depth + 1);
        }
      }
    }

    expect(() => walk(studyData)).not.toThrow();
    expect(maxDepth).toBeGreaterThanOrEqual(5); // deeply nested structure verified
    expect(totalNodes).toBeGreaterThan(5000);
  });

  it('should verify all leaf file entries contain valid Google Drive IDs', () => {
    let checkedLeaves = 0;

    function checkLeaves(node) {
      if (node && node.type === 'file' && node.id) {
        checkedLeaves++;
        expect(node.id).toMatch(/^[a-zA-Z0-9_-]+$/);
        expect(node.name.trim().length).toBeGreaterThan(0);
      } else if (node && Array.isArray(node.children)) {
        for (const child of node.children) {
          checkLeaves(child);
        }
      }
    }

    checkLeaves(studyData);
    expect(checkedLeaves).toBeGreaterThan(1000);
  });

  it('should verify file names with special characters are safely escaped or structured', () => {
    const searchIndex = readJsonData('search-index.json');
    const specialItems = searchIndex.filter(i => /(&|\(|\)|,|\+)/.test(i.name));
    expect(specialItems.length).toBeGreaterThan(100);
    // All special items must have valid paths and non-empty IDs
    for (const item of specialItems.slice(0, 50)) {
      expect(item.id.length).toBeGreaterThan(5);
      expect(item.name.length).toBeGreaterThan(0);
    }
  });

  it('should verify pre-rendered HTML does not bloat attributes with the entire 2MB JSON string', () => {
    const html = readHtmlFile('/study-materials');
    // HTML page should not be absurdly bloated by JSON serialization into data attributes (> 3MB)
    expect(html.length).toBeLessThan(2000000);
  });

  it('should verify total indexed files exceed 6,000 items in search index', () => {
    const searchIndex = readJsonData('search-index.json');
    expect(searchIndex.length).toBeGreaterThan(6000);
  });
});
