import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RedisModule } from './integrations/redis/redis.module.js';
import { MicModule } from './integrations/mic/mic.module.js';
import { MotorcycleInsuranceModule } from './modules/motorcycle/motorcycle-insurance.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    MicModule,
    MotorcycleInsuranceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
