#  How to Test Your Entire Backend

You now have **multiple ways to test** your backend with comprehensive coverage.

---

##  Test Files Available

### 1. **test-runner.js** - Simple Test Runner **RECOMMENDED**
- 10 core tests
- Easy to read output
- Best for quick validation

### 2. **updateUser.test.js** - User Profile Tests
- 13 tests for profile updates

### 3. **backendIntegration.test.js** - Full Backend Tests  
- 20 comprehensive tests
- Uses Node's test runner

---

##  How to Run Tests (3 Easy Options)

### **Option A: BEST - Use NPM Script** 
```bash
# Terminal 1: Start your server
npm run dev

# Terminal 2: Run tests (after server starts)
npm test
```

**Output:**
```
✓ TEST 1: Register New User
✓ TEST 2: Get User Profile  
✓ TEST 3: Update User Profile
✓ TEST 4: Create Skill
✓ TEST 5: Get Skills
✓ TEST 6: Reject Unauthenticated
✓ TEST 7: Reject Invalid Token
✓ TEST 8: Validate Error Format
✓ TEST 9: Login User
✓ TEST 10: Correlation ID Propagation

 Results:
  • Total Tests: 10
  • Passed: 10
  • Failed: 0
  • Duration: 2345ms

ALL TESTS PASSED!
```

---

### **Option B: Run Update User Tests**
```bash
npm run test:update-user
```

Tests the PATCH endpoint for user profile updates (13 tests).

---

### **Option C: Run Full Integration Tests**
```bash
npm run test:integration
```

Tests all backend endpoints using Node's test runner (20 tests).

---

## Test Coverage

### **Core Tests (test-runner.js)**
1. Register New User
2. Get User Profile
3. Update User Profile
4. Create Skill
5. Get Skills
6. Reject Unauthenticated
7. Reject Invalid Token
8. Validate Error Format
9. Login User
10. Correlation ID Propagation

### **Update User Tests (updateUser.test.js)**
- Update individual fields
- Update multiple fields
- Validation errors
- Whitespace trimming
- Security checks
- And 8 more tests

### **Full Backend Tests (backendIntegration.test.js)**
- All of the above plus:
- Practice sessions
- Evidence management
- Skill filtering and sorting
- Pagination
- Request tracking
- And more

---

## Quick Start

```bash
# Terminal 1
npm run dev

# Terminal 2 (wait 2 seconds for server to start)
sleep 2 && npm test
```

That's it! 

---

## 🔍 Understanding Results

### ✅ Success
```
✓ TEST 1: Register New User
✓ TEST 2: Get User Profile
```

### ❌ Failure
```
✗ TEST 3: Update User Profile
  Error: Expected 200, got 404
```

If a test fails:
1. Check server is running (`npm run dev`)
2. Check database connection (MongoDB)
3. Check `.env` file
4. Read the error message

---

## 📈 Performance

| Test Suite | Duration | Tests |
|-----------|----------|-------|
| test-runner.js | ~2-3s | 10 |
| updateUser.test.js | ~1-2s | 13 |
| backendIntegration.test.js | ~3-5s | 20 |

---

## 💡 Pro Tips

1. **Always start server first** - Tests need a running backend
2. **Check logs** - Server terminal shows detailed logs
3. **Run frequently** - After any code changes
4. **Use npm scripts** - Easier than typing full commands

---

## 🎓 What Gets Tested?

✅ **Authentication**
- Register
- Login
- Token validation

✅ **User Profile**
- Get profile
- Update name, bio, avatar

✅ **Skills**
- Create
- Read with pagination
- Filter and sort
- Update

✅ **Practice & Evidence**
- Create practice sessions
- Add evidence
- Retrieve data

✅ **Security**
- Auth required
- Token validation
- Protected endpoints

✅ **Error Handling**
- Validation errors
- Auth errors
- Response format

✅ **Logging**
- Request tracking
- Correlation IDs

---

## 🚀 Next Steps

After tests pass:
1. Review the test code to understand patterns
2. Check server logs for any warnings
3. Deploy with confidence!

Happy testing! 🎉

