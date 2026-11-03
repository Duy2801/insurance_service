import { Module } from '@nestjs/common';
import { MotorcycleInsuranceService } from './motorcycle-insurance.service.js';
import { MotorcycleInsuranceController } from './motorcycle-insurance.controller.js';
import { MicModule } from '../../integrations/mic/mic.module.js';

@Module({
  imports: [MicModule],
  controllers: [MotorcycleInsuranceController],
  providers: [MotorcycleInsuranceService],
  exports: [MotorcycleInsuranceService],
})
export class MotorcycleInsuranceModule {}