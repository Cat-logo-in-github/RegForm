# 🚀 Quick Reference - Local Development

## One-Time Setup (First Time Only)

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### Step 2: Configure Google OAuth
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find Client ID: `124602298609...`
3. Add to **Authorized JavaScript origins**: `http://localhost:3000`
4. Add to **Authorized redirect URIs**: `http://localhost:3000`
5. Save

### Step 3: Run Setup
```bash
npm run local:setup
```

---

## Daily Development Commands

```bash
# Start MongoDB (run once per day)
npm run db:start

# Start development server (auto-reloads on changes)
npm run dev

# Visit: http://localhost:3000
```

---

## Before Deploying to Server

```bash
# Test production build locally
npm run build

# If build succeeds, deploy to server
git push origin main
```

---

## Useful Commands

```bash
# MongoDB
npm run db:start      # Start MongoDB
npm run db:stop       # Stop MongoDB
npm run db:logs       # View MongoDB logs
npm run db:reset      # Reset database (fresh start)

# Development
npm run dev           # Start dev server (with hot reload)
npm run build         # Build for production
npm run test:build    # Build and test locally before deploy
npm run lint          # Check for code issues

# Clean cache (if things seem broken)
rm -rf .next && npm run dev
```

---

## Troubleshooting

### "MongoDB connection error"
```bash
npm run db:start
```

### "Google OAuth error"
Add `http://localhost:3000` to Google Cloud Console

### "Changes not showing"
```bash
rm -rf .next
npm run dev
```

### Check what's running
```bash
docker ps                    # Check MongoDB
lsof -i :3000               # Check if port 3000 is in use
```

---

## Answer to Your Questions

### ❓ How do I sign-in with Gmail on local?
**Answer:** 
1. Yes, it depends on MongoDB (stores user data)
2. Start MongoDB: `npm run db:start`
3. Add `http://localhost:3000` to Google OAuth settings
4. Run: `npm run dev`
5. Sign in at: http://localhost:3000

### ❓ How to test without deploying every time?
**Answer:**
```bash
# Terminal 1: Start MongoDB
npm run db:start

# Terminal 2: Start dev server
npm run dev

# Make changes → Auto-reloads → Test immediately!
# No need to deploy until you're satisfied
```

---

## Development Workflow

1. **Morning**: `npm run db:start` (once)
2. **Work**: `npm run dev` (auto-reloads)
3. **Test**: Visit http://localhost:3000
4. **Before Commit**: `npm run build` (check for errors)
5. **Deploy**: Only after local testing passes!

---

## File Structure
```
.env.local        → Local development (auto-loaded)
.env.production   → Production server (used on deployment)
```

---

## MongoDB Access

### Command Line:
```bash
docker exec -it regform-mongodb-dev mongosh production
```

### GUI Tools:
- **MongoDB Compass**: https://www.mongodb.com/try/download/compass
- **VS Code Extension**: Search "MongoDB for VS Code"
- Connect to: `mongodb://localhost:27017`

---

Need help? Read: `LOCAL_DEVELOPMENT_GUIDE.md`
