# FlowSync - Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be 20+
docker --version  # Or have PostgreSQL + Redis installed
```

### Option 1: With Docker (Recommended)

```bash
# 1. Clone and navigate
cd FlowSync

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 4. Run setup script
./setup-phase1.sh

# 5. Start backend (in one terminal)
cd backend && npm run dev

# 6. Start frontend (in another terminal)
cd frontend && npm run dev

# 7. Open browser
open http://localhost:3000
```

### Option 2: Without Docker

See [SETUP_MANUAL.md](./SETUP_MANUAL.md) for detailed manual setup.

## What You Get

- ✅ Backend API at http://localhost:3001
- ✅ Frontend at http://localhost:3000
- ✅ PostgreSQL database running
- ✅ Redis caching running
- ✅ All 30+ API endpoints ready

## Quick Test

```bash
# Test backend is running
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"development"}
```

## Environment Variables

The app works out of the box with defaults. Optional enhancements:

**backend/.env:**
```bash
# Required (already set with defaults)
DATABASE_URL=postgresql://postgres:password@localhost:5432/flowsync
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional - for full features
OPENAI_API_KEY=sk-...          # AI mood analysis & coaching
SPOTIFY_CLIENT_ID=...          # Music recommendations
SPOTIFY_CLIENT_SECRET=...      # Music recommendations
SUNO_API_KEY=...              # Soundscape generation
```

**Note:** Without API keys, the app uses intelligent fallbacks.

## Available Endpoints

Once running, you can test these endpoints:

### Authentication
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Mood Analysis (requires token from login)
```bash
# Analyze mood
curl -X POST http://localhost:3001/api/mood/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"I feel really energized today!"}'
```

### Create Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Complete project documentation","difficulty":"medium","estimated_duration":60}'
```

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port
lsof -i :3000  # or :3001
kill -9 <PID>
```

### "Cannot connect to database"
```bash
# Check Docker containers
docker ps

# Restart containers
docker compose -f docker/docker-compose.yml restart postgres redis
```

### "Module not found"
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### "Database schema errors"
```bash
# Re-run migrations
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d flowsync < database/schema.sql
```

## What's Next?

See [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) for:
- Current implementation status
- Next features to build
- Phase 2 roadmap

## Development Workflow

```bash
# Backend development
cd backend
npm run dev          # Start with auto-reload
npm run build        # Build for production
npm test            # Run tests

# Frontend development
cd frontend
npm run dev         # Start with hot-reload
npm run build       # Build for production
npm run lint        # Check code quality
```

## Stopping Services

```bash
# Stop all Docker containers
docker compose -f docker/docker-compose.yml down

# Stop but keep data
docker compose -f docker/docker-compose.yml stop
```

## Need Help?

- 📚 [BUILD_GUIDE.md](./BUILD_GUIDE.md) - Complete build documentation
- 🔧 [SETUP_MANUAL.md](./SETUP_MANUAL.md) - Manual setup without Docker
- 📊 [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) - Current status
- 🗄️ [database/schema.sql](./database/schema.sql) - Database structure

## Tips

1. **First time?** Use Docker option - it's easiest
2. **No Docker?** Follow SETUP_MANUAL.md carefully
3. **Adding features?** Check BUILD_GUIDE.md Phase 2 & 3
4. **Production?** See BUILD_GUIDE.md Phase 4

---

**Happy coding! 🚀**
