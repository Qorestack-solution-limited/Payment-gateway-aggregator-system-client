import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty() @IsUrl() url: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) events: string[];
}

export class UpdateWebhookDto {
  @ApiPropertyOptional() @IsUrl() @IsOptional() url?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() events?: string[];
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
}
