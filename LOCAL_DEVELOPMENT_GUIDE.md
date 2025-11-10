# Local Development Guide for RegForm

## Prerequisites
- Node.js installed
- Docker Desktop installed (for MongoDB)
- Google Chrome or similar browser

---

## Quick Start (5 Minutes Setup)

### Step 1: Install MongoDB with Docker

```bash
# Start MongoDB container
docker compose -f docker-compose.dev.yml up -d

# Verify MongoDB is running
docker ps | grep regform-mongodb
```

**Alternative without Docker:**
```bash
# Install MongoDB using Homebrew (macOS)
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

### Step 2: Configure Google OAuth for Localhost

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project (or the one with Client ID: `124602298609`)
3. Edit the OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `http://localhost:3000`
5. Add to **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/google`
6. Save changes

### Step 3: Start Development Server

```bash
# Install dependencies (if needed)
npm install

# Start the dev server
npm run dev
```

Visit: http://localhost:3000

---

## Testing Workflow (Without Deploying)

### Method 1: Local Development Server (Fastest)
```bash
# Terminal 1: MongoDB
docker compose -f docker-compose.dev.yml up

# Terminal 2: Next.js Dev Server
npm run dev

# Make changes → Auto-reloads → Test immediately
```

### Method 2: Production Build Test (Before Deploy)
```bash
# Build production version locally
npm run build

# Start production server locally
npm start

# Test at http://localhost:7000 (or whatever PORT is in .env.local)
```

### Method 3: Test with Ngrok (Share with Team)
```bash
# Install ngrok
brew install ngrok

# Start your local server
npm run dev

# In another terminal, expose it
ngrok http 3000

# You'll get a public URL like: https://abc123.ngrok.io
# Update Google OAuth with this URL temporarily
```

---

## Environment Files Explained

### `.env.local` (Auto-loaded in development)
- Used when running `npm run dev`
- MongoDB: `mongodb://127.0.0.1:27017/production`
- URLs: `http://localhost:3000`

### `.env.production` (Used on server)
- Used when deployed
- MongoDB: Production server path
- URLs: `https://register.agneepath.co.in`

---

## Common Issues & Solutions

### Issue 1: "MongoDB connection error"
**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# If not running, start it
docker compose -f docker-compose.dev.yml up -d

# Check logs
docker logs regform-mongodb-dev
```

### Issue 2: "Google OAuth error 400: redirect_uri_mismatch"
**Solution:** Add `http://localhost:3000` to Google Cloud Console OAuth settings

### Issue 3: "POST /api/auth/google 500"
**Solution:** MongoDB is not running. See Issue 1.

### Issue 4: Changes not reflecting
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

---

## Recommended Development Workflow

### Daily Development:
1. **Start MongoDB** (once per day)
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```

3. **Make Changes** → Auto-reloads → Test immediately

4. **Before Committing:**
   ```bash
   # Test production build locally
   npm run build
   
   # Check for errors
   npm run lint
   ```

5. **Deploy to Server** (only after local testing passes)
   ```bash
   git push origin main
   # Then deploy on server
   ```

---

## MongoDB GUI Tools (Optional)

### MongoDB Compass (Official GUI)
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- Browse/edit data visually

### VS Code Extension
- Install: "MongoDB for VS Code"
- Connect to: `mongodb://localhost:27017`

---

## Stop/Clean Up

### Stop MongoDB (but keep data):
```bash
docker compose -f docker-compose.dev.yml stop
```

### Stop and remove everything:
```bash
docker compose -f docker-compose.dev.yml down
```

### Remove data (fresh start):
```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## Advanced: Database Seeding

### Copy Production Data to Local (Optional)

If you need production data for testing:

```bash
# On server: Export data
mongodump --uri="mongodb://127.0.0.1:27017/production" --out=/tmp/backup

# Copy to local
scp -r host@server:/tmp/backup ./backup

# On local: Import data
mongorestore --uri="mongodb://127.0.0.1:27017/production" ./backup/production
```

---

## Git Workflow for Testing

### Feature Branch Testing:
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally (no need to deploy!)

# Commit when satisfied
git add .
git commit -m "Add new feature"

# Merge to main only after local testing
git checkout main
git merge feature/new-feature
git push origin main
```

This way you **never deploy untested code** to the server! 🎉
