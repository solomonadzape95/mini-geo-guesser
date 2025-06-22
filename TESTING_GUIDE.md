# 🧪 Authentication Testing Guide

This guide will help you test the Farcaster Quick Auth system step by step.

## 📋 Prerequisites

1. **Farcaster-enabled browser** (Warpcast, Farcaster, or browser with Farcaster extension)
2. **Supabase project** with migrations applied
3. **Backend deployed** (local or production)
4. **Frontend running** with proper environment variables

## 🚀 Quick Start Testing

### 1. Environment Setup

```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your actual values

# Frontend  
cd frontend
cp env.example .env
# Edit .env with your actual values
```

### 2. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 3. Basic Health Check

```bash
# Test backend health
curl http://localhost:8787/health
# Should return: {"status":"ok","timestamp":"..."}
```

## 🔍 Step-by-Step Testing

### **Step 1: Backend Health Check**

```bash
cd backend
node test-auth.js
```

Expected output:
```
🧪 Testing Backend Authentication...

✅ Health check passed: { status: 'ok', timestamp: '...' }
✅ Unauthenticated access correctly rejected

📝 To test authenticated endpoints:
1. Start your backend: npm run dev
2. Open your frontend in a Farcaster-enabled browser
3. Check the browser console for authentication status
4. Use browser dev tools to inspect the Authorization header
```

### **Step 2: Frontend Authentication**

1. **Open your app** in a Farcaster-enabled browser
2. **Check browser console** for authentication logs
3. **Look for the AuthDebugger component** (blue box in bottom-right)

Expected console output:
```
✅ Authentication successful
User: { fid: 12345, primaryAddress: "0x...", profileId: 1 }
```

### **Step 3: Test API Endpoints**

1. **Click "Test Endpoints"** in the AuthDebugger
2. **Check results** for each endpoint:

```
🔒 Auth Debugger
FID: 12345
Profile ID: 1
Address: 0x12345678...
Streak: 3 🔥
Last Sign In: 12/15/2024, 2:30:45 PM
Games Played: 5
Badges Claimed: 2/8

API Test Results:
✅ profile
✅ history  
✅ badges
✅ saveGame
  New Streak: 4 🔥
```

### **Step 4: Database Verification**

1. **Open Supabase Dashboard**
2. **Go to Table Editor**
3. **Check the `profiles` table** - should see your user with `lastSignIn` and `streak`
4. **Check the `user_games` table** - should see test game result
5. **Check the `user_badges` table** - should see claimed badges

## 🆕 New Features Testing

### **Streak Calculation Testing**

1. **Play multiple games on consecutive days**
2. **Check streak updates** in AuthDebugger
3. **Verify streak calculation** in database

```javascript
// Test streak calculation
const profile = await getUserProfile();
console.log('Current streak:', profile.streak);

// Play a game
const result = await saveGameResult({ gameId: 1, score: 3500 });
console.log('New streak:', result.newStreak);
```

### **Badge Claiming Testing**

1. **Check badge claimed status** in AuthDebugger
2. **Verify claimed badges** show ✅, unclaimed show ❌
3. **Test badge claiming** functionality

```javascript
// Test badge status
const badges = await getUserBadges();
badges.badges.forEach(badge => {
  console.log(`${badge.claimed ? '✅' : '❌'} ${badge.name}`);
});
```

### **Last Sign In Testing**

1. **Authenticate multiple times**
2. **Check lastSignIn updates** in AuthDebugger
3. **Verify timestamp** is current

## 🛠️ Manual Testing

### **Test 1: Authentication Flow**

```javascript
// In browser console
import { sdk } from "@farcaster/frame-sdk";

// Test Quick Auth
const token = await sdk.quickAuth.getToken();
console.log('Token:', token);

// Test authenticated request
const user = await sdk.quickAuth.fetch('http://localhost:8787/me');
console.log('User:', await user.json());
```

### **Test 2: API Endpoints**

```javascript
// Test each endpoint manually
const endpoints = [
  '/me',
  '/profile', 
  '/games/history',
  '/badges'
];

for (const endpoint of endpoints) {
  try {
    const res = await sdk.quickAuth.fetch(`http://localhost:8787${endpoint}`);
    console.log(`${endpoint}:`, await res.json());
  } catch (err) {
    console.error(`${endpoint} failed:`, err);
  }
}
```

### **Test 3: Game Save with Streak**

```javascript
// Test saving a game result and streak update
const gameResult = {
  gameId: 1,
  score: 3500
};

const saveRes = await sdk.quickAuth.fetch('http://localhost:8787/games/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(gameResult)
});

const result = await saveRes.json();
console.log('Save result:', result);
console.log('New streak:', result.newStreak);
```

## 🔒 Security Testing

### **Test 1: RLS Policies**

1. **Try to access another user's data** (should fail)
2. **Test with invalid token** (should fail)
3. **Test without token** (should fail)

```javascript
// Test invalid token
const invalidRes = await fetch('http://localhost:8787/me', {
  headers: { 'Authorization': 'Bearer invalid-token' }
});
console.log('Invalid token response:', invalidRes.status); // Should be 401
```

### **Test 2: User Isolation**

1. **Create two different Farcaster accounts**
2. **Login with each account**
3. **Verify data isolation** - users can't see each other's data

### **Test 3: Token Validation**

```javascript
// Test token expiration (if applicable)
// Test domain-specific validation
// Test malformed tokens
```

## 🐛 Debugging Common Issues

### **Issue 1: Authentication Not Working**

**Symptoms:**
- AuthDebugger shows "No user authenticated"
- Console shows authentication errors

**Solutions:**
1. Check if you're using a Farcaster-enabled browser
2. Verify backend URL in frontend environment
3. Check CORS configuration
4. Verify Quick Auth domain settings

### **Issue 2: API Endpoints Failing**

**Symptoms:**
- AuthDebugger shows red X for endpoints
- 401/403 errors in console

**Solutions:**
1. Check backend is running
2. Verify environment variables
3. Check Supabase connection
4. Verify RLS policies are applied

### **Issue 3: Database Errors**

**Symptoms:**
- Profile creation fails
- Game saves fail
- RLS policy errors

**Solutions:**
1. Verify Supabase service role key
2. Check migrations are applied
3. Verify table structure
4. Check RLS policies

### **Issue 4: Streak Not Updating**

**Symptoms:**
- Streak stays at 0
- Streak calculation incorrect

**Solutions:**
1. Check games table has proper date fields
2. Verify streak calculation logic
3. Check user_games table structure
4. Ensure games are saved with correct gameId

## 📊 Testing Checklist

### **Backend Tests**
- [ ] Health endpoint responds
- [ ] Unauthenticated requests rejected
- [ ] JWT validation works
- [ ] User profile creation works
- [ ] API endpoints respond correctly
- [ ] Streak calculation works
- [ ] Badge claiming status correct
- [ ] LastSignIn updates properly

### **Frontend Tests**
- [ ] Authentication happens automatically
- [ ] User state is properly managed
- [ ] API calls work with authentication
- [ ] Error handling works
- [ ] Loading states work
- [ ] Streak display updates
- [ ] Badge status shows correctly

### **Database Tests**
- [ ] User profiles created automatically
- [ ] RLS policies enforce isolation
- [ ] Game results saved correctly
- [ ] Data queries work properly
- [ ] Streak calculation accurate
- [ ] Badge claiming works

### **Security Tests**
- [ ] Users can't access other users' data
- [ ] Invalid tokens rejected
- [ ] Missing tokens rejected
- [ ] Cross-origin requests handled properly

## 🎯 Production Testing

### **1. Deploy Backend**

```bash
cd backend
npm run deploy
```

### **2. Update Frontend Environment**

```bash
# Update VITE_BACKEND_URL to production URL
VITE_BACKEND_URL=https://your-backend.workers.dev
```

### **3. Test Production**

1. **Deploy frontend** to production
2. **Test with real Farcaster accounts**
3. **Verify all functionality works**
4. **Check performance and error rates**
5. **Test streak calculation over multiple days**
6. **Verify badge claiming in production**

## 📝 Test Results Template

```
Test Date: _______________
Tester: _________________

Backend Health: ✅/❌
Authentication: ✅/❌
Profile Creation: ✅/❌
API Endpoints: ✅/❌
RLS Policies: ✅/❌
Game Save: ✅/❌
Streak Calculation: ✅/❌
Badge Claiming: ✅/❌
LastSignIn Updates: ✅/❌
Error Handling: ✅/❌

Issues Found:
- _________________
- _________________

Notes:
- _________________
- _________________
```

## 🆘 Getting Help

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Test with the AuthDebugger component**
4. **Check the AUTH_SETUP.md** for configuration details
5. **Review the backend logs** for server-side errors
6. **Verify database migrations** are applied
7. **Check streak calculation** logic

The authentication system should work seamlessly once properly configured! 