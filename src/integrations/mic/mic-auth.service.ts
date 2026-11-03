import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RedisService } from '../redis/redis.service.js';
import { MicTokenResponseDto } from './dto/mic-token-response.dto.js';

export interface MicAuthCredentials {
  code: string;
  message: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  merchant: string;
}

@Injectable()
export class MicAuthService {
  private readonly logger = new Logger(MicAuthService.name);
  private readonly cacheKey = 'mic:auth:credentials';

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy token xác thực MIC (ưu tiên từ Redis cache, tự động lấy mới nếu hết hạn)
   */
  async getAuthCredentials(): Promise<MicAuthCredentials> {
    // 1. Kiểm tra cache trong Redis
    const cached = await this.redisService.get(this.cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as MicAuthCredentials;
        if (parsed.access_token && parsed.merchant) {
          return parsed;
        }
      } catch {
        this.logger.warn('Không thể parse dữ liệu token từ cache, tiến hành lấy token mới...');
      }
    }

    // 2. Nếu chưa có hoặc cache hết hạn, gọi MIC để lấy token mới
    return await this.fetchNewToken();
  }

  /**
   * Gọi trực tiếp API MIC get-token để lấy token mới
   */
  async fetchNewToken(): Promise<MicAuthCredentials> {
    const baseUrl = this.configService.getOrThrow<string>('MIC_BASE_URL');
    const clientId = this.configService.getOrThrow<string>('MIC_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>('MIC_CLIENT_SECRET');
    const username = this.configService.getOrThrow<string>('MIC_USERNAME');
    const password = this.configService.getOrThrow<string>('MIC_PASSWORD');

    // Endpoint get-token chuẩn theo tài liệu MIC: /api/e/v1/get-token
    const tokenEndpoint = `${baseUrl.replace(/\/+$/, '')}/api/e/v1/get-token`;

    this.logger.log(`Đang yêu cầu cấp token mới từ MIC cho user: ${username}`);

    try {
      const response = await axios.post<MicTokenResponseDto>(
        tokenEndpoint,
        {
          username: username.trim(),
          password: password.trim(),
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          type: 'HAS_ROLES',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const tokenData = response.data?.data;

      if (!tokenData || !tokenData.access_token) {
        throw new Error(response.data?.message || 'MIC không trả về access_token');
      }

      const credentials: MicAuthCredentials = {
        code: response.data?.code,
        message: response.data?.message,
        access_token: tokenData.access_token,
        expires_in: Number(tokenData.expires_in) || 3600,
        token_type: tokenData.token_type,
        merchant: tokenData.merchant,
      };

      // 3. Cache vào Redis, trừ hao 300 giây (5 phút) để token không hết hạn giữa request
      const ttl = Math.max(credentials.expires_in - 300, 60);
      await this.redisService.set(this.cacheKey, JSON.stringify(credentials), ttl);

      this.logger.log(`Lấy token MIC thành công. Đã lưu cache với TTL: ${ttl}s`);

      return credentials;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      this.logger.error(`Lỗi khi lấy token từ MIC: ${errorMsg}`);
      throw new HttpException(
        `Lỗi xác thực với bảo hiểm MIC: ${errorMsg}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Xóa token khỏi cache khi gặp lỗi 401
   */
  async clearCachedToken(): Promise<void> {
    await this.redisService.del(this.cacheKey);
    this.logger.log('Đã xóa token MIC khỏi cache.');
  }
}
