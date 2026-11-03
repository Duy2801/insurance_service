import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MicAuthService, MicAuthCredentials } from './mic-auth.service.js';

@ApiTags('MIC Authentication (Xác thực MIC)')
@Controller('mic/auth')
export class MicAuthController {
  constructor(private readonly micAuthService: MicAuthService) { }

  @Get('get-token')
  @ApiOperation({
    summary: 'Lấy Access Token xác thực MIC',
    description: 'Lấy token hiện tại từ Redis Cache (nếu còn hạn), hoặc tự động gọi MIC để lấy token mới nếu chưa có hoặc hết hạn.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy token thành công',
    schema: {
      example: {
        code: '00',
        message: 'Thành Công',
        access_token: 'eyJhbGciOi...',
        expires_in: 3600,
        token_type: 'Bearer',
        merchant: 'Merchant',
      },
    },
  })
  async getToken(): Promise<MicAuthCredentials> {
    return await this.micAuthService.getAuthCredentials();
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Làm mới Token (Bỏ qua Redis Cache)',
    description: 'Bỏ qua cache hiện tại, gọi thẳng tới MIC để cấp token mới và cập nhật lại vào Redis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cấp mới token thành công',
  })
  async refreshToken(): Promise<MicAuthCredentials> {
    return await this.micAuthService.fetchNewToken();
  }
}
