import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries for the organization' })
  findAll(
    @GetUser('organizationId') orgId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('resourceType') resourceType?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.audit.findAll(orgId, { page, limit, resourceType, actorId });
  }
}
