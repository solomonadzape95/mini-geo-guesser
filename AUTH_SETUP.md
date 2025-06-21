# Authentication Setup Guide

This guide explains how to set up Farcaster Quick Auth with Row Level Security (RLS) for the Mini Geo Guessr application.

## Overview

The authentication system consists of:
1. **Frontend**: Uses Farcaster Frame SDK for Quick Auth
2. **Backend**: Hono server with Quick Auth middleware
3. **Database**: Supabase with RLS policies
4. **User Management**: Automatic profile creation and management

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Quick Auth Configuration
HOSTNAME=your-domain.com

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 3. Deploy Backend

```bash
# Development
npm run dev

# Production (Cloudflare Workers)
npm run deploy
```

## Database Setup

### 1. Apply Migrations

Run the SQL migrations in your Supabase project:

```sql
-- Run the contents of supabase/migrations/001_auth_policies.sql
-- Run the contents of supabase/migrations/002_user_context_function.sql
```

### 2. Verify RLS Policies

The following RLS policies are automatically created:

- **profiles**: Users can only view/update their own profile
- **user_games**: Users can only view/insert/update their own game results
- **user_badges**: Users can only view/insert/update their own badges
- **games**: Read-only for all authenticated users
- **questions**: Read-only for all authenticated users
- **badges**: Read-only for all authenticated users
- **categories**: Read-only for all authenticated users

## Frontend Setup

### 1. Environment Configuration

Copy `frontend/env.example` to `frontend/.env`:

```bash
# Backend API URL
VITE_BACKEND_URL=https://your-backend.miniapps.farcaster.xyz

# Supabase Configuration (if still needed for other features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Update HTML

Add the preconnect hint to your `index.html`:

```html
<head>
  <!-- ... other head content ... -->
  <link rel="preconnect" href="https://auth.farcaster.xyz" />
</head>
```

### 3. Install Dependencies

```bash
cd frontend
npm install @farcaster/frame-sdk
```

## How It Works

### 1. Authentication Flow

1. User opens the app
2. Frame SDK automatically handles Quick Auth
3. Backend validates JWT token
4. User profile is created/retrieved from database
5. RLS policies ensure data isolation

### 2. User Management

- **Automatic Profile Creation**: When a user first authenticates, a profile is automatically created in the `profiles` table
- **FID Mapping**: The user's Farcaster ID (FID) is stored and used for all operations
- **Primary Address**: The user's primary Ethereum address is fetched and stored

### 3. Data Security

- **RLS Policies**: All database operations are protected by Row Level Security
- **User Context**: Each request sets the user context for RLS evaluation
- **Token Validation**: JWT tokens are validated on every request

## API Endpoints

### Authentication Required

All endpoints require a valid Quick Auth token in the `Authorization` header:

```
Authorization: Bearer <quick-auth-token>
```

### Available Endpoints

- `GET /me` - Get current user information
- `GET /profile` - Get user profile with games and badges
- `POST /games/save` - Save game result
- `GET /games/history` - Get user's game history
- `GET /badges` - Get user's badges

### Example Usage

```typescript
import { sdk } from "@farcaster/frame-sdk";

// Get current user
const user = await sdk.quickAuth.fetch(`${BACKEND_URL}/me`);

// Save game result
const result = await sdk.quickAuth.fetch(`${BACKEND_URL}/games/save`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 1, score: 3500 })
});
```

## Security Considerations

### 1. RLS Policies

- Users can only access their own data
- No user can access another user's game results or badges
- Public data (games, questions, badges) is read-only

### 2. Token Security

- JWT tokens are validated on every request
- Tokens are domain-specific
- Invalid tokens are immediately rejected

### 3. User Isolation

- Each user's data is completely isolated
- Profile creation is automatic and secure
- No cross-user data access is possible

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend CORS configuration includes your frontend domain
2. **RLS Policy Errors**: Verify that the `set_user_context` function is properly created
3. **Token Validation Errors**: Check that your `HOSTNAME` matches your deployment domain
4. **Profile Creation Errors**: Ensure your Supabase service role key has proper permissions

### Debug Steps

1. Check browser console for authentication errors
2. Verify backend logs for token validation issues
3. Test RLS policies directly in Supabase dashboard
4. Ensure all environment variables are properly set

## Production Deployment

### 1. Backend (Cloudflare Workers)

```bash
# Set production environment variables
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Deploy
npm run deploy
```

### 2. Frontend

Update your frontend environment variables with production URLs:

```bash
VITE_BACKEND_URL=https://your-production-backend.workers.dev
```

### 3. Domain Configuration

Update your `HOSTNAME` in the backend configuration to match your production domain.

## Testing

### 1. Local Development

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### 2. Authentication Test

1. Open the app in a Farcaster-enabled browser
2. Verify that authentication happens automatically
3. Check that user profile is created in database
4. Test saving a game result
5. Verify RLS policies are working

### 3. Security Test

1. Try to access another user's data (should fail)
2. Test with invalid tokens (should fail)
3. Verify that public data is accessible
4. Check that user-specific data is isolated 