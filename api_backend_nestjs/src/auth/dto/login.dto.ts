import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() password: string;
  @ApiProperty({ required: false, description: 'TOTP code (required when 2FA is enabled)' })
  @IsString() @IsOptional() totpCode?: string;
}
