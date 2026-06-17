#!/bin/bash
# MERN Gym Management System - Quick Start Commands

echo "🚀 Starting MERN Gym Management System..."

# ============================================
# STEP 1: Seed Test Database
# ============================================
echo ""
echo "📊 STEP 1: Creating test accounts..."
echo "Command: node Backend/seed.js"
echo ""
echo "This will create:"
echo "  • Admin user: admin@test.com / admin123"
echo "  • Trainer user: trainer@test.com / trainer123"
echo "  • Member user: member@test.com / member123"
echo ""
echo "Run this command:"
echo "  cd Backend && node seed.js"
echo ""

# ============================================
# STEP 2: Start Backend Server
# ============================================
echo "🔧 STEP 2: Starting Backend Server..."
echo "Command: npm start (from Backend directory)"
echo ""
echo "The server will start on: http://localhost:5000"
echo "API endpoints will be available at: http://localhost:5000/api/*"
echo ""
echo "Run this command (in a terminal at Backend/):"
echo "  npm start"
echo ""

# ============================================
# STEP 3: Start Frontend Server
# ============================================
echo "⚛️  STEP 3: Starting Frontend Server..."
echo "Command: npm start (from Frontend directory, in NEW TERMINAL)"
echo ""
echo "The app will open at: http://localhost:3000"
echo ""
echo "Run this command (in a NEW terminal at Frontend/):"
echo "  npm start"
echo ""

# ============================================
# STEP 4: Test Login
# ============================================
echo "🔐 STEP 4: Test the Application"
echo ""
echo "Navigate to: http://localhost:3000"
echo ""
echo "Test Accounts:"
echo "┌──────────────────────────────────────────┐"
echo "│ ADMIN                                    │"
echo "│ Email: admin@test.com                    │"
echo "│ Password: admin123                       │"
echo "│ Role: System Administrator               │"
echo "├──────────────────────────────────────────┤"
echo "│ TRAINER                                  │"
echo "│ Email: trainer@test.com                  │"
echo "│ Password: trainer123                     │"
echo "│ Role: Fitness Trainer                    │"
echo "├──────────────────────────────────────────┤"
echo "│ MEMBER                                   │"
echo "│ Email: member@test.com                   │"
echo "│ Password: member123                      │"
echo "│ Role: Gym Member                         │"
echo "└──────────────────────────────────────────┘"
echo ""

# ============================================
# STEP 5: Dashboard URLs
# ============================================
echo "📍 Dashboard URLs"
echo ""
echo "Home Page:          http://localhost:3000"
echo "Admin Dashboard:    http://localhost:3000/admin"
echo "Trainer Dashboard:  http://localhost:3000/trainer"
echo "Member Dashboard:   http://localhost:3000/member"
echo ""

# ============================================
# TROUBLESHOOTING
# ============================================
echo "🆘 Troubleshooting"
echo ""
echo "❌ \"Cannot find module 'bcryptjs'\"?"
echo "   Run: cd Backend && npm install bcryptjs"
echo ""
echo "❌ \"Failed to connect to MongoDB\"?"
echo "   Make sure MongoDB is running:"
echo "   - Windows: Use MongoDB Community Server"
echo "   - Or use MongoDB Atlas (cloud): Update MONGODB_URI in Backend/.env"
echo ""
echo "❌ Getting port errors?"
echo "   Kill existing processes:"
echo "   - Windows: netstat -ano | findstr :5000 (then taskkill /PID <pid> /F)"
echo ""
echo "❌ Modules not found?"
echo "   Reinstall dependencies:"
echo "   - cd Backend && npm install"
echo "   - cd Frontend && npm install"
echo ""
echo "❌ Cross-origin (CORS) errors?"
echo "   Backend CORS is already configured for localhost:3000"
echo "   Check that Backend is running on port 5000"
echo ""

# ============================================
# COMMAND SUMMARY
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                     QUICK START SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Terminal 1 - MongoDB (if running locally):"
echo "  $ mongod"
echo ""
echo "Terminal 2 - Backend Server:"
echo "  $ cd Backend"
echo "  $ node seed.js          # Create test data"
echo "  $ npm start             # Start server"
echo ""
echo "Terminal 3 - Frontend Server:"
echo "  $ cd Frontend"
echo "  $ npm start             # Start React app"
echo ""
echo "Browser:"
echo "  → http://localhost:3000"
echo "  → Login with: admin@test.com / admin123"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ All systems ready! Follow the steps above to get started."
echo ""