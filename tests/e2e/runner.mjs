#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist');
const PUBLIC_DATA_DIR = path.resolve(PROJECT_ROOT, 'public/data');

// CLI options
const args = process.argv.slice(2);
const options = {
  tier: null,
  filter: null,
  grep: null,
  json: false,
  verbose: false,
  help: false
};

for (const arg of args) {
  if (arg === '--help' || arg === '-h') options.help = true;
  else if (arg === '--json') options.json = true;
  else if (arg === '--verbose' || arg === '-v') options.verbose = true;
  else if (arg.startsWith('--tier=')) options.tier = arg.split('=')[1];
  else if (arg.startsWith('--filter=')) options.filter = arg.split('=')[1];
  else if (arg.startsWith('--grep=')) options.grep = arg.split('=')[1];
}

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Global test registry
const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeAllHooks: [],
    afterAllHooks: [],
    beforeEachHooks: [],
    afterEachHooks: []
  };
  suites.push(suite);
  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

export function it(name, fn) {
  if (!currentSuite) {
    describe('Default Suite', () => {
      it(name, fn);
    });
    return;
  }
  currentSuite.tests.push({ name, fn });
}

export const test = it;

export function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAllHooks.push(fn);
}

export function afterAll(fn) {
  if (currentSuite) currentSuite.afterAllHooks.push(fn);
}

export function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

export function afterEach(fn) {
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

// Expect assertion library
class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

export function expect(actual) {
  const matchers = {
    toBe(expected) {
      if (actual !== expected) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`, expected, actual);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a !== e) {
        throw new AssertionError(`Expected ${a} to equal ${e}`, expected, actual);
      }
    },
    toContain(expected) {
      if (typeof actual === 'string' || Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          const preview = typeof actual === 'string' && actual.length > 200 ? actual.slice(0, 200) + '...' : actual;
          throw new AssertionError(`Expected content to contain ${JSON.stringify(expected)}, but was not found in: ${JSON.stringify(preview)}`, expected, actual);
        }
      } else {
        throw new AssertionError(`Expected string or array for toContain, got ${typeof actual}`, expected, actual);
      }
    },
    toMatch(regex) {
      const r = typeof regex === 'string' ? new RegExp(regex) : regex;
      if (!r.test(String(actual))) {
        const preview = typeof actual === 'string' && actual.length > 200 ? actual.slice(0, 200) + '...' : actual;
        throw new AssertionError(`Expected content to match pattern ${r}, but failed in: ${JSON.stringify(preview)}`, regex, actual);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new AssertionError(`Expected ${actual} to be greater than ${expected}`, expected, actual);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new AssertionError(`Expected ${actual} to be greater than or equal to ${expected}`, expected, actual);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new AssertionError(`Expected ${actual} to be less than ${expected}`, expected, actual);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new AssertionError('Expected value to be defined, got undefined', 'defined', actual);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(`Expected truthy value, got ${JSON.stringify(actual)}`, true, actual);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new AssertionError(`Expected falsy value, got ${JSON.stringify(actual)}`, false, actual);
      }
    },
    toThrow(expectedMessage) {
      if (typeof actual !== 'function') {
        throw new AssertionError('Expected function for toThrow matcher', 'function', typeof actual);
      }
      let threw = false;
      let caughtError = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        caughtError = err;
      }
      if (!threw) {
        throw new AssertionError('Expected function to throw an error, but it did not', 'Error', 'No throw');
      }
      if (expectedMessage && !caughtError.message.includes(expectedMessage)) {
        throw new AssertionError(`Expected error message to include ${JSON.stringify(expectedMessage)}, got ${JSON.stringify(caughtError.message)}`, expectedMessage, caughtError.message);
      }
    },
    not: {}
  };

  // Negated matchers
  matchers.not.toBe = (expected) => {
    if (actual === expected) {
      throw new AssertionError(`Expected ${JSON.stringify(actual)} not to be ${JSON.stringify(expected)}`, `not ${expected}`, actual);
    }
  };
  matchers.not.toContain = (expected) => {
    if (actual.includes(expected)) {
      throw new AssertionError(`Expected content not to contain ${JSON.stringify(expected)}`, `not contain ${expected}`, actual);
    }
  };
  matchers.not.toMatch = (regex) => {
    const r = typeof regex === 'string' ? new RegExp(regex) : regex;
    if (r.test(String(actual))) {
      throw new AssertionError(`Expected content not to match pattern ${r}`, `not match ${r}`, actual);
    }
  };
  matchers.not.toThrow = () => {
    if (typeof actual !== 'function') {
      throw new AssertionError('Expected function for toThrow matcher', 'function', typeof actual);
    }
    try {
      actual();
    } catch (err) {
      throw new AssertionError(`Expected function not to throw, but it threw: ${err.message}`, 'no throw', err.message);
    }
  };

  return matchers;
}

export function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message || 'Assertion failed', true, condition);
  }
}

// Helpers for test suites
export function getProjectRoot() {
  return PROJECT_ROOT;
}

export function getDistDir() {
  return DIST_DIR;
}

export function distExists() {
  return fs.existsSync(DIST_DIR);
}

export function getDistPath(routePath) {
  // Normalize route path
  let cleanRoute = routePath.replace(/^\/+|\/+$/g, '');
  if (!cleanRoute) {
    return path.resolve(DIST_DIR, 'index.html');
  }

  // Try dist/route/index.html first
  const indexPath = path.resolve(DIST_DIR, cleanRoute, 'index.html');
  if (fs.existsSync(indexPath)) return indexPath;

  // Try dist/route.html
  const htmlPath = path.resolve(DIST_DIR, `${cleanRoute}.html`);
  if (fs.existsSync(htmlPath)) return htmlPath;

  // Fallback default expected path
  return indexPath;
}

export function readHtmlFile(routePath) {
  if (!distExists()) {
    throw new AssertionError(
      `dist/ directory does not exist at ${DIST_DIR}. Build the project with 'npm run build' before running E2E HTML tests.`,
      'dist/ exists',
      'dist/ missing'
    );
  }

  const targetPath = getDistPath(routePath);
  if (!fs.existsSync(targetPath)) {
    // Check if 404 has alternative naming (e.g. dist/404.html vs dist/404/index.html)
    if (routePath.includes('404')) {
      const alt404 = path.resolve(DIST_DIR, '404.html');
      if (fs.existsSync(alt404)) return fs.readFileSync(alt404, 'utf-8');
    }
    throw new AssertionError(
      `Static HTML file not found for route "${routePath}". Looked at: ${targetPath}`,
      'File exists',
      'File not found'
    );
  }

  return fs.readFileSync(targetPath, 'utf-8');
}

export function readJsonData(fileName) {
  const filePath = path.resolve(PUBLIC_DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new AssertionError(
      `Data file not found at: ${filePath}`,
      'File exists',
      'File not found'
    );
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Runner execution logic
async function runTests() {
  if (options.help) {
    console.log(`
ICSE Resources E2E Test Runner

Usage:
  node tests/e2e/runner.mjs [options]

Options:
  --tier=<1|2|3|4|all>   Run specific tier(s), e.g. --tier=1 or --tier=1,2
  --filter=<string>      Filter test suite or test case names by substring
  --grep=<string>        Alias for --filter
  --json                 Output test results as structured JSON
  --verbose, -v          Show detailed stack traces and diagnostics
  --help, -h             Show this help message
`);
    process.exit(0);
  }

  const startTime = Date.now();
  const filterPattern = options.filter || options.grep;

  // Determine which tier files to import
  const tierFiles = [
    { tier: 1, file: 'tier1_feature_coverage.test.mjs' },
    { tier: 2, file: 'tier2_boundary_corner.test.mjs' },
    { tier: 3, file: 'tier3_cross_feature.test.mjs' },
    { tier: 4, file: 'tier4_real_world.test.mjs' }
  ];

  let selectedFiles = tierFiles;
  if (options.tier && options.tier !== 'all') {
    const requestedTiers = options.tier.split(',').map(t => parseInt(t.replace('tier', '').trim(), 10));
    selectedFiles = tierFiles.filter(t => requestedTiers.includes(t.tier));
  }

  // Dynamically import selected test suites
  for (const item of selectedFiles) {
    const suitePath = path.resolve(__dirname, item.file);
    if (fs.existsSync(suitePath)) {
      try {
        await import(pathToFileURL(suitePath).href);
      } catch (err) {
        console.error(`${colors.red}Error loading test file ${item.file}:${colors.reset}`, err);
        process.exit(1);
      }
    }
  }

  // Execute suites
  const results = {
    totalSuites: suites.length,
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    durationMs: 0,
    suites: []
  };

  if (!options.json) {
    console.log(`\n${colors.bright}${colors.cyan}=== ICSE Resources E2E Test Runner ===${colors.reset}`);
    console.log(`${colors.gray}Environment: Node ${process.version} | Target: ${DIST_DIR}${colors.reset}`);
    console.log(`${colors.gray}Build output status: ${distExists() ? colors.green + 'dist/ exists' : colors.yellow + 'dist/ not built (TDD mode)'}${colors.reset}\n`);
  }

  for (const suite of suites) {
    const suiteResult = {
      name: suite.name,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };

    let suiteMatched = true;
    if (filterPattern && !suite.name.toLowerCase().includes(filterPattern.toLowerCase())) {
      suiteMatched = false;
    }

    if (!options.json && suiteMatched) {
      console.log(`${colors.bright}${colors.blue}▶ Suite: ${suite.name}${colors.reset}`);
    }

    // Run beforeAll hooks
    try {
      for (const hook of suite.beforeAllHooks) {
        await hook();
      }
    } catch (err) {
      console.error(`  ${colors.red}beforeAll hook failed in suite: ${suite.name}${colors.reset}`, err);
    }

    for (const testItem of suite.tests) {
      results.totalTests++;

      if (filterPattern && !suiteMatched && !testItem.name.toLowerCase().includes(filterPattern.toLowerCase())) {
        suiteResult.skipped++;
        results.skipped++;
        continue;
      }

      // Run beforeEach hooks
      try {
        for (const hook of suite.beforeEachHooks) {
          await hook();
        }
      } catch (err) {
        console.error(`  ${colors.red}beforeEach hook failed in: ${testItem.name}${colors.reset}`, err);
      }

      const testStart = Date.now();
      try {
        await testItem.fn();
        const duration = Date.now() - testStart;
        suiteResult.passed++;
        results.passed++;
        suiteResult.tests.push({ name: testItem.name, status: 'passed', durationMs: duration });
        if (!options.json) {
          console.log(`  ${colors.green}✔${colors.reset} ${testItem.name} ${colors.gray}(${duration}ms)${colors.reset}`);
        }
      } catch (err) {
        const duration = Date.now() - testStart;
        suiteResult.failed++;
        results.failed++;
        suiteResult.tests.push({
          name: testItem.name,
          status: 'failed',
          durationMs: duration,
          error: err.message,
          stack: err.stack
        });
        if (!options.json) {
          console.log(`  ${colors.red}✖${colors.reset} ${testItem.name} ${colors.gray}(${duration}ms)${colors.reset}`);
          console.log(`    ${colors.red}${err.message}${colors.reset}`);
          if (options.verbose && err.stack) {
            console.log(`    ${colors.dim}${err.stack}${colors.reset}`);
          }
        }
      }

      // Run afterEach hooks
      try {
        for (const hook of suite.afterEachHooks) {
          await hook();
        }
      } catch (err) {
        console.error(`  ${colors.red}afterEach hook failed in: ${testItem.name}${colors.reset}`, err);
      }
    }

    // Run afterAll hooks
    try {
      for (const hook of suite.afterAllHooks) {
        await hook();
      }
    } catch (err) {
      console.error(`  ${colors.red}afterAll hook failed in suite: ${suite.name}${colors.reset}`, err);
    }

    results.suites.push(suiteResult);
    if (!options.json && suiteMatched) {
      console.log('');
    }
  }

  results.durationMs = Date.now() - startTime;

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`${colors.bright}${colors.cyan}----------------------------------------${colors.reset}`);
    console.log(`${colors.bright}Test Summary:${colors.reset}`);
    console.log(`  Suites:  ${results.totalSuites}`);
    console.log(`  Total:   ${results.totalTests}`);
    console.log(`  Passed:  ${colors.green}${results.passed}${colors.reset}`);
    console.log(`  Failed:  ${results.failed > 0 ? colors.red : colors.gray}${results.failed}${colors.reset}`);
    if (results.skipped > 0) {
      console.log(`  Skipped: ${colors.yellow}${results.skipped}${colors.reset}`);
    }
    console.log(`  Time:    ${results.durationMs}ms`);
    console.log(`${colors.bright}${colors.cyan}----------------------------------------${colors.reset}`);
    if (results.failed === 0) {
      console.log(`${colors.green}${colors.bright}ALL TESTS PASSED! Ready for deployment.${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}Note: In TDD Red phase, static HTML tests fail until Astro build (M1-M4) generates dist/.${colors.reset}\n`);
    }
  }

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Auto-run if executed as CLI
const isDirectCall = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectCall) {
  runTests().catch(err => {
    console.error(`${colors.red}Fatal test runner error:${colors.reset}`, err);
    process.exit(1);
  });
}
