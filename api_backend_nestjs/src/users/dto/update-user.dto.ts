import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsString() @IsOptional() firstName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() lastName?: string;
  @ApiPropertyOptional() @IsEmail() @IsOptional() email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() avatarUrl?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional() @IsString() currentPassword: string;
  @ApiPropertyOptional() @IsString() @MinLength(8) newPassword: string;
}
