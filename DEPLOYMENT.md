# FlowSync Deployment Guide

This guide covers deploying FlowSync to production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Database Setup](#database-setup)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ available
- **Node.js**: v20.x LTS
- **PostgreSQL**: v15+
- **Redis**: v7+
- **Docker**: v24+ (for containerized deployment)
- **Nginx**: v1.20+ (for reverse proxy)

### Required Accounts

- OpenAI API account (for AI features)
- Domain name with DNS access
- SSL certificate (Let's Encrypt recommended)
- (Optional) Sentry account for error tracking
- (Optional) Cloud storage (AWS S3, etc.)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/flowsync.git
cd flowsync
```

### 2. Configure Environment Variables

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required Variables**:

```env
# Core
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/flowsync
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=<generate-with-openssl-rand-base64-64>
SESSION_SECRET=<generate-with-openssl-rand-base64-64>
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>

# Services
OPENAI_API_KEY=sk-your-key-here
FRONTEND_URL=https://flowsync.app
```

### 3. Generate Secrets

```bash
# JWT Secret
openssl rand -base64 64

# Session Secret
openssl rand -base64 64

# Encryption Key
openssl rand -hex 32
```

---

## Docker Deployment

### Quick Start

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Detailed Steps

#### 1. Prepare Environment

```bash
# Create environment file
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

#### 2. Build Docker Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker build -t flowsync-backend:latest -f backend/Dockerfile backend/
docker build -t flowsync-frontend:latest -f frontend/Dockerfile frontend/
```

#### 3. Initialize Database

```bash
# Start PostgreSQL only
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Apply database schema
docker-compose -f docker-compose.prod.yml exec postgres psql -U flowsync -d flowsync -f /migrations/schema.sql

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend node /app/database/migrate.js up
```

#### 4. Start All Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Verify all containers are running
docker-compose -f docker-compose.prod.yml ps
```

#### 5. Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# View logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

---

## Manual Deployment

### 1. Install Dependencies

```bash
# System packages
sudo apt update
sudo apt install -y postgresql-15 redis-server nginx certbot python3-certbot-nginx

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 for process management
sudo npm install -g pm2
```

### 2. Setup Database

```bash
# Create PostgreSQL user and database
sudo -u postgres psql << EOF
CREATE USER flowsync WITH PASSWORD 'your_secure_password';
CREATE DATABASE flowsync OWNER flowsync;
GRANT ALL PRIVILEGES ON DATABASE flowsync TO flowsync;
EOF

# Apply schema
psql -U flowsync -d flowsync -f database/schema.sql

# Run migrations
node database/migrate.js up
```

### 3. Setup Redis

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Set password
# requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 4. Build Backend

```bash
cd backend

# Install dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name flowsync-backend
pm2 save
pm2 startup
```

### 5. Build Frontend

```bash
cd frontend

# Install dependencies
npm ci --only=production

# Build Next.js
npm run build

# Start with PM2
pm2 start npm --name flowsync-frontend -- start
pm2 save
```

---

## Database Setup

### Initial Schema

```bash
# Apply schema.sql
psql -U flowsync -d flowsync < database/schema.sql
```

### Migrations

```bash
# Check migration status
node database/migrate.js status

# Apply pending migrations
node database/migrate.js up

# Rollback last migration (if needed)
node database/migrate.js down
```

### Create New Migration

```bash
# Generate migration file
node database/migrate.js create add_new_feature

# Edit the generated file
nano database/migrations/TIMESTAMP_add_new_feature.sql
```

---

## Nginx Configuration

### 1. Copy Configuration

```bash
# Copy example config
sudo cp nginx.conf.example /etc/nginx/sites-available/flowsync

# Create symlink
sudo ln -s /etc/nginx/sites-available/flowsync /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 2. Update Server Name

```bash
sudo nano /etc/nginx/sites-available/flowsync

# Change:
server_name your-domain.com www.your-domain.com;
```

---

## SSL/TLS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d flowsync.app -d www.flowsync.app

# Test auto-renewal
sudo certbot renew --dry-run

# Auto-renewal is configured via cron
```

### Manual Certificate

```bash
# Copy certificate files
sudo cp fullchain.pem /etc/nginx/ssl/
sudo cp privkey.pem /etc/nginx/ssl/

# Set permissions
sudo chmod 600 /etc/nginx/ssl/privkey.pem

# Update Nginx config
sudo nano /etc/nginx/sites-available/flowsync

# Update SSL paths:
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

---

## Monitoring & Logging

### Application Logs

```bash
# Backend logs (PM2)
pm2 logs flowsync-backend

# Frontend logs (PM2)
pm2 logs flowsync-frontend

# Combined logs
pm2 logs

# Save logs to file
pm2 logs --out /var/log/flowsync/pm2.log
```

### Docker Logs

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs backend

# Save logs
docker-compose -f docker-compose.prod.yml logs > /var/log/flowsync/docker.log
```

### Health Checks

```bash
# Backend health
curl https://flowsync.app/api/health

# Readiness check
curl https://flowsync.app/api/health/ready

# Metrics
curl https://flowsync.app/api/metrics
```

### Prometheus & Grafana (Optional)

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
```

---

## Backup & Recovery

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-flowsync-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/flowsync
mkdir -p $BACKUP_DIR

pg_dump -U flowsync flowsync | gzip > $BACKUP_DIR/flowsync_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "flowsync_*.sql.gz" -mtime +7 -delete

echo "Backup completed: flowsync_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-flowsync-db.sh
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-flowsync-db.sh
```

### Restore from Backup

```bash
# Stop services
pm2 stop all
# or
docker-compose -f docker-compose.prod.yml stop

# Restore database
gunzip < /var/backups/flowsync/flowsync_20251115_020000.sql.gz | psql -U flowsync -d flowsync

# Restart services
pm2 start all
# or
docker-compose -f docker-compose.prod.yml start
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs flowsync-backend --lines 100

# Common issues:
# 1. Database connection
psql -U flowsync -d flowsync -c "SELECT 1"

# 2. Redis connection
redis-cli ping

# 3. Environment variables
cat .env.production | grep -v '#'

# 4. Port conflicts
sudo lsof -i :3001
```

### Frontend Build Fails

```bash
# Clear cache
cd frontend
rm -rf .next node_modules
npm install
npm run build

# Check Node version
node --version  # Should be v20.x
```

### Database Migration Errors

```bash
# Check migration status
node database/migrate.js status

# Rollback and retry
node database/migrate.js down
node database/migrate.js up

# Manual migration
psql -U flowsync -d flowsync < database/migrations/001_initial_schema.sql
```

### High Memory Usage

```bash
# Check process memory
pm2 monit

# Restart services
pm2 restart all

# Docker memory limits
docker stats

# Adjust limits in docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### SSL Certificate Issues

```bash
# Test certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t

# Verify SSL
openssl s_client -connect flowsync.app:443
```

---

## Performance Optimization

### 1. Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_energy_logs_user_id ON energy_logs(user_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
```

### 2. Redis Caching

```typescript
// Cache frequently accessed data
await redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));
```

### 3. CDN Setup

- Use Cloudflare or similar for static assets
- Cache `/_next/static/*` files
- Enable Brotli/Gzip compression

### 4. Database Connection Pooling

```env
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] SSL/TLS configured
- [ ] Firewall rules configured
- [ ] Database password rotated
- [ ] JWT secrets generated
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Nginx security headers set
- [ ] Fail2ban configured (optional)
- [ ] Regular security updates scheduled

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://flowsync.app/api/health

# Test authentication
curl -X POST https://flowsync.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

### 2. Monitor Performance

- Check response times
- Monitor error rates
- Verify database connections
- Check Redis memory usage

### 3. Set Up Alerts

- Configure Sentry notifications
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure PM2 notifications

---

## Support & Resources

- **Documentation**: https://docs.flowsync.app
- **GitHub**: https://github.com/yourusername/flowsync
- **Issues**: https://github.com/yourusername/flowsync/issues

---

**Last Updated**: November 15, 2025
