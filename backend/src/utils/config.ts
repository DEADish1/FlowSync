import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/flowsync',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },

  music: {
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    sunoApiKey: process.env.SUNO_API_KEY,
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

// Validation
export function validateConfig() {
  const isProduction = config.nodeEnv === 'production';

  // Required in all environments
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  // Required only in production
  const productionRequired = [
    'REDIS_URL',
    'OPENAI_API_KEY',
    'FRONTEND_URL',
  ];

  // Check required variables
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    if (isProduction) {
      throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    } else {
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      console.warn('⚠️  Using defaults for development. DO NOT use in production!');
    }
  }

  // Check production-only required variables
  if (isProduction) {
    const missingProd = productionRequired.filter(key => !process.env[key]);
    if (missingProd.length > 0) {
      throw new Error(`❌ Missing production environment variables: ${missingProd.join(', ')}`);
    }
  }

  // Validate specific values
  if (isProduction) {
    if (config.jwt.secret === 'dev-secret-change-in-production') {
      throw new Error('❌ JWT_SECRET must be changed in production!');
    }

    if (config.jwt.secret.length < 32) {
      throw new Error('❌ JWT_SECRET must be at least 32 characters in production!');
    }

    if (!config.database.url.includes('postgresql://')) {
      console.warn('⚠️  DATABASE_URL should use postgresql:// protocol');
    }

    if (config.frontend.url.includes('localhost')) {
      console.warn('⚠️  FRONTEND_URL should not be localhost in production');
    }
  }

  console.log('✅ Configuration validated successfully');
}
