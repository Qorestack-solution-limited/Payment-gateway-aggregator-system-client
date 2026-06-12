import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { SettlementsService } from './settlements.service';
import { SettlementStatus } from '@prisma/client';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settlements')
export class SettlementsController {
  constructor(private settlements: SettlementsService) {}

  @Get()
  @ApiOperation({ summary: 'List settlements for the organisation' })
  findAll(
    @GetUser('organizationId') orgId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('gatewayId') gatewayId?: string,
    @Query('status') status?: SettlementStatus,
  ) {
    return this.settlements.findAll(orgId, { page, limit, gatewayId, status });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get settlement summary totals' })
  summary(@GetUser('organizationId') orgId: string) {
    return this.settlements.getSummary(orgId);
  }
}
