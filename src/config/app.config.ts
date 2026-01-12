import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port:3000,
}));

export const databaseConfig = registerAs('database', () => ({
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: 5433,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI,
  },
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port:6379,
  password: process.env.REDIS_PASSWORD,
}));

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
