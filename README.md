# FlowSync - Adaptive Life-Timing AI

FlowSync doesn't just manage time — it manages your energy.

## 🚀 Features

- **🔮 Mood-Aware Scheduling**: AI adapts your schedule based on how you're feeling
- **🎧 Sound Environment Sync**: Automatic music and soundscape recommendations
- **🚦 Custom Flow Blocks**: Personalized time blocks for different work modes
- **🧠 Daily Energy Map**: Visual patterns of your energy throughout the day
- **⏱️ AI Productivity Coach**: Contextual advice based on your habits

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Redis
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Music**: Spotify API, Suno AI

## 📚 Getting Started

See [BUILD_GUIDE.md](./docs/guides/BUILD_GUIDE.md) for complete setup and implementation instructions.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FlowSync
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose -f docker/docker-compose.yml up
   ```

4. **Or run locally**
   ```bash
   # Install dependencies
   cd frontend && npm install
   cd ../backend && npm install

   # Start database
   docker-compose -f docker/docker-compose.yml up postgres redis

   # Run migrations
   cd backend && npm run migrate

   # Start backend
   npm run dev

   # Start frontend (in new terminal)
   cd frontend && npm run dev
   ```

5. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📖 Documentation

- [Build Guide](./docs/guides/BUILD_GUIDE.md) - Complete implementation guide
- [API Documentation](./docs/api/API_DOCUMENTATION.md) - API endpoints reference
- [Database Schema](./database/schema.sql) - Database structure

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

See [BUILD_GUIDE.md](./docs/guides/BUILD_GUIDE.md#-phase-4-polish--deploy) for deployment instructions.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the build guide first to understand the architecture.
