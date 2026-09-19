import { describe, it, expect, readHtmlFile } from './runner.mjs';

describe('Tier 1: Feature Coverage - Route 1: Home Page (/)', () => {
  it('should render home page with real static HTML text and no empty root container', () => {
    const html = readHtmlFile('/');
    expect(html).toContain('ICSE');
    expect(html).toContain('Resources');
    // Verify it is not an empty client-side SPA shell
    expect(html).not.toBe('<!doctype html><html><head></head><body><div id="root"></div></body></html>');
    expect(html.length).toBeGreaterThan(1500);
  });

  it('should contain semantic h1 heading for the application title', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?ICSE[\s\S]*?<\/h1>/i);
  });

  it('should contain static navigation links to core sections', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/href="\/study-materials"/);
    expect(html).toMatch(/href="\/cisce"/);
    expect(html).toMatch(/href="\/quizzes"/);
  });

  it('should display subject preview cards with readable text in raw source', () => {
    const html = readHtmlFile('/');
    expect(html).toContain('Biology');
    expect(html).toContain('Chemistry');
    expect(html).toContain('Physics');
    expect(html).toContain('Maths');
  });

  it('should contain essential SEO meta tags in head', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<title>[\s\S]*?ICSE[\s\S]*?<\/title>/i);
    expect(html).toMatch(/<meta[^>]+name="description"[^>]+content=/i);
    expect(html).toMatch(/<meta[^>]+name="viewport"[^>]+content=/i);
  });

  it('should include zero-FOUC anti-flash theme script in head', () => {
    const html = readHtmlFile('/');
    expect(html).toMatch(/<script[\s\S]*?localStorage\.getItem\(['"]theme['"]\)[\s\S]*?<\/script>/i);
  });
});

describe('Tier 1: Feature Coverage - Route 2: Study Materials Catalog (/study-materials)', () => {
  it('should bake Science subjects (Biology, Chemistry, Physics) directly into static HTML', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toContain('Biology');
    expect(html).toContain('Chemistry');
    expect(html).toContain('Physics');
  });

  it('should bake Mathematics and English subjects directly into static HTML', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toContain('Maths');
    expect(html).toContain('English');
  });

  it('should bake Social Studies & Languages (Geography, History & Civics, Hindi) into static HTML', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toContain('Geography');
    expect(html).toContain('Hindi');
    expect(html).toMatch(/History\s*(&amp;|&)\s*Civics/i);
  });

  it('should render semantic subject structure with headings and structured lists', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toMatch(/<h[12][^>]*>[\s\S]*?Study Materials[\s\S]*?<\/h[12]>/i);
    expect(html).toMatch(/<(ul|div)[^>]*class=[\s\S]*?<\/ul>|<\/div>/i);
  });

  it('should contain Google Drive preview or download resource links in raw markup', () => {
    const html = readHtmlFile('/study-materials');
    // Verify educational resource links or anchor tags exist
    expect(html).toMatch(/<a[^>]+href=/i);
    expect(html.length).toBeGreaterThan(3000);
  });

  it('should have descriptive title and meta description for study materials', () => {
    const html = readHtmlFile('/study-materials');
    expect(html).toMatch(/<title>[\s\S]*?Study Materials[\s\S]*?<\/title>/i);
    expect(html).toMatch(/<meta[^>]+name="description"[^>]+content=/i);
  });
});

describe('Tier 1: Feature Coverage - Route 3: CISCE Resources Directory (/cisce)', () => {
  it('should contain Analysis of Pupil Performance category in static HTML', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/Analysis of Pupil Performance/i);
  });

  it('should contain Specimen Question Papers (Specimen QPs) category in static HTML', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/Specimen (Question Papers|QPs)/i);
  });

  it('should contain Previous Year Questions (PYQs) category in static HTML', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/(Previous Year Questions|PYQs)/i);
  });

  it('should contain Syllabus category in static HTML', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/Syllabus/i);
  });

  it('should contain back navigation link to home page', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/href="\/"/);
  });

  it('should contain Competency Focused Questions (CFQs) and laboratory content', () => {
    const html = readHtmlFile('/cisce');
    expect(html).toMatch(/(CFQs|Competency)/i);
    expect(html.length).toBeGreaterThan(2000);
  });
});

describe('Tier 1: Feature Coverage - Route 4: About Page (/about)', () => {
  it('should contain an h1 heading for About Us or About Project', () => {
    const html = readHtmlFile('/about');
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?About[\s\S]*?<\/h1>/i);
  });

  it('should describe the educational mission and purpose of ICSE Resources', () => {
    const html = readHtmlFile('/about');
    expect(html).toMatch(/(educational|students|resources|ICSE|Class 10)/i);
  });

  it('should contain non-commercial educational disclaimer in static text', () => {
    const html = readHtmlFile('/about');
    expect(html).toMatch(/(disclaimer|educational|free|non-profit|open)/i);
  });

  it('should contain developer authorship and project credits', () => {
    const html = readHtmlFile('/about');
    expect(html).toMatch(/(Jivaansh|Yadav|developer|GitHub|curated)/i);
  });

  it('should contain global header and footer navigation elements', () => {
    const html = readHtmlFile('/about');
    expect(html).toMatch(/<header[^>]*>/i);
    expect(html).toMatch(/<footer[^>]*>/i);
  });
});

describe('Tier 1: Feature Coverage - Route 5: Contact Page (/contact)', () => {
  it('should contain an h1 heading for Contact', () => {
    const html = readHtmlFile('/contact');
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?Contact[\s\S]*?<\/h1>/i);
  });

  it('should list official contact channels (Email, GitHub, or Community)', () => {
    const html = readHtmlFile('/contact');
    expect(html).toMatch(/(email|github|discord|reddit|reach out)/i);
  });

  it('should contain guidelines for feedback, corrections, and resource contributions', () => {
    const html = readHtmlFile('/contact');
    expect(html).toMatch(/(feedback|contribut|suggest|resource)/i);
  });

  it('should have working links back to home and study materials', () => {
    const html = readHtmlFile('/contact');
    expect(html).toMatch(/href="\/"/);
    expect(html).toMatch(/href="\/study-materials"/);
  });

  it('should have valid title and viewport metadata', () => {
    const html = readHtmlFile('/contact');
    expect(html).toMatch(/<title>[\s\S]*?Contact[\s\S]*?<\/title>/i);
    expect(html).toMatch(/<meta[^>]+name="viewport"/i);
  });
});

describe('Tier 1: Feature Coverage - Route 6: Privacy Policy (/privacy)', () => {
  it('should contain an h1 heading for Privacy Policy', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?Privacy Policy[\s\S]*?<\/h1>/i);
  });

  it('should include mandatory Google third-party cookie disclosure for AdSense', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/Google/i);
    expect(html).toMatch(/cookie/i);
  });

  it('should explicitly disclose advertising and partner networks', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/(AdSense|advertising|third-party vendor|ads)/i);
  });

  it('should detail log files and non-personal analytical data collection', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/(log files|analytics|browser|IP address)/i);
  });

  it('should provide instructions on cookie control and opt-out options', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/(opt-out|cookie settings|browser settings|preferences)/i);
  });

  it('should contain header and footer navigation links', () => {
    const html = readHtmlFile('/privacy');
    expect(html).toMatch(/href="\/"/);
    expect(html).toMatch(/<footer[^>]*>/i);
  });
});

describe('Tier 1: Feature Coverage - Route 7: Quizzes Page (/quizzes)', () => {
  it('should contain an h1 heading for Quizzes or Interactive Quizzes', () => {
    const html = readHtmlFile('/quizzes');
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?Quiz[\s\S]*?<\/h1>/i);
  });

  it('should contain educational description of quiz features and subjects', () => {
    const html = readHtmlFile('/quizzes');
    expect(html).toMatch(/(practice|questions|test|revision|interactive|subjects)/i);
  });

  it('should render quiz container or interactive island placeholder', () => {
    const html = readHtmlFile('/quizzes');
    expect(html).toMatch(/(iframe|quiz-container|quiz|shs-pyqp)/i);
  });

  it('should have navigation links back to home and study materials', () => {
    const html = readHtmlFile('/quizzes');
    expect(html).toMatch(/href="\/"/);
    expect(html).toMatch(/href="\/study-materials"/);
  });

  it('should have valid page title and meta description', () => {
    const html = readHtmlFile('/quizzes');
    expect(html).toMatch(/<title>[\s\S]*?Quiz[\s\S]*?<\/title>/i);
    expect(html).toMatch(/<meta[^>]+name="description"/i);
  });
});

describe('Tier 1: Feature Coverage - Route 8: 404 Page (/404)', () => {
  it('should contain 404 or Page Not Found text in static HTML', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/(404|Page Not Found)/i);
  });

  it('should contain a clear navigation link to return to the home page', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/href="\/"/);
  });

  it('should render semantic main or content container', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/<(main|div)[^>]*>/i);
    expect(html.length).toBeGreaterThan(500);
  });

  it('should include stylesheet link in head for styled error presentation', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/<link[^>]+rel="stylesheet"/i);
  });

  it('should have appropriate title indicating not found or 404', () => {
    const html = readHtmlFile('/404');
    expect(html).toMatch(/<title>[\s\S]*?(404|Not Found)[\s\S]*?<\/title>/i);
  });
});
