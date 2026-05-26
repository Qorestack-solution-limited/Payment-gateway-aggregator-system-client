import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'KPI summary (revenue, txns, success rate, customers)' })
  @ApiQuery({ name: 'days', required: false })
  summary(@GetUser('organizationId') orgId: string, @Query('days') days?: string) {
    return this.analytics.getSummary(orgId, days ? +days : 30);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Daily revenue chart data' })
  revenueChart(@GetUser('organizationId') orgId: string, @Query('days') days?: string) {
    return this.analytics.getRevenueChart(orgId, days ? +days : 30);
  }

  @Get('gateway-breakdown')
  @ApiOperation({ summary: 'Transaction volume and revenue by gateway' })
  gatewayBreakdown(@GetUser('organizationId') orgId: string, @Query('days') days?: string) {
    return this.analytics.getGatewayBreakdown(orgId, days ? +days : 30);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Key performance indicators' })
  kpis(@GetUser('organizationId') orgId: string, @Query('days') days?: string) {
    return this.analytics.getKPIs(orgId, days ? +days : 30);
  }
}
