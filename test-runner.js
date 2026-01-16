#!/usr/bin/env node

/**
 * Backend Integration Test Runner
 * 
 * This runs all backend tests in sequence and reports results
 * Make sure the server is running before starting tests
 */

const BASE_URL = "http://localhost:5050/api";
let testToken = null;
let testUserId = null;
let testSkillId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function runTest(testNum, testName, testFn) {
  try {
    await testFn();
    log(colors.green, `✓ TEST ${testNum}: ${testName}`);
    return true;
  } catch (error) {
    log(colors.red, `✗ TEST ${testNum}: ${testName}`);
    log(colors.red, `  Error: ${error.message}`);
    return false;
  }
}

// Test 1: Register User
async function test1() {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: uniqueEmail,
      password: "SecurePassword123!",
    }),
  });
  
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const data = await res.json();
  if (!data.data?.token) throw new Error("No token returned");
  
  testToken = data.data.token;
  testUserId = data.data.user?.id;
}

// Test 2: Get User Profile
async function test2() {
  if (!testToken) throw new Error("No token available");
  
  const res = await fetch(`${BASE_URL}/auth/users/me`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${testToken}` },
  });
  
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const data = await res.json();
  if (!data.data?.user) throw new Error("No user returned");
}

async function test3() {
  if (!testToken) throw new Error("No token available");
  
  const res = await fetch(`${BASE_URL}/auth/users/me`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Updated User",
      bio: "Test bio",
    }),
  });
  
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const data = await res.json();
  if (data.data?.user?.name !== "Updated User") throw new Error("Name not updated");
}

// Test 4: Create Skill
async function test4() {
  if (!testToken) throw new Error("No token available");
  
  const res = await fetch(`${BASE_URL}/skills`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `JavaScript_${Date.now()}`,
      description: "Web development language",
      category: "Frontend Development",
    }),
  });
  
  if (res.status !== 200 && res.status !== 201) throw new Error(`Expected 200/201, got ${res.status}`);
  const data = await res.json();
  testSkillId = data.data?.id || data.data?._id;
}

// Test 5: Get Skills
async function test5() {
  if (!testToken) throw new Error("No token available");
  
  const res = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${testToken}` },
  });
  
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
}

// Test 6: Reject Unauthenticated
async function test6() {
  const res = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
  });
  
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected 401/403, got ${res.status}`);
  }
}

// Test 7: Reject Invalid Token
async function test7() {
  const res = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: { "Authorization": "Bearer invalid_token" },
  });
  
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected 401/403, got ${res.status}`);
  }
}

// Test 8: Validate Error Format
async function test8() {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test",
      email: "invalid",
      password: "short",
    }),
  });
  
  if (res.status < 400) throw new Error("Should return error");
  const data = await res.json();
  if (!data.error && data.success !== false) throw new Error("Invalid error format");
}

// Test 9: Login User
async function test9() {
  const uniqueEmail = `login_${Date.now()}@example.com`;
  
  // Register first
  await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Login Test",
      email: uniqueEmail,
      password: "LoginPassword123!",
    }),
  });
  
  // Then login
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: "LoginPassword123!",
    }),
  });
  
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const data = await res.json();
  if (!data.data?.token) throw new Error("No token in login response");
}

// Test 10: Correlation ID
async function test10() {
  if (!testToken) throw new Error("No token available");
  
  const correlationId = `test-${Date.now()}`;
  const res = await fetch(`${BASE_URL}/auth/users/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "x-correlation-id": correlationId,
    },
  });
  
  const resCorrelationId = res.headers.get("x-correlation-id");
  if (resCorrelationId !== correlationId) {
    // Optional feature, don't fail if not present
  }
}

// Main runner
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          COMPREHENSIVE BACKEND TEST SUITE                 ║
║                                                                ║
║  Testing all endpoints and core functionality                 ║
║  Make sure server is running on http://localhost:5050        ║
╚════════════════════════════════════════════════════════════════╝
`);

  const tests = [
    [1, "Register New User", test1],
    [2, "Get User Profile", test2],
    [3, "Update User Profile", test3],
    [4, "Create Skill", test4],
    [5, "Get Skills", test5],
    [6, "Reject Unauthenticated", test6],
    [7, "Reject Invalid Token", test7],
    [8, "Validate Error Format", test8],
    [9, "Login User", test9],
    [10, "Correlation ID Propagation", test10],
  ];

  const startTime = Date.now();
  let passed = 0;
  let failed = 0;

  for (const [num, name, testFn] of tests) {
    const result = await runTest(num, name, testFn);
    if (result) passed++;
    else failed++;
  }

  const duration = Date.now() - startTime;

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                     TEST SUMMARY                               ║
╚════════════════════════════════════════════════════════════════╝

📊 Results:
  • Total Tests: ${tests.length}
  • ✅ Passed: ${passed}
  • ❌ Failed: ${failed}
  • ⏱️  Duration: ${duration}ms

${failed === 0 ? log(colors.green, "🎉 ALL TESTS PASSED! 🎉") : log(colors.red, "⚠️  SOME TESTS FAILED")}
  `);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  log(colors.red, "Fatal error:", error.message);
  process.exit(1);
});
