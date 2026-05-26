import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get full dashboard overview (stats, gateway performance, recent txns)' })
  overview(@GetUser('organizationId') orgId: string) {
    return this.dashboard.getOverview(orgId);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get 30-day revenue chart data' })
  revenueChart(@GetUser('organizationId') orgId: string) {
    return this.dashboard.getRevenueChart(orgId);
  }
}
