import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MicHttpService } from '../../integrations/mic/mic-http.service.js';
import { CreateMotorcycleInsuranceDto } from './dto/create-motorcycle-insurance.dto.js';
import { MotorcycleFeeResponseDto } from './dto/motorcycle-fee-response.dto.js';

@Injectable()
export class MotorcycleInsuranceService {
  private readonly logger = new Logger(MotorcycleInsuranceService.name);

  constructor(private readonly micHttpService: MicHttpService) {}

  /**
   * Tính phí bảo hiểm TNDS xe máy qua API MIC core: POST /api/e/2bl/v1/phi_2bl
   */
  async calculateFee(dto: CreateMotorcycleInsuranceDto): Promise<MotorcycleFeeResponseDto> {
    const payload = {
      nv: dto.nv || '2BL',
      kieu_hd: dto.kieu_hd || 'G',
      ngay_hl: dto.ngay_hl,
      ngay_kt: dto.ngay_kt,
      loai_xe: dto.loai_xe,
      tp: dto.tp || '0',
      so_cn: dto.so_cn ?? 2,
    };

    this.logger.log(`Đang tính phí bảo hiểm xe máy cho loại xe: ${dto.loai_xe}, mức tự nguyện: ${dto.tp}`);

    try {
      const response = await this.micHttpService.post<MotorcycleFeeResponseDto>(
        '/api/e/2bl/v1/phi_2bl',
        payload,
      );

      const data = response.data;

      if (data.code !== '00') {
        throw new HttpException(
          `MIC từ chối tính phí: ${data.message || 'Lỗi không xác định'}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Tính phí thành công: Tổng thanh toán = ${data.data?.ttoan} VND`);
      return data;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMsg = error.response?.data?.message || error.message;
      this.logger.error(`Lỗi khi gọi API tính phí MIC: ${errorMsg}`);
      throw new HttpException(
        `Lỗi hệ thống tính phí bảo hiểm: ${errorMsg}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
