#!/bin/bash

# RegForm Local Development Setup Script
# This script helps you set up local development environment

echo "🚀 RegForm Local Development Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    echo ""
    echo "Alternative: Install MongoDB directly with Homebrew:"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community@6.0"
    echo "  brew services start mongodb-community@6.0"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if MongoDB container is running
if docker ps | grep -q regform-mongodb-dev; then
    echo "✅ MongoDB is already running"
else
    echo "📦 Starting MongoDB container..."
    docker compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB started successfully"
        echo "   Connection: mongodb://127.0.0.1:27017/production"
    else
        echo "❌ Failed to start MongoDB"
        exit 1
    fi
fi

echo ""
echo "🔍 Checking MongoDB connection..."
sleep 2

# Test MongoDB connection (requires mongosh or mongo client)
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.version()" --quiet mongodb://127.0.0.1:27017/production > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB is accessible"
    else
        echo "⚠️  MongoDB might still be starting up (this is normal)"
    fi
fi

echo ""
echo "📝 Environment Configuration:"
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    echo "   Using: $(grep MONGODB_URI .env.local | cut -d= -f2)"
else
    echo "⚠️  .env.local not found"
    echo "   Create one based on .env.production"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Configure Google OAuth (see LOCAL_DEVELOPMENT_GUIDE.md)"
echo "   2. Run: npm install"
echo "   3. Run: npm run dev"
echo "   4. Visit: http://localhost:3000"
echo ""
echo "📚 Full guide: LOCAL_DEVELOPMENT_GUIDE.md"
echo ""
echo "To stop MongoDB: docker compose -f docker-compose.dev.yml stop"
echo "To view MongoDB logs: docker logs regform-mongodb-dev"
echo ""
