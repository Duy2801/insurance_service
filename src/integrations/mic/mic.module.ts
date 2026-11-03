import { Module } from '@nestjs/common';
import { MicAuthService } from './mic-auth.service.js';
import { MicHttpService } from './mic-http.service.js';
import { MicAuthController } from './mic-auth.controller.js';

@Module({
  controllers: [MicAuthController],
  providers: [MicAuthService, MicHttpService],
  exports: [MicAuthService, MicHttpService],
})
export class MicModule {}
