import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiKeysService } from './api-keys.service';

class GenerateKeyDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ enum: ApiKeyType }) @IsEnum(ApiKeyType) type: ApiKeyType;
}

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeys: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  findAll(@GetUser('organizationId') orgId: string) {
    return this.apiKeys.findAll(orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  generate(@GetUser('organizationId') orgId: string, @Body() dto: GenerateKeyDto) {
    return this.apiKeys.generate(orgId, dto.name, dto.type);
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke an API key' })
  revoke(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.apiKeys.revoke(id, orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an API key permanently' })
  remove(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.apiKeys.remove(id, orgId);
  }
}
