#!/bin/bash

echo "🧪 Setting up Authentication Testing Environment"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📁 Setting up backend environment..."

# Backend setup
if [ -d "backend" ]; then
    cd backend
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "⚙️  Creating backend .env file..."
        cp env.example .env
        echo "✅ Backend .env created. Please edit it with your actual values:"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo "   - HOSTNAME"
    else
        echo "✅ Backend .env already exists"
    fi
    
    cd ..
else
    echo "❌ Backend directory not found"
fi

echo ""
echo "📁 Setting up frontend environment..."

# Frontend setup
if [ -d "frontend" ]; then
    cd frontend
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "⚙️  Creating frontend .env file..."
        cp env.example .env
        echo "✅ Frontend .env created. Please edit it with your actual values:"
        echo "   - VITE_BACKEND_URL"
        echo "   - VITE_SUPABASE_URL"
        echo "   - VITE_SUPABASE_ANON_KEY"
    else
        echo "✅ Frontend .env already exists"
    fi
    
    cd ..
else
    echo "❌ Frontend directory not found"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Edit backend/.env with your Supabase credentials"
echo "2. Edit frontend/.env with your backend URL"
echo "3. Apply database migrations in Supabase:"
echo "   - Run supabase/migrations/001_auth_policies.sql"
echo "   - Run supabase/migrations/002_user_context_function.sql"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm run dev"
echo "6. Open the app in a Farcaster-enabled browser"
echo "7. Check the AuthDebugger component (blue box in bottom-right)"
echo ""
echo "📖 For detailed testing instructions, see TESTING_GUIDE.md"
echo "📖 For setup instructions, see AUTH_SETUP.md" 