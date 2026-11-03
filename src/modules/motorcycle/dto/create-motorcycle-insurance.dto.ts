import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Matches,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MotorcycleType {
  ABOVE_50CC = 'L',    // Xe từ 50cc trở lên
  UNDER_50CC = 'N',    // Xe dưới 50cc
  ELECTRIC = 'D',      // Xe máy điện
  THREE_WHEELER = 'B', // Xe mô tô ba bánh và tương tự
}

export enum ContractType {
  ORIGINAL = 'G',      // Gốc (mặc định)
  ADDITIONAL = 'B',    // Bổ sung
  RENEWAL = 'T',       // Tái tục
}

export class CreateMotorcycleInsuranceDto {
  @ApiPropertyOptional({
    description: 'Mã nghiệp vụ bảo hiểm (TNDS Xe máy: 2BL)',
    default: '2BL',
    example: '2BL',
  })
  @IsOptional()
  @IsString()
  nv?: string = '2BL';

  @ApiPropertyOptional({
    description: 'Kiểu hợp đồng: G (gốc), B (bổ sung), T (tái tục)',
    enum: ContractType,
    default: ContractType.ORIGINAL,
    example: ContractType.ORIGINAL,
  })
  @IsOptional()
  @IsEnum(ContractType, {
    message: 'kieu_hd phải là: G (gốc), B (bổ sung), T (tái tục)',
  })
  kieu_hd?: ContractType = ContractType.ORIGINAL;

  @ApiProperty({
    description: 'Ngày bắt đầu hiệu lực bảo hiểm (định dạng dd/mm/yyyy)',
    example: '15/10/2026',
  })
  @IsNotEmpty({ message: 'ngay_hl không được để trống' })
  @IsString()
  @Matches(/^([0-2][0-9]|(3)[0-1])\/(((0)[0-9])|((1)[0-2]))\/\d{4}$/, {
    message: 'ngay_hl phải đúng định dạng dd/mm/yyyy (ví dụ: 15/10/2026)',
  })
  ngay_hl: string;

  @ApiProperty({
    description: 'Ngày kết thúc hiệu lực bảo hiểm (định dạng dd/mm/yyyy)',
    example: '15/10/2027',
  })
  @IsNotEmpty({ message: 'ngay_kt không được để trống' })
  @IsString()
  @Matches(/^([0-2][0-9]|(3)[0-1])\/(((0)[0-9])|((1)[0-2]))\/\d{4}$/, {
    message: 'ngay_kt phải đúng định dạng dd/mm/yyyy (ví dụ: 15/10/2027)',
  })
  ngay_kt: string;

  @ApiProperty({
    description: 'Loại xe (L: >=50cc, N: <50cc, D: Xe điện, B: Xe 3 bánh)',
    enum: MotorcycleType,
    example: MotorcycleType.ABOVE_50CC,
  })
  @IsNotEmpty({ message: 'loai_xe không được để trống' })
  @IsEnum(MotorcycleType, {
    message: 'loai_xe phải là: L (trên 50cc), N (dưới 50cc), D (xe điện), B (xe 3 bánh)',
  })
  loai_xe: MotorcycleType;

  @ApiPropertyOptional({
    description: 'Mức trách nhiệm bảo hiểm tự nguyện người ngồi trên xe (VND)',
    enum: ['0', '10000000', '15000000', '20000000', '25000000', '30000000'],
    default: '0',
    example: '0',
  })
  @IsOptional()
  @IsString()
  @IsIn(['0', '10000000', '15000000', '20000000', '25000000', '30000000'], {
    message: 'tp phải là một trong các mức: 0, 10000000, 15000000, 20000000, 25000000, 30000000',
  })
  tp?: string = '0';

  @ApiPropertyOptional({
    description: 'Số người ngồi trên xe (Mặc định: 2 người)',
    default: 2,
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'so_cn phải là số nguyên' })
  @Min(1, { message: 'so_cn tối thiểu là 1 người' })
  @Max(2, { message: 'so_cn tối đa là 2 người' })
  so_cn?: number = 2;
}
