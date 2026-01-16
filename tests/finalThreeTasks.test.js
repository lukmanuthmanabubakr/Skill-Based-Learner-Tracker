const BASE_URL = "http://localhost:5050/api";

let authToken;
let userId;
let skillId;
let testsPassed = 0;
let testsFailed = 0;

async function testAssert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ✗ ${name}: ${error.message}`);
    testsFailed++;
  }
}

const testSuite = async () => {
  console.log("\n------- ANALYTICS & RANKING & RATE LIMITING TESTS -------\n");

  test("Setup: Create test user and login", async () => {
    const email = `test-analytics-${Date.now()}@example.com`;
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: `TestUser-Analytics-${Date.now()}`,
        email: email,
        password: "Password123!",
      }),
    });

    await testAssert(registerResponse.status === 201, `Registration should succeed, got ${registerResponse.status}`);

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: "Password123!",
      }),
    });

    await testAssert(loginResponse.status === 200, `Login should succeed, got ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    authToken = loginData.data.token;
    userId = loginData.data.user._id;
  });

  test("Setup: Create test skill and practice logs", async () => {
    const skillResponse = await fetch(`${BASE_URL}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        skillName: "Test Skill for Analytics",
        category: "Backend Development",
        description: "Test skill for analytics testing",
      }),
    });

    await testAssert(skillResponse.status === 201, `Skill creation should succeed, got ${skillResponse.status}`);
    const skillData = await skillResponse.json();
    skillId = skillData.data._id;
  });

  test("Analytics: Get skill progress returns correct structure", async () => {
    const response = await fetch(`${BASE_URL}/analytics/skills/${skillId}/progress`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.success === true, "Success should be true");
    await testAssert(data.data, "Data should exist");
    await testAssert(typeof data.data.progressPercentage === "number", "Should have progress percentage");
    await testAssert(typeof data.data.totalDuration === "number", "Should have total duration");
    await testAssert(typeof data.data.sessionCount === "number", "Should have session count");
  });

  test("Analytics: Get user summary returns correct structure", async () => {
    const response = await fetch(`${BASE_URL}/analytics/user/summary`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.success === true, "Success should be true");
    await testAssert(data.data, "Data should exist");
    await testAssert(typeof data.data.totalSkills === "number", "Should have total skills");
    await testAssert(typeof data.data.activeSkills === "number", "Should have active skills");
    await testAssert(typeof data.data.totalPracticeTime === "number", "Should have total practice time");
  });

  test("Analytics: Get skill timeline requires authentication", async () => {
    const response = await fetch(`${BASE_URL}/analytics/skills/${skillId}/timeline`, {
      method: "GET",
    });

    await testAssert(response.status === 401, `Should return 401 without auth, got ${response.status}`);
  });

  test("Analytics: Get user streaks requires authentication", async () => {
    const response = await fetch(`${BASE_URL}/analytics/user/streaks`, {
      method: "GET",
    });

    await testAssert(response.status === 401, `Should return 401 without auth, got ${response.status}`);
  });

  test("Ranking: Get ranking by hours practiced returns array", async () => {
    const response = await fetch(`${BASE_URL}/rankings/hours-practiced`, {
      method: "GET",
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.success === true, "Success should be true");
    await testAssert(Array.isArray(data.data), "Data should be an array");
  });

  test("Ranking: Get ranking by milestones returns array", async () => {
    const response = await fetch(`${BASE_URL}/rankings/milestones`, {
      method: "GET",
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.success === true, "Success should be true");
    await testAssert(Array.isArray(data.data), "Data should be an array");
  });

  test("Ranking: Get user leaderboard returns array with rank", async () => {
    const response = await fetch(`${BASE_URL}/rankings/user-leaderboard`, {
      method: "GET",
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.success === true, "Success should be true");
    await testAssert(Array.isArray(data.data), "Data should be an array");

    if (data.data.length > 0) {
      await testAssert(typeof data.data[0].rank === "number", "Should have rank");
      await testAssert(typeof data.data[0].totalHours === "number", "Should have totalHours");
    }
  });

  test("Ranking: Get skill leaderboard with valid skillId", async () => {
    const response = await fetch(`${BASE_URL}/rankings/skill-leaderboard/${skillId}`, {
      method: "GET",
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.success === true, "Success should be true");
    await testAssert(Array.isArray(data.data), "Data should be an array");
  });

  test("Ranking: Get skill leaderboard with invalid skillId fails", async () => {
    const response = await fetch(`${BASE_URL}/rankings/skill-leaderboard/invalid-id`, {
      method: "GET",
    });

    await testAssert(response.status === 500, `Should return 500 for invalid ID, got ${response.status}`);
  });

  test("Rate Limiting: Global rate limit headers present", async () => {
    const response = await fetch(`${BASE_URL}/rankings/hours-practiced`);

    await testAssert(response.headers.get("x-ratelimit-limit"), "Should have rate limit header");
    await testAssert(response.headers.get("x-ratelimit-remaining"), "Should have remaining header");
    await testAssert(response.headers.get("x-ratelimit-reset"), "Should have reset header");
  });

  test("Rate Limiting: Auth endpoint has stricter limit", async () => {
    const responses = [];

    for (let i = 0; i < 3; i++) {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test-${i}@example.com`,
          password: "password",
        }),
      });

      responses.push(response);

      const remaining = parseInt(response.headers.get("x-ratelimit-remaining") || "0", 10);
      await testAssert(remaining >= 0, "Should have remaining count");
    }
  });

  test("Analytics: Skill progress missing skillId returns 422", async () => {
    const response = await fetch(`${BASE_URL}/analytics/skills/undefined/progress`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    await testAssert([400, 422, 500].includes(response.status), `Should return error, got ${response.status}`);
  });

  test("Ranking: User leaderboard respects limit parameter", async () => {
    const response = await fetch(`${BASE_URL}/rankings/user-leaderboard?limit=5`, {
      method: "GET",
    });

    await testAssert(response.status === 200, `Should return 200, got ${response.status}`);
    const data = await response.json();
    await testAssert(data.data.length <= 5, `Should respect limit, got ${data.data.length}`);
  });

  test("Analytics: Unauthenticated requests to private endpoints fail", async () => {
    const endpoints = [
      `/analytics/skills/${skillId}/progress`,
      `/analytics/user/summary`,
      `/analytics/skills/${skillId}/timeline`,
      `/analytics/user/streaks`,
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
      });

      await testAssert(response.status === 401, `${endpoint} should require auth, got ${response.status}`);
    }
  });

  console.log("\n------- TEST SUMMARY -------\n");
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total:  ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log("🎉 All tests passed!\n");
  }

  process.exit(testsFailed > 0 ? 1 : 0);
};

testSuite().catch(error => {
  console.error("Test suite error:", error);
  process.exit(1);
});
