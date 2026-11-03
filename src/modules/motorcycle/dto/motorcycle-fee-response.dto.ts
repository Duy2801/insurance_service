import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MotorcycleFeeDataDto {
  @ApiProperty({
    description: 'Phí trả bảo hiểm ( Chưa bao gồm VAT )',
    example: 60000,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  phi: number;

  @ApiProperty({
    description: 'Thuế',
    example: 6000,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  thue: number;

  @ApiProperty({
    description: 'Số tiền thanh toán ( Bao gồm VAT )',
    example: 66000,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  ttoan: number;
}

export class MotorcycleFeeResponseDto {
  @ApiProperty({
    description: 'Trạng thái',
    example: '00',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Thông báo message',
    example: 'Thành công',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Dữ liệu trả ra',
    type: MotorcycleFeeDataDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MotorcycleFeeDataDto)
  data: MotorcycleFeeDataDto;
}
