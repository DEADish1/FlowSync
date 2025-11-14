# Phase 1 Setup Guide - Without Docker

If Docker is not available in your environment, you can set up FlowSync manually.

## Prerequisites

1. **Node.js 20+**
   - Check: `node --version`
   - Install: https://nodejs.org/

2. **PostgreSQL 15+**
   - Check: `psql --version`
   - Install: https://www.postgresql.org/download/

3. **Redis 7+**
   - Check: `redis-cli --version`
   - Install: https://redis.io/download

## Setup Steps

### 1. Install Dependencies ✅

Already completed:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Create Environment Files ✅

Already completed:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 3. Start PostgreSQL

**Option A: If PostgreSQL is already installed**
```bash
# Start PostgreSQL service
# macOS (with Homebrew):
brew services start postgresql@15

# Linux (systemd):
sudo systemctl start postgresql

# Windows:
# Start via Services app or pg_ctl
```

**Option B: Using existing PostgreSQL instance**
Update `backend/.env` with your connection string:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/flowsync
```

### 4. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE flowsync;
\q
```

### 5. Run Database Migrations

```bash
# From the FlowSync root directory
psql -U postgres -d flowsync < database/schema.sql
```

You should see output confirming tables were created.

### 6. Start Redis

```bash
# macOS (with Homebrew):
brew services start redis

# Linux (systemd):
sudo systemctl start redis

# Or run directly:
redis-server
```

### 7. Verify Database Connection

```bash
cd backend

# Create a test script
cat > test-db.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
  pool.end();
});
EOF

node test-db.js
```

### 8. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 FlowSync server running on port 3001
📊 Environment: development
🔗 API: http://localhost:3001
```

### 9. Start Frontend Server

In a new terminal:
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

### 10. Test the Application

**Backend Health Check:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-14T...",
  "environment": "development"
}
```

**Frontend:**
Open http://localhost:3000 in your browser

## Troubleshooting

### Database Connection Errors

If you see `ECONNREFUSED` or connection errors:

1. Check PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Verify credentials in `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/flowsync
   ```

3. Check PostgreSQL allows local connections:
   ```bash
   # Find pg_hba.conf location
   psql -U postgres -c "SHOW hba_file"

   # Ensure it has:
   # local   all   all   trust
   # host    all   all   127.0.0.1/32   trust
   ```

### Redis Connection Errors

1. Check Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Verify `backend/.env` has:
   ```
   REDIS_URL=redis://localhost:6379
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different ports in .env files
```

### Missing Dependencies

If you see module not found errors:

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## Optional: Adding API Keys

Edit `backend/.env` to add optional API keys:

```bash
# For AI features (mood analysis, coaching)
OPENAI_API_KEY=sk-...

# For music recommendations
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# For soundscape generation
SUNO_API_KEY=...
```

Note: The app works without these keys - it will use fallback logic.

## Next Steps

Once everything is running:

1. ✅ Backend running at http://localhost:3001
2. ✅ Frontend running at http://localhost:3000
3. ✅ Database and Redis connected

You're ready for Phase 2: Building the UI components!
