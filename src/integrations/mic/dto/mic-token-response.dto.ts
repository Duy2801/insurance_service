import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MicTokenDataDto {
  @ApiProperty({ description: 'Access Token xác thực' })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({ description: 'Thời gian hết hạn token (giây)', example: 3600 })
  @IsNumber()
  @IsNotEmpty()
  expires_in: number;

  @ApiProperty({ description: 'Loại token', example: 'Bearer' })
  @IsString()
  @IsNotEmpty()
  token_type: string;

  @ApiProperty({ description: 'Mã merchant đối tác định danh' })
  @IsString()
  @IsNotEmpty()
  merchant: string;

  @ApiPropertyOptional({ description: 'Danh sách quyền roles' })
  @IsOptional()
  roles?: Array<{ name: string }>;
}

export class MicTokenResponseDto {
  @ApiProperty({ description: 'Trạng thái phản hồi từ MIC (00 là thành công)', example: '00' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Thông báo chi tiết từ MIC', example: 'Thành Công' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Dữ liệu token và merchant trả về', type: MicTokenDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MicTokenDataDto)
  data?: MicTokenDataDto;
}
