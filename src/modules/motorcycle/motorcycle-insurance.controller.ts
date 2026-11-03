import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MotorcycleInsuranceService } from './motorcycle-insurance.service.js';
import { CreateMotorcycleInsuranceDto } from './dto/create-motorcycle-insurance.dto.js';
import { MotorcycleFeeResponseDto } from './dto/motorcycle-fee-response.dto.js';

@ApiTags('Bảo hiểm TNDS Xe máy')
@Controller('motorcycle-insurance')
export class MotorcycleInsuranceController {
  constructor(private readonly motorcycleInsuranceService: MotorcycleInsuranceService) {}

  @Post('calculate-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API tính phí bảo hiểm TNDS xe máy (MIC)',
    description: 'Gọi trực tiếp tới MIC core (/api/e/2bl/v1/phi_2bl) để tính phí bắt buộc và tự nguyện lái phụ xe.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tính phí thành công',
    type: MotorcycleFeeResponseDto,
  })
  async calculateFee(@Body() dto: CreateMotorcycleInsuranceDto): Promise<MotorcycleFeeResponseDto> {
    return await this.motorcycleInsuranceService.calculateFee(dto);
  }
}