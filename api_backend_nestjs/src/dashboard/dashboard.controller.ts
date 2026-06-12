import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { DashboardService } from './dashboard.service';
import { EventsBusService } from '../events/events-bus.service';
import { Request, Response } from 'express';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private dashboard: DashboardService,
    private events: EventsBusService,
  ) {}

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

  @Get('events')
  @ApiExcludeEndpoint()
  sseEvents(
    @GetUser('organizationId') orgId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sub = this.events.stream(orgId).subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
      },
      error: () => res.end(),
    });

    // Keep-alive ping every 25s
    const ping = setInterval(() => res.write(': ping\n\n'), 25_000);

    req.on('close', () => {
      clearInterval(ping);
      sub.unsubscribe();
      res.end();
    });
  }
}
