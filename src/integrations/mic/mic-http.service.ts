import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MicAuthService } from './mic-auth.service.js';

@Injectable()
export class MicHttpService {
  private readonly logger = new Logger(MicHttpService.name);
  private axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly micAuthService: MicAuthService,
  ) {
    const baseURL =
      this.configService.get<string>('MIC_GATEWAY_URL') ||
      this.configService.get<string>('MIC_BASE_URL') ||
      'https://api-sandbox-external.mic.vn';
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 1. Request Interceptor: Tự động inject Bearer Token và Header merchant
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const credentials = await this.micAuthService.getAuthCredentials();
        config.headers.set('Authorization', `${credentials.token_type} ${credentials.access_token}`);
        config.headers.set('merchant', credentials.merchant);
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 2. Response Interceptor: Tự động làm mới token nếu gặp 401 Unauthorized
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.logger.warn('MIC trả về lỗi 401 Unauthorized. Tiến hành xóa cache và lấy token mới...');
          await this.micAuthService.clearCachedToken();
          const credentials = await this.micAuthService.getAuthCredentials();
          originalRequest.headers.set('Authorization', `${credentials.token_type} ${credentials.access_token}`);
          originalRequest.headers.set('merchant', credentials.merchant);
          return this.axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      },
    );
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }
}
