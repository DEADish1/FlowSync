#!/bin/bash

echo "🚀 FlowSync - Phase 1 Setup Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in a Docker environment
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Please install Docker to run the database services.${NC}"
    echo ""
    echo "Installation guides:"
    echo "  - macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  - Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "  - Linux: https://docs.docker.com/engine/install/"
    echo ""
    echo "Alternatively, you can install PostgreSQL and Redis manually:"
    echo "  - PostgreSQL 15: https://www.postgresql.org/download/"
    echo "  - Redis 7: https://redis.io/download"
    echo ""
    exit 1
fi

echo "✅ Docker found"

# Start PostgreSQL and Redis
echo ""
echo "📦 Starting PostgreSQL and Redis containers..."
docker compose -f docker/docker-compose.yml up -d postgres redis

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is accessible
until docker compose -f docker/docker-compose.yml exec -T postgres pg_isready -U postgres &> /dev/null; do
  echo "   PostgreSQL is still starting up..."
  sleep 2
done

echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
docker compose -f docker/docker-compose.yml exec -T postgres psql -U postgres -d flowsync < database/schema.sql

echo -e "${GREEN}✅ Database schema created${NC}"

# Check Redis
echo ""
echo "🔍 Checking Redis..."
if docker compose -f docker/docker-compose.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Redis check failed, but container may still be starting...${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Phase 1 Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review your .env files and add API keys if you have them:"
echo "     - backend/.env (OpenAI, Spotify, etc.)"
echo "     - frontend/.env.local"
echo ""
echo "  2. Start the backend server:"
echo "     cd backend && npm run dev"
echo ""
echo "  3. In a new terminal, start the frontend:"
echo "     cd frontend && npm run dev"
echo ""
echo "  4. Open http://localhost:3000 in your browser"
echo ""
echo "Database Connection Info:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: flowsync"
echo "  User: postgres"
echo "  Password: password"
echo ""
echo "Redis Connection Info:"
echo "  Host: localhost"
echo "  Port: 6379"
echo ""
