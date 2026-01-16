#!/usr/bin/env node

/**
 * Simple Test Runner for Backend Integration Tests
 * This script runs the test suite and prints results
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          BACKEND TEST RUNNER                              ║
║                                                                ║
║  Make sure your server is running on http://localhost:5050   ║
╚════════════════════════════════════════════════════════════════╝
`);

async function runTests() {
  try {
    const { stdout, stderr } = await execAsync(
      'node --test tests/backendIntegration.test.js',
      { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }
    );
    
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    process.exit(0);
  } catch (error) {
    console.error("Error running tests:", error.message);
    console.log(error.stdout || "");
    console.error(error.stderr || "");
    process.exit(1);
  }
}

runTests();
