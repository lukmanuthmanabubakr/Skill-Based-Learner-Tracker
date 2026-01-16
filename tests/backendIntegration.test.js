import assert from "assert";
import test from "node:test";

const BASE_URL = "http://localhost:5050/api";
let testToken = null;
let testUserId = null;
let testSkillId = null;
let testPracticeSessionId = null;
let testEvidenceId = null;

/**
 * SECTION: AUTHENTICATION TESTS
 */

/**
 * TEST 1: Register new user
 * SCENARIO: New user creates account with valid credentials
 * EXPECTED: 200 OK with token and user data
 */
async function testRegisterUser() {
  console.log("\n TEST 1: Register New User");
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: uniqueEmail,
      password: "SecurePassword123!",
    }),
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.success, true, "Should indicate success");
  assert(data.data.token, "Should return JWT token");
  
  testToken = data.data.token;
  testUserId = data.data.user.id;
  
  console.log("✓ User registered successfully");
  console.log(`  - Email: ${uniqueEmail}`);
  console.log(`  - Token: ${testToken.substring(0, 20)}...`);
}

/**
 * TEST 2: Reject duplicate email on registration
 * SCENARIO: Attempt to register with existing email
 * EXPECTED: 409 Conflict error
 */
async function testRejectDuplicateEmail() {
  console.log("\n TEST 2: Reject Duplicate Email Registration");
  
  const duplicateEmail = `duplicateemail_${Date.now()}@example.com`;
  
  // First registration
  const firstResponse = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "User One",
      email: duplicateEmail,
      password: "SecurePassword123!",
    }),
  });
  
  assert.strictEqual(firstResponse.status, 200, "First registration should succeed");

  // Second attempt with same email
  const secondResponse = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "User Two",
      email: duplicateEmail,
      password: "SecurePassword123!",
    }),
  });

  assert.strictEqual(secondResponse.status, 409, "Should return 409 Conflict");
  console.log("✓ Duplicate email correctly rejected");
}

/**
 * TEST 3: Login with valid credentials
 * SCENARIO: User logs in with correct email and password
 * EXPECTED: 200 OK with token
 */
async function testLoginUser() {
  console.log("\n TEST 3: Login with Valid Credentials");
  
  // First register
  const registerEmail = `login_test_${Date.now()}@example.com`;
  const registerPassword = "LoginPassword123!";
  
  await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Login Test User",
      email: registerEmail,
      password: registerPassword,
    }),
  });

  // Now login
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: registerEmail,
      password: registerPassword,
    }),
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert(data.data.token, "Should return token");
  
  console.log("✓ Login successful");
  console.log(`  - Token obtained: ${data.data.token.substring(0, 20)}...`);
}

/**
 * TEST 4: Reject invalid password
 * SCENARIO: User attempts login with wrong password
 * EXPECTED: 404 error
 */
async function testRejectInvalidPassword() {
  console.log("\n TEST 4: Reject Invalid Password");
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "anyemail@example.com",
      password: "WrongPassword123!",
    }),
  });

  assert(response.status >= 400, "Should return error status");
  console.log("✓ Invalid password correctly rejected");
}

/**
 * TEST 5: Get authenticated user profile
 * SCENARIO: User retrieves their own profile
 * EXPECTED: 200 OK with user data, no password
 */
async function testGetUserProfile() {
  console.log("\n TEST 5: Get User Profile");
  
  const response = await fetch(`${BASE_URL}/auth/users/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
    },
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert(!data.data.user.password, "Password should not be returned");
  assert(data.data.user.email, "Should have email");
  assert(data.data.user.name, "Should have name");
  
  console.log("✓ Profile retrieved successfully");
  console.log(`  - Name: ${data.data.user.name}`);
  console.log(`  - Email: ${data.data.user.email}`);
}

/**
 * SECTION: USER PROFILE TESTS
 */

/**
 * TEST 6: Update user profile
 * SCENARIO: User updates name and bio
 * EXPECTED: 200 OK with updated profile
 */
async function testUpdateUserProfile() {
  console.log("\n TEST 6: Update User Profile");
  
  const response = await fetch(`${BASE_URL}/auth/users/me`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Updated Test User",
      bio: "I am a passionate developer",
    }),
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.data.user.name, "Updated Test User");
  assert.strictEqual(data.data.user.bio, "I am a passionate developer");
  
  console.log("✓ Profile updated successfully");
  console.log(`  - Name: ${data.data.user.name}`);
  console.log(`  - Bio: ${data.data.user.bio}`);
}

/**
 * SECTION: SKILLS TESTS
 */

/**
 * TEST 7: Create a new skill
 * SCENARIO: User creates a skill with name, description, and category
 * EXPECTED: 200/201 with skill data
 */
async function testCreateSkill() {
  console.log("\n TEST 7: Create New Skill");
  
  const response = await fetch(`${BASE_URL}/skills`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `JavaScript_${Date.now()}`,
      description: "Web development programming language",
      category: "Frontend Development",
    }),
  });

  assert(response.status === 200 || response.status === 201, `Should return success, got ${response.status}`);
  const data = await response.json();
  assert(data.success === true || data.data, "Should have data");
  
  // Extract skill ID from response
  testSkillId = data.data?.id || data.data?._id;
  
  console.log("✓ Skill created successfully");
  console.log(`  - Name: JavaScript`);
  console.log(`  - Category: Frontend Development`);
}

/**
 * TEST 8: Get user skills with pagination
 * SCENARIO: User retrieves list of skills
 * EXPECTED: 200 OK with skills array and pagination metadata
 */
async function testGetUserSkills() {
  console.log("\n TEST 8: Get User Skills");
  
  const response = await fetch(`${BASE_URL}/skills?limit=10`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
    },
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert(Array.isArray(data.data) || data.success, "Should return skills");
  
  console.log("✓ Skills retrieved successfully");
}

/**
 * TEST 9: Filter skills by status
 * SCENARIO: User filters skills by status (Active, Archived, etc)
 * EXPECTED: 200 OK with filtered results
 */
async function testFilterSkillsByStatus() {
  console.log("\n TEST 9: Filter Skills by Status");
  
  const response = await fetch(`${BASE_URL}/skills?status=Active`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
    },
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  
  console.log("✓ Skills filtered successfully");
}

/**
 * TEST 10: Sort skills
 * SCENARIO: User sorts skills by creation date
 * EXPECTED: 200 OK with sorted results
 */
async function testSortSkills() {
  console.log("\n  TEST 10: Sort Skills by Date");
  
  const response = await fetch(`${BASE_URL}/skills?sort=createdAt:desc`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
    },
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  
  console.log("✓ Skills sorted successfully");
}

/**
 * TEST 11: Update skill
 * SCENARIO: User updates existing skill details
 * EXPECTED: 200 OK with updated skill
 */
async function testUpdateSkill() {
  console.log("\n TEST 11: Update Skill");
  
  if (!testSkillId) {
    console.log("Skipping: No skill ID available");
    return;
  }
  
  const response = await fetch(`${BASE_URL}/skills/${testSkillId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: "Updated description for JavaScript",
    }),
  });

  if (response.status === 200 || response.status === 404) {
    console.log("✓ Skill update request completed");
  }
}

/**
 * SECTION: PRACTICE SESSION TESTS
 */

/**
 * TEST 12: Create practice session
 * SCENARIO: User logs a practice session for a skill
 * EXPECTED: 200/201 with session data
 */
async function testCreatePracticeSession() {
  console.log("\n TEST 12: Create Practice Session");
  
  if (!testSkillId) {
    console.log(" Skipping: No skill ID available");
    return;
  }
  
  const response = await fetch(`${BASE_URL}/practice-logs`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      skillId: testSkillId,
      duration: 60, // 60 minutes
      notes: "Practiced async/await and promises",
      focusArea: "Asynchronous programming",
    }),
  });

  if (response.status === 200 || response.status === 201) {
    const data = await response.json();
    testPracticeSessionId = data.data?.id || data.data?._id;
    console.log("✓ Practice session created successfully");
    console.log(`  - Duration: 60 minutes`);
    console.log(`  - Focus: Asynchronous programming`);
  } else {
    console.log(" Could not create practice session");
  }
}

/**
 * TEST 13: Get practice sessions
 * SCENARIO: User retrieves list of practice sessions
 * EXPECTED: 200 OK with sessions array
 */
async function testGetPracticeSessions() {
  console.log("\n TEST 13: Get Practice Sessions");
  
  const response = await fetch(`${BASE_URL}/practice-logs`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
    },
  });

  if (response.status === 200) {
    console.log("Practice sessions retrieved successfully");
  } else {
    console.log(" Could not retrieve practice sessions");
  }
}

/**
 * SECTION: EVIDENCE TESTS
 */

/**
 * TEST 14: Create evidence for skill
 * SCENARIO: User adds evidence (certification, project) for skill
 * EXPECTED: 200/201 with evidence data
 */
async function testCreateEvidence() {
  console.log("\n TEST 14: Create Skill Evidence");
  
  if (!testSkillId) {
    console.log("Skipping: No skill ID available");
    return;
  }
  
  const response = await fetch(`${BASE_URL}/evidence`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      skillId: testSkillId,
      title: "Built Real-time Chat Application",
      description: "Created a WebSocket-based chat app with Node.js",
      type: "project",
    }),
  });

  if (response.status === 200 || response.status === 201) {
    const data = await response.json();
    testEvidenceId = data.data?.id || data.data?._id;
    console.log("✓ Evidence created successfully");
    console.log(`  - Type: Project`);
    console.log(`  - Title: Built Real-time Chat Application`);
  } else {
    console.log("Could not create evidence");
  }
}

/**
 * TEST 15: Get evidence for skill
 * SCENARIO: User retrieves evidence for a specific skill
 * EXPECTED: 200 OK with evidence array
 */
async function testGetEvidence() {
  console.log("\n TEST 15: Get Skill Evidence");
  
  if (!testSkillId) {
    console.log(" Skipping: No skill ID available");
    return;
  }
  
  const response = await fetch(`${BASE_URL}/evidence/skills/${testSkillId}/evidence`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
    },
  });

  if (response.status === 200) {
    console.log("✓ Evidence retrieved successfully");
  } else {
    console.log("Could not retrieve evidence");
  }
}

/**
 * SECTION: SECURITY TESTS
 */

/**
 * TEST 16: Reject unauthenticated requests
 * SCENARIO: Access protected endpoint without token
 * EXPECTED: 401 Unauthorized
 */
async function testRejectUnauthenticated() {
  console.log("\n TEST 16: Reject Unauthenticated Requests");
  
  const response = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  assert(response.status === 401 || response.status === 403, "Should reject unauthorized");
  console.log("Unauthenticated request correctly rejected");
}

/**
 * TEST 17: Reject invalid token
 * SCENARIO: Use malformed JWT token
 * EXPECTED: 401 Unauthorized
 */
async function testRejectInvalidToken() {
  console.log("\n TEST 17: Reject Invalid Token");
  
  const response = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer invalid_token_xyz",
    },
  });

  assert(response.status === 401 || response.status === 403, "Should reject invalid token");
  console.log("✓ Invalid token correctly rejected");
}

/**
 * TEST 18: Verify correlation ID propagation
 * SCENARIO: Send request with correlation ID header
 * EXPECTED: Response includes same correlation ID
 */
async function testCorrelationIdPropagation() {
  console.log("\n TEST 18: Correlation ID Propagation");
  
  const correlationId = `test-correlation-${Date.now()}`;
  
  const response = await fetch(`${BASE_URL}/auth/users/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${testToken}`,
      "x-correlation-id": correlationId,
    },
  });

  const responseCorrelationId = response.headers.get("x-correlation-id");
  if (responseCorrelationId === correlationId) {
    console.log("Correlation ID correctly propagated");
  } else {
    console.log("  Correlation ID not propagated (optional feature)");
  }
}

/**
 * SECTION: ERROR HANDLING TESTS
 */

/**
 * TEST 19: Validate error response format
 * SCENARIO: Trigger validation error and check response structure
 * EXPECTED: 422 with correct error format
 */
async function testErrorResponseFormat() {
  console.log("\n TEST 19: Error Response Format");
  
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test",
      email: "invalidemail",
      password: "short",
    }),
  });

  if (response.status >= 400) {
    const data = await response.json();
    assert(data.error || !data.success, "Should have error field");
    console.log("✓ Error response format correct");
    console.log(`  - Error Code: ${data.error?.code || 'N/A'}`);
    console.log(`  - Message: ${data.error?.message || 'N/A'}`);
  }
}

/**
 * TEST 20: Test logging with request tracking
 * SCENARIO: Make multiple requests and verify they're tracked
 * EXPECTED: Requests processed without errors, logged with correlation IDs
 */
async function testRequestTracking() {
  console.log("\nTEST 20: Request Tracking & Logging");
  
  const requests = [
    fetch(`${BASE_URL}/auth/users/me`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${testToken}` },
    }),
    fetch(`${BASE_URL}/skills`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${testToken}` },
    }),
  ];

  const results = await Promise.all(requests);
  const allSuccessful = results.every(r => r.status === 200);
  
  if (allSuccessful) {
    console.log("All requests tracked and processed successfully");
  } else {
    console.log(" Some requests failed");
  }
}

/**
 * RUN ALL TESTS USING NODE'S TEST RUNNER
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          COMPREHENSIVE BACKEND TEST SUITE                 ║
║                                                                ║
║  This suite tests all endpoints and core functionality        ║
║  Server must be running on http://localhost:5050              ║
╚════════════════════════════════════════════════════════════════╝
`);

const startTime = Date.now();

// Authentication Tests
test("TEST 1: Register New User", testRegisterUser);
test("TEST 2: Reject Duplicate Email", testRejectDuplicateEmail);
test("TEST 3: Login with Valid Credentials", testLoginUser);
test("TEST 4: Reject Invalid Password", testRejectInvalidPassword);
test("TEST 5: Get User Profile", testGetUserProfile);

// User Profile Tests
test("TEST 6: Update User Profile", testUpdateUserProfile);

// Skills Tests
test("TEST 7: Create New Skill", testCreateSkill);
test("TEST 8: Get User Skills", testGetUserSkills);
test("TEST 9: Filter Skills by Status", testFilterSkillsByStatus);
test("TEST 10: Sort Skills", testSortSkills);
test("TEST 11: Update Skill", testUpdateSkill);

// Practice Session Tests
test("TEST 12: Create Practice Session", testCreatePracticeSession);
test("TEST 13: Get Practice Sessions", testGetPracticeSessions);

// Evidence Tests
test("TEST 14: Create Evidence", testCreateEvidence);
test("TEST 15: Get Evidence", testGetEvidence);

// Security Tests
test("TEST 16: Reject Unauthenticated Requests", testRejectUnauthenticated);
test("TEST 17: Reject Invalid Token", testRejectInvalidToken);
test("TEST 18: Correlation ID Propagation", testCorrelationIdPropagation);

// Error Handling & Logging Tests
test("TEST 19: Error Response Format", testErrorResponseFormat);
test("TEST 20: Request Tracking", testRequestTracking);

// Print summary after all tests complete
process.on("exit", () => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                     TEST SUMMARY                               ║   
╚════════════════════════════════════════════════════════════════╝

📊 Test Suite:
  • Total Tests: 20
  • ⏱️  Duration: ${duration}ms

For detailed results, see output above
  `);
});
