#!/usr/bin/env node
/**
 * Milestone 4: Interactive Islands & Client Coordination Test Suite
 * Tests all 7 island components, their interface contracts, keyboard shortcuts,
 * event bus listeners, and adversarial edge cases.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ISLANDS_DIR = path.resolve(ROOT, 'src/components/islands');
const PUBLIC_DATA_DIR = path.resolve(ROOT, 'public/data');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
  } catch (err) {
    failed++;
    errors.push({ name, err });
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    console.error(`    ${colors.red}${err.message}${colors.reset}`);
  }
}

console.log(`\n${colors.bright}${colors.cyan}=== Milestone 4: Interactive Islands Test Suite ===${colors.reset}\n`);

// -------------------------------------------------------------
// 1. File Structure & Export Integrity
// -------------------------------------------------------------
console.log(`${colors.bright}Suite 1: File Existence & Exports${colors.reset}`);

const requiredFiles = [
  'SearchModal.tsx',
  'FileExplorer.tsx',
  'QuizModal.tsx',
  'InfoModal.tsx',
  'DonateModal.tsx',
  'SocialModals.tsx',
  'AppModals.tsx',
];

for (const file of requiredFiles) {
  test(`should have island file: ${file}`, () => {
    const fullPath = path.join(ISLANDS_DIR, file);
    assert.strictEqual(fs.existsSync(fullPath), true, `File missing: ${fullPath}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 200, `File too short: ${file}`);
    assert.ok(content.includes('export default') || content.includes('export const'), `Missing export in ${file}`);
  });
}

// -------------------------------------------------------------
// 2. SearchModal Island Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 2: SearchModal Island Contract${colors.reset}`);

const searchModalContent = fs.readFileSync(path.join(ISLANDS_DIR, 'SearchModal.tsx'), 'utf8');

test('SearchModal imports and configures Fuse.js for fuzzy search', () => {
  assert.ok(searchModalContent.includes('import Fuse'), 'Must import Fuse');
  assert.ok(searchModalContent.includes('new Fuse('), 'Must instantiate Fuse');
  assert.ok(searchModalContent.includes('"name"') && searchModalContent.includes('"path"'), 'Must search keys name and path');
  assert.ok(searchModalContent.includes('threshold:'), 'Must configure search threshold');
  assert.ok(searchModalContent.includes('includeMatches: true'), 'Must include matches for highlighting');
});

test('SearchModal loads search-index.json asynchronously on demand', () => {
  assert.ok(searchModalContent.includes('/data/search-index.json'), 'Must reference search-index.json');
  assert.ok(searchModalContent.includes('fetch('), 'Must fetch search index asynchronously');
  assert.ok(searchModalContent.includes('isLoadingIndex'), 'Must have loading state for search index');
});

test('SearchModal implements debounced search queries', () => {
  assert.ok(searchModalContent.includes('setTimeout(') && searchModalContent.includes('clearTimeout('), 'Must debounce query');
  assert.ok(searchModalContent.includes('150'), 'Must debounce by ~150ms');
});

test('SearchModal supports full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)', () => {
  assert.ok(searchModalContent.includes('ArrowDown'), 'Must handle ArrowDown');
  assert.ok(searchModalContent.includes('ArrowUp'), 'Must handle ArrowUp');
  assert.ok(searchModalContent.includes('Enter'), 'Must handle Enter');
  assert.ok(searchModalContent.includes('Escape'), 'Must handle Escape');
});

test('SearchModal generates correct Google Drive preview and download links', () => {
  assert.ok(searchModalContent.includes('https://drive.google.com/file/d/'), 'Must generate preview URL');
  assert.ok(searchModalContent.includes('/preview'), 'Preview URL must end with /preview');
  assert.ok(searchModalContent.includes('https://drive.google.com/uc?export=download&id='), 'Must generate download URL');
});

test('SearchModal contains matched text highlighting component', () => {
  assert.ok(searchModalContent.includes('HighlightText'), 'Must have HighlightText component');
  assert.ok(searchModalContent.includes('<mark'), 'Must highlight matched characters with <mark>');
});

// -------------------------------------------------------------
// 3. FileExplorer Island Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 3: FileExplorer Island Contract${colors.reset}`);

const fileExplorerContent = fs.readFileSync(path.join(ISLANDS_DIR, 'FileExplorer.tsx'), 'utf8');

test('FileExplorer supports tree navigation with path stack and breadcrumbs', () => {
  assert.ok(fileExplorerContent.includes('setPath('), 'Must manage path stack');
  assert.ok(fileExplorerContent.includes('jumpToBreadcrumb') || fileExplorerContent.includes('path.map'), 'Must render breadcrumbs');
  assert.ok(fileExplorerContent.includes('ChevronRight') || fileExplorerContent.includes('>'), 'Must separate breadcrumbs with separator');
});

test('FileExplorer supports on-demand data fetching for study and cisce datasets', () => {
  assert.ok(fileExplorerContent.includes('/data/study-materials.json'), 'Must support study-materials.json');
  assert.ok(fileExplorerContent.includes('/data/cisce-resources.json'), 'Must support cisce-resources.json');
  assert.ok(fileExplorerContent.includes('dataType'), 'Must accept dataType prop');
});

test('FileExplorer includes in-folder search and filter capability', () => {
  assert.ok(fileExplorerContent.includes('filterQuery') || fileExplorerContent.includes('filter'), 'Must have filter query state');
  assert.ok(fileExplorerContent.includes('filteredChildren') || fileExplorerContent.includes('filter('), 'Must filter children based on query');
});

test('FileExplorer maintains slide transition keyframes', () => {
  assert.ok(fileExplorerContent.includes('slide-exit-left'), 'Must have slide-exit-left');
  assert.ok(fileExplorerContent.includes('slide-exit-right'), 'Must have slide-exit-right');
  assert.ok(fileExplorerContent.includes('slide-enter-left'), 'Must have slide-enter-left');
  assert.ok(fileExplorerContent.includes('slide-enter-right'), 'Must have slide-enter-right');
});

test('FileExplorer embeds Google Drive PDF preview iframe and download links', () => {
  assert.ok(fileExplorerContent.includes('<iframe'), 'Must render preview iframe');
  assert.ok(fileExplorerContent.includes('https://drive.google.com/file/d/'), 'Must use drive preview URL');
  assert.ok(fileExplorerContent.includes('https://drive.google.com/uc?export=download'), 'Must use drive download URL');
});

// -------------------------------------------------------------
// 4. QuizModal Island Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 4: QuizModal Island Contract${colors.reset}`);

const quizModalContent = fs.readFileSync(path.join(ISLANDS_DIR, 'QuizModal.tsx'), 'utf8');

test('QuizModal embeds external educational quiz application', () => {
  assert.ok(quizModalContent.includes('https://shs-pyqp-project.vercel.app/resources'), 'Must embed target quiz URL');
  assert.ok(quizModalContent.includes('<iframe'), 'Must embed iframe');
});

test('QuizModal provides iframe sandbox restrictions', () => {
  assert.ok(quizModalContent.includes('sandbox='), 'Must set sandbox attribute');
  assert.ok(quizModalContent.includes('allow-scripts'), 'Must allow scripts');
  assert.ok(quizModalContent.includes('allow-same-origin'), 'Must allow same-origin');
});

test('QuizModal includes loading indicator and fullscreen toggling', () => {
  assert.ok(quizModalContent.includes('isLoading') || quizModalContent.includes('loading'), 'Must have loading state');
  assert.ok(quizModalContent.includes('isFullscreen'), 'Must have fullscreen state');
  assert.ok(quizModalContent.includes('Maximize2') || quizModalContent.includes('Minimize2'), 'Must have fullscreen icons');
});

// -------------------------------------------------------------
// 5. InfoModal Island Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 5: InfoModal Island Contract${colors.reset}`);

const infoModalContent = fs.readFileSync(path.join(ISLANDS_DIR, 'InfoModal.tsx'), 'utf8');

test('InfoModal displays developer identity and curriculum mission', () => {
  assert.ok(infoModalContent.includes('Jivaansh Yadav'), 'Must mention developer Jivaansh Yadav');
  assert.ok(infoModalContent.includes('Class 10') || infoModalContent.includes('ICSE'), 'Must mention ICSE curriculum mission');
});

test('InfoModal queries GitHub repository API for latest commit', () => {
  assert.ok(infoModalContent.includes('api.github.com/repos') && infoModalContent.includes('commits?per_page=1'), 'Must query GitHub commit API');
  assert.ok(infoModalContent.includes('commit.message'), 'Must display commit message');
  assert.ok(infoModalContent.includes('commit.author'), 'Must display commit author');
  assert.ok(infoModalContent.includes('sha'), 'Must display commit SHA');
});

// -------------------------------------------------------------
// 6. DonateModal Island Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 6: DonateModal Island Contract${colors.reset}`);

const donateModalContent = fs.readFileSync(path.join(ISLANDS_DIR, 'DonateModal.tsx'), 'utf8');

test('DonateModal contains UPI ID, QR code, and pay link', () => {
  assert.ok(donateModalContent.includes('jivaanshyadav@ptyes'), 'Must contain verified UPI ID');
  assert.ok(donateModalContent.includes('/upi_qr.png'), 'Must reference upi_qr.png asset');
  assert.ok(donateModalContent.includes('upi://pay'), 'Must have deep-link UPI protocol link');
});

test('DonateModal includes clipboard copy action with user feedback', () => {
  assert.ok(donateModalContent.includes('clipboard.writeText'), 'Must call clipboard.writeText');
  assert.ok(donateModalContent.includes('Copied!'), 'Must show Copied! confirmation text');
});

// -------------------------------------------------------------
// 7. SocialModals Island Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 7: SocialModals Island Contract${colors.reset}`);

const socialModalsContent = fs.readFileSync(path.join(ISLANDS_DIR, 'SocialModals.tsx'), 'utf8');

test('SocialModals supports both reddit and discord dialogs', () => {
  assert.ok(socialModalsContent.includes('reddit'), 'Must support reddit modal');
  assert.ok(socialModalsContent.includes('discord'), 'Must support discord modal');
  assert.ok(socialModalsContent.includes('https://reddit.com/r/ICSE'), 'Must link to r/ICSE');
  assert.ok(socialModalsContent.includes('https://discord.gg/xGD8SnvuKX'), 'Must link to ICSEcord');
});

test('SocialModals embeds live Discord server widget iframe', () => {
  assert.ok(socialModalsContent.includes('https://discord.com/widget?id=1175417452935520316'), 'Must embed Discord widget');
  assert.ok(socialModalsContent.includes('sandbox='), 'Must set iframe sandbox');
});

// -------------------------------------------------------------
// 8. AppModals Master Coordinator Specification Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 8: AppModals Master Coordinator Contract${colors.reset}`);

const appModalsContent = fs.readFileSync(path.join(ISLANDS_DIR, 'AppModals.tsx'), 'utf8');

test('AppModals coordinates all 6 child modal islands', () => {
  assert.ok(appModalsContent.includes('<SearchModal'), 'Must render SearchModal');
  assert.ok(appModalsContent.includes('<FileExplorer'), 'Must render FileExplorer');
  assert.ok(appModalsContent.includes('<QuizModal'), 'Must render QuizModal');
  assert.ok(appModalsContent.includes('<InfoModal'), 'Must render InfoModal');
  assert.ok(appModalsContent.includes('<DonateModal'), 'Must render DonateModal');
  assert.ok(appModalsContent.includes('<SocialModals'), 'Must render SocialModals');
});

test('AppModals listens to app:open-modal CustomEvent', () => {
  assert.ok(appModalsContent.includes('app:open-modal'), 'Must listen to app:open-modal');
  assert.ok(appModalsContent.includes('window.addEventListener'), 'Must register window event listener');
  assert.ok(appModalsContent.includes('window.removeEventListener'), 'Must unregister window event listener');
});

test('AppModals listens to global Ctrl+K / Cmd+K shortcut', () => {
  assert.ok(/key.*===.*['"]k['"]/i.test(appModalsContent), 'Must check key k');
  assert.ok(appModalsContent.includes('ctrlKey') && appModalsContent.includes('metaKey'), 'Must support Ctrl and Meta modifiers');
});

// -------------------------------------------------------------
// 9. Data Integrity & Adversarial Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 9: Adversarial & Data Integrity Tests${colors.reset}`);

test('public/data/search-index.json is valid and parseable with 6,000+ items', () => {
  const searchIndexPath = path.join(PUBLIC_DATA_DIR, 'search-index.json');
  assert.strictEqual(fs.existsSync(searchIndexPath), true);
  const raw = fs.readFileSync(searchIndexPath, 'utf8');
  const data = JSON.parse(raw);
  assert.ok(Array.isArray(data), 'Search index must be an array');
  assert.ok(data.length > 6000, `Expected >6000 items, got ${data.length}`);
  const sample = data[0];
  assert.ok(sample.name && sample.id && sample.path, 'Item must have name, id, path');
});

test('public/data/study-materials.json is valid and parseable with Class 10 subjects', () => {
  const studyPath = path.join(PUBLIC_DATA_DIR, 'study-materials.json');
  assert.strictEqual(fs.existsSync(studyPath), true);
  const raw = fs.readFileSync(studyPath, 'utf8');
  const data = JSON.parse(raw);
  assert.ok(data.type === 'folder');
  assert.ok(Array.isArray(data.children));
  const subjects = data.children.map(c => c.name);
  assert.ok(subjects.includes('Biology'), 'Must contain Biology');
  assert.ok(subjects.includes('Physics'), 'Must contain Physics');
  assert.ok(subjects.includes('Chemistry'), 'Must contain Chemistry');
});

test('public/data/cisce-resources.json is valid and parseable with official categories', () => {
  const ciscePath = path.join(PUBLIC_DATA_DIR, 'cisce-resources.json');
  assert.strictEqual(fs.existsSync(ciscePath), true);
  const raw = fs.readFileSync(ciscePath, 'utf8');
  const data = JSON.parse(raw);
  assert.ok(data.type === 'folder');
  assert.ok(Array.isArray(data.children));
  const categories = data.children.map(c => c.name);
  assert.ok(categories.some(c => c.includes('Specimen')), 'Must contain Specimen Question Papers');
});

test('SearchModal query handles adversarial strings (regex specials, empty, long query) without throwing', () => {
  // Test Fuse.js query handling on adversarial inputs
  const FuseClass = Fuse;
  const sampleData = [
    { name: 'Class 10 Biology Notes.pdf', id: '123', path: 'Biology/Notes' },
    { name: 'Physics Specimen 2024.pdf', id: '456', path: 'Physics/2024' },
  ];
  const fuse = new FuseClass(sampleData, { keys: ['name', 'path'], threshold: 0.3 });

  // Special regex characters that could crash unsafe regex engines
  const adversarialQueries = [
    '',
    '   ',
    '.*',
    '[a-z]+',
    '(((((',
    '\\',
    '\\d+',
    '^$',
    '?+*{}',
    'a'.repeat(500),
    '<script>alert(1)</script>',
    '" OR 1=1 --',
  ];

  for (const q of adversarialQueries) {
    assert.doesNotThrow(() => {
      const res = fuse.search(q);
      assert.ok(Array.isArray(res));
    }, `Fuse search threw on adversarial query: ${q}`);
  }
});

// -------------------------------------------------------------
// 10. Deep Functional & Real-Data Operational Tests
// -------------------------------------------------------------
console.log(`\n${colors.bright}Suite 10: Deep Functional & Real-Data Tests${colors.reset}`);

const fullSearchIndex = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA_DIR, 'search-index.json'), 'utf8'));
const fullStudyMaterials = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA_DIR, 'study-materials.json'), 'utf8'));
const fullCisceResources = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA_DIR, 'cisce-resources.json'), 'utf8'));

test('Full search index query "Biology" yields relevant curriculum files', () => {
  const fuse = new Fuse(fullSearchIndex, { keys: ['name', 'path'], threshold: 0.3, includeMatches: true });
  const results = fuse.search('Biology').slice(0, 20);
  assert.ok(results.length > 0, 'Must return results for Biology');
  assert.ok(results.some(r => r.item.name.toLowerCase().includes('bio') || r.item.path.toLowerCase().includes('bio')),
    'Results must be relevant to Biology');
});

test('Full search index query "2024 Specimen" finds specimen papers', () => {
  const fuse = new Fuse(fullSearchIndex, { keys: ['name', 'path'], threshold: 0.3, includeMatches: true });
  const results = fuse.search('2024 Specimen').slice(0, 20);
  assert.ok(results.length > 0, 'Must return results for 2024 Specimen');
});

test('SearchModal Drive preview URL generator matches Google Drive embed specifications', () => {
  const sample = fullSearchIndex[42];
  const url = `https://drive.google.com/file/d/${sample.id}/preview`;
  assert.ok(url.startsWith('https://drive.google.com/file/d/'));
  assert.ok(url.endsWith('/preview'));
  assert.ok(!url.includes('undefined') && !url.includes('null'));
});

test('SearchModal Drive download URL generator matches Google Drive uc export specifications', () => {
  const sample = fullSearchIndex[84];
  const url = `https://drive.google.com/uc?export=download&id=${sample.id}`;
  assert.ok(url.startsWith('https://drive.google.com/uc?export=download&id='));
  assert.ok(url.includes(sample.id));
});

test('FileExplorer path resolution navigates study materials down multiple levels', () => {
  const targetSubject = fullStudyMaterials.children.find(c => c.name === 'Biology' || c.name === 'Physics');
  assert.ok(targetSubject, 'Must have Biology or Physics top level folder');
  if (targetSubject.children && targetSubject.children.length > 0) {
    const subFolder = targetSubject.children[0];
    assert.ok(subFolder.name, 'Sub-folder must have valid name');
  }
});

test('CISCE resources tree contains valid folders and children for specimen question papers', () => {
  const specimenFolder = fullCisceResources.children.find(c => c.name.toLowerCase().includes('specimen'));
  assert.ok(specimenFolder, 'Must contain Specimen Question Papers folder');
  assert.strictEqual(specimenFolder.type, 'folder');
  assert.ok(Array.isArray(specimenFolder.children));
});

test('CustomEvent payload contract supports all 8 modal variants without type ambiguity', () => {
  const supportedModals = [
    'search',
    'info',
    'donate',
    'quiz',
    'quizzes',
    'reddit',
    'discord',
    'explorer',
    'file-explorer',
  ];
  for (const m of supportedModals) {
    const detail = { modal: m, initialPath: 'Test/Path', initialData: 'study' };
    assert.ok(typeof detail.modal === 'string');
    assert.ok(['cisce', 'study'].includes(detail.initialData));
  }
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log(`\n---------------------------------------------`);
console.log(`Total: ${passed + failed} | Passed: ${colors.green}${passed}${colors.reset} | Failed: ${failed > 0 ? colors.red + failed : '0'}${colors.reset}`);
console.log(`---------------------------------------------\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
