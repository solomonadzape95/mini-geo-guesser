# 🚀 Quick Testing Checklist

## ⚡ 5-Minute Setup

1. **Run the setup script:**
   ```bash
   ./setup-test-env.sh
   ```

2. **Configure environment variables:**
   - Edit `backend/.env` with your Supabase credentials
   - Edit `frontend/.env` with your backend URL

3. **Apply database migrations in Supabase:**
   - Run `supabase/migrations/001_auth_policies.sql`
   - Run `supabase/migrations/002_user_context_function.sql`

## 🧪 Quick Tests

### **Test 1: Backend Health (30 seconds)**
```bash
cd backend
npm run dev
# In another terminal:
curl http://localhost:8787/health
# Should return: {"status":"ok","timestamp":"..."}
```

### **Test 2: Frontend Authentication (1 minute)**
```bash
cd frontend
npm run dev
# Open http://localhost:3000 in Farcaster browser
# Look for blue AuthDebugger box in bottom-right
```

### **Test 3: API Endpoints (30 seconds)**
- Click "Test Endpoints" in AuthDebugger
- Should see all green checkmarks ✅

### **Test 4: Database Verification (30 seconds)**
- Open Supabase Dashboard
- Check `profiles` table for your user
- Check `user_games` table for test game

## ✅ Success Indicators

- **Backend:** Health endpoint returns `{"status":"ok"}`
- **Frontend:** AuthDebugger shows your FID and Profile ID
- **API:** All endpoints show green checkmarks
- **Database:** User profile created automatically

## ❌ Common Issues

| Issue | Solution |
|-------|----------|
| "No user authenticated" | Use Farcaster-enabled browser |
| "Backend not found" | Check VITE_BACKEND_URL in frontend/.env |
| "401 Unauthorized" | Check Supabase credentials in backend/.env |
| "RLS policy error" | Apply database migrations |

## 🎯 What to Test

### **Authentication Flow**
- [ ] User automatically authenticated
- [ ] Profile created in database
- [ ] FID and address displayed correctly

### **API Endpoints**
- [ ] `/me` - User info
- [ ] `/profile` - User profile with data
- [ ] `/games/save` - Save game result
- [ ] `/games/history` - Game history
- [ ] `/badges` - User badges

### **Security**
- [ ] Unauthenticated requests rejected
- [ ] Invalid tokens rejected
- [ ] User data isolated (RLS working)

## 📞 Need Help?

1. Check browser console for errors
2. Verify all environment variables set
3. Ensure database migrations applied
4. Use Farcaster-enabled browser
5. Check `TESTING_GUIDE.md` for detailed instructions

---

**Time to complete all tests: ~5 minutes** 