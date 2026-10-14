#!/usr/bin/env node
/**
 * KindLink Backend Test Runner
 *
 * Runs test suites with code coverage (statement %, branch %, function %)
 * without connecting to or mutating any database.
 *
 * Usage:
 *   node scripts/run-tests.js               (runs all tests with coverage)
 *   node scripts/run-tests.js auth          (runs authentication & authorization tests)
 *   node scripts/run-tests.js profile       (runs profile management tests)
 *   node scripts/run-tests.js reviews       (runs ratings & feedback tests)
 *   node scripts/run-tests.js core          (runs auth + profile + reviews)
 *   node scripts/run-tests.js existing      (runs pre-existing test suites)
 *   node scripts/run-tests.js --no-coverage (runs tests quickly without coverage report)
 */

const { spawn } = require('child_process');
const path = require('path');

const targetArg = process.argv[2] ? process.argv[2].toLowerCase().replace(/^--/, '') : 'all';
const noCoverage = process.argv.includes('--no-coverage');

const SUITES = {
  auth: ['test/auth-and-authorization.test.js'],
  profile: ['test/profile-management.test.js'],
  reviews: ['test/rating-feedback.test.js'],
  core: [
    'test/auth-and-authorization.test.js',
    'test/profile-management.test.js',
    'test/rating-feedback.test.js'
  ],
  existing: [
    'test/appointment-assignment.test.js',
    'test/approval.test.js',
    'test/chat-access.test.js',
    'test/email-from.test.js',
    'test/id-document.test.js',
    'test/notification-targeting.test.js',
    'test/profile-photo.test.js',
    'test/safety-pin-verification.test.js'
  ],
  all: [] // empty array means node --test discovers all test files
};

let filesToRun = [];
if (targetArg in SUITES) {
  filesToRun = SUITES[targetArg];
} else if (targetArg === 'no-coverage') {
  filesToRun = [];
} else {
  console.log(`Unknown target suite: "${targetArg}"`);
  console.log('Available suites: all, core, auth, profile, reviews, existing');
  process.exit(1);
}

const args = ['--test'];
if (!noCoverage) {
  args.push('--experimental-test-coverage');
}

args.push(...filesToRun);

console.log('='.repeat(70));
console.log('  KindLink Backend Test Runner');
console.log(`  Target:    ${targetArg.toUpperCase()}`);
console.log(`  Coverage:  ${!noCoverage ? 'ENABLED (Branch, Stmt, Func)' : 'DISABLED'}`);
console.log('  Database:  MOCKED IN-MEMORY (0 database connections/changes)');
console.log('='.repeat(70));

const child = spawn(process.execPath, args, {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: process.env.JWT_SECRET || 'test-only-jwt-secret-key-12345'
  }
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nTest run completed with exit code: ${code}`);
    process.exit(code);
  }
  console.log('\nAll tests passed successfully!');
});
