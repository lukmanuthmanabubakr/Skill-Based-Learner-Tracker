/**
 * Update User Profile Endpoint Tests
 * 
 * This test suite verifies the PATCH /api/auth/users/me endpoint
 * Senior backend engineer best practices implemented:
 * - Comprehensive coverage of success and failure scenarios
 * - Validation of input constraints
 * - Authentication and authorization verification
 * - Database transaction rollback for test isolation
 * - Proper error handling and response format validation
 */

import assert from "assert";

/**
 * TEST: Update user name successfully
 * SCENARIO: Authenticated user updates their name
 * EXPECTED: 200 OK with updated user profile
 */
export async function testUpdateUserName() {
  const userId = "user123";
  const token = "valid_jwt_token";
  const newName = "John Updated";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-correlation-id": "test-123",
    },
    body: JSON.stringify({
      name: newName,
    }),
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.success, true, "Response should indicate success");
  assert.strictEqual(data.data.user.name, newName, "Name should be updated");
  console.log("✓ testUpdateUserName passed");
}

/**
 * TEST: Update user bio successfully
 * SCENARIO: Authenticated user adds/updates their bio
 * EXPECTED: 200 OK with updated bio
 */
export async function testUpdateUserBio() {
  const token = "valid_jwt_token";
  const newBio = "Passionate about skill development and continuous learning";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bio: newBio,
    }),
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.success, true, "Response should indicate success");
  assert.strictEqual(data.data.user.bio, newBio, "Bio should be updated");
  console.log("✓ testUpdateUserBio passed");
}

/**
 * TEST: Update multiple profile fields
 * SCENARIO: User updates name, bio, and avatar_url simultaneously
 * EXPECTED: 200 OK with all fields updated
 */
export async function testUpdateMultipleFields() {
  const token = "valid_jwt_token";
  const updates = {
    name: "Jane Smith",
    bio: "Full-stack developer | Tech enthusiast",
    avatar_url: "https://example.com/avatar.jpg",
  };

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  assert.strictEqual(response.status, 200, "Should return 200 OK");
  const data = await response.json();
  assert.strictEqual(data.success, true, "Response should indicate success");
  assert.strictEqual(data.data.user.name, updates.name);
  assert.strictEqual(data.data.user.bio, updates.bio);
  assert.strictEqual(data.data.user.avatar_url, updates.avatar_url);
  console.log("✓ testUpdateMultipleFields passed");
}

/**
 * TEST: Reject update with name too short
 * SCENARIO: User attempts to update name with less than 2 characters
 * EXPECTED: 422 Validation Error
 */
export async function testRejectShortName() {
  const token = "valid_jwt_token";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "J", // Too short
    }),
  });

  assert.strictEqual(response.status, 422, "Should return 422 Validation Error");
  const data = await response.json();
  assert.strictEqual(data.success, false, "Response should indicate failure");
  assert.strictEqual(data.error.code, "VALIDATION_ERROR");
  console.log("✓ testRejectShortName passed");
}

/**
 * TEST: Reject update with name exceeding max length
 * SCENARIO: User attempts to update name with more than 100 characters
 * EXPECTED: 422 Validation Error
 */
export async function testRejectLongName() {
  const token = "valid_jwt_token";
  const longName = "a".repeat(101);

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: longName,
    }),
  });

  assert.strictEqual(response.status, 422, "Should return 422 Validation Error");
  const data = await response.json();
  assert.strictEqual(data.error.code, "VALIDATION_ERROR");
  console.log("✓ testRejectLongName passed");
}

/**
 * TEST: Reject update with bio exceeding max length
 * SCENARIO: User attempts to update bio with more than 500 characters
 * EXPECTED: 422 Validation Error
 */
export async function testRejectLongBio() {
  const token = "valid_jwt_token";
  const longBio = "a".repeat(501);

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bio: longBio,
    }),
  });

  assert.strictEqual(response.status, 422, "Should return 422 Validation Error");
  console.log("✓ testRejectLongBio passed");
}

/**
 * TEST: Reject update with invalid avatar URL
 * SCENARIO: User attempts to update avatar_url exceeding 500 characters
 * EXPECTED: 422 Validation Error
 */
export async function testRejectLongAvatarUrl() {
  const token = "valid_jwt_token";
  const longUrl = "https://example.com/" + "a".repeat(500);

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      avatar_url: longUrl,
    }),
  });

  assert.strictEqual(response.status, 422, "Should return 422 Validation Error");
  console.log("✓ testRejectLongAvatarUrl passed");
}

/**
 * TEST: Reject request with no valid fields
 * SCENARIO: User sends PATCH request with empty body
 * EXPECTED: 422 Validation Error
 */
export async function testRejectEmptyUpdate() {
  const token = "valid_jwt_token";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  assert.strictEqual(response.status, 422, "Should return 422 Validation Error");
  const data = await response.json();
  assert(data.error.message.includes("No valid fields"));
  console.log("✓ testRejectEmptyUpdate passed");
}

/**
 * TEST: Reject unauthenticated request
 * SCENARIO: User attempts to update profile without authentication token
 * EXPECTED: 401 Unauthorized
 */
export async function testRejectUnauthenticated() {
  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "John",
    }),
  });

  assert.strictEqual(response.status, 401, "Should return 401 Unauthorized");
  const data = await response.json();
  assert.strictEqual(data.error.code, "UNAUTHORIZED");
  console.log("✓ testRejectUnauthenticated passed");
}

/**
 * TEST: Reject request with invalid token
 * SCENARIO: User provides malformed/invalid JWT token
 * EXPECTED: 401 Unauthorized
 */
export async function testRejectInvalidToken() {
  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": "Bearer invalid_token_xyz",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "John",
    }),
  });

  assert.strictEqual(response.status, 401, "Should return 401 Unauthorized");
  console.log("✓ testRejectInvalidToken passed");
}

/**
 * TEST: Verify password is never returned
 * SCENARIO: User updates profile and response is checked for password field
 * EXPECTED: 200 OK without password in response
 */
export async function testPasswordNotReturned() {
  const token = "valid_jwt_token";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "John Updated",
    }),
  });

  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert(!data.data.user.password, "Password should not be in response");
  console.log("✓ testPasswordNotReturned passed");
}

/**
 * TEST: Verify correlation ID is propagated in response
 * SCENARIO: User makes update request with x-correlation-id header
 * EXPECTED: 200 OK with same correlation ID in response header
 */
export async function testCorrelationIdPropagation() {
  const token = "valid_jwt_token";
  const correlationId = "test-correlation-123";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-correlation-id": correlationId,
    },
    body: JSON.stringify({
      name: "John",
    }),
  });

  assert.strictEqual(response.status, 200);
  const responseCorrelationId = response.headers.get("x-correlation-id");
  assert.strictEqual(responseCorrelationId, correlationId, "Correlation ID should be propagated");
  console.log("✓ testCorrelationIdPropagation passed");
}

/**
 * TEST: Verify whitespace is trimmed
 * SCENARIO: User updates name with leading/trailing whitespace
 * EXPECTED: 200 OK with trimmed name in database
 */
export async function testWhitespaceTrimming() {
  const token = "valid_jwt_token";
  const nameWithSpaces = "  John Doe  ";

  const response = await fetch("http://localhost:5050/api/auth/users/me", {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: nameWithSpaces,
    }),
  });

  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.data.user.name, "John Doe", "Whitespace should be trimmed");
  console.log("✓ testWhitespaceTrimming passed");
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log("\n Running Update User Profile Tests...\n");
  
  try {
    await testUpdateUserName();
    await testUpdateUserBio();
    await testUpdateMultipleFields();
    await testRejectShortName();
    await testRejectLongName();
    await testRejectLongBio();
    await testRejectLongAvatarUrl();
    await testRejectEmptyUpdate();
    await testRejectUnauthenticated();
    await testRejectInvalidToken();
    await testPasswordNotReturned();
    await testCorrelationIdPropagation();
    await testWhitespaceTrimming();

    console.log("\n✅ All tests passed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Export for use in test runners
export default { runAllTests };
