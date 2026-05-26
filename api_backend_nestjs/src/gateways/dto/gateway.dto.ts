import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GatewayProvider } from '@prisma/client';

export class CreateGatewayDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ enum: GatewayProvider }) @IsEnum(GatewayProvider) provider: GatewayProvider;
  @ApiProperty() @IsString() @IsNotEmpty() type: string;
  @ApiPropertyOptional() @IsString() @IsOptional() publicKey?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() secretKey?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() webhookSecret?: string;
}

export class UpdateGatewayDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() publicKey?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() secretKey?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() webhookSecret?: string;
}

export class SyncGatewayTransactionsDto {
  @ApiPropertyOptional() @IsString() @IsOptional() from?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() to?: string;
}
