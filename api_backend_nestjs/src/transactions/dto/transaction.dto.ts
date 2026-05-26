import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail, Min, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty() @IsNumber() @Min(1) @Type(() => Number) amount: number;
  @ApiPropertyOptional() @IsString() @IsOptional() currency?: string;
  @ApiProperty() @IsString() @IsNotEmpty() customerName: string;
  @ApiProperty() @IsEmail() customerEmail: string;
  @ApiProperty() @IsString() @IsNotEmpty() gatewayId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() reference?: string;
  @ApiPropertyOptional() @IsObject() @IsOptional() metadata?: Record<string, unknown>;
}

export class QueryTransactionDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) limit?: number = 20;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TransactionStatus) status?: TransactionStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() gatewayId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() provider?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() to?: string;
}
