# Authentication Layer


## 1. Authentication Options

### Option A: Custom Authentication
- User registers with email and password
- Password is hashed before saving
- Login returns a token
- Token is used for protected routes

## 2. User Profile Data

What we store about each user:
- Unique ID
- Email address
- Name
- When they created account
- When they last logged in

## 3. What We Need to Build

If we choose Custom Auth:
- Register endpoint
- Login endpoint
- Logout endpoint
- Password reset
