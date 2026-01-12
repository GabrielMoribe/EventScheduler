import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  rabbitmqConfig,
  jwtConfig,
} from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, redisConfig, rabbitmqConfig, jwtConfig],
    }),
  ],
})
export class AppConfigModule {}
