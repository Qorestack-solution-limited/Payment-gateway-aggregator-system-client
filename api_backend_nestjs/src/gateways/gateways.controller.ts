import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { GatewaysService } from './gateways.service';
import { CreateGatewayDto, SyncGatewayTransactionsDto, UpdateGatewayDto } from './dto/gateway.dto';

@ApiTags('Gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gateways')
export class GatewaysController {
  constructor(private gateways: GatewaysService) {}

  @Get()
  @ApiOperation({ summary: 'List all gateways for the organisation' })
  findAll(@GetUser('organizationId') orgId: string) {
    return this.gateways.findAll(orgId);
  }

  @Get(':id/webhook-events')
  @ApiOperation({ summary: 'List recent inbound provider webhook events for a gateway' })
  getWebhookEvents(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.gateways.getWebhookEvents(id, orgId);
  }

  @Get(':id/sync-runs')
  @ApiOperation({ summary: 'List recent transaction sync runs for a gateway' })
  getSyncRuns(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.gateways.getSyncRuns(id, orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.gateways.findOne(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Connect a new payment gateway' })
  create(@GetUser('organizationId') orgId: string, @Body() dto: CreateGatewayDto) {
    return this.gateways.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @GetUser('organizationId') orgId: string, @Body() dto: UpdateGatewayDto) {
    return this.gateways.update(id, orgId, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle gateway active/inactive' })
  toggle(
    @Param('id') id: string,
    @GetUser('organizationId') orgId: string,
    @GetUser('id') actorId: string,
    @GetUser('email') actorEmail: string,
  ) {
    return this.gateways.toggleStatus(id, orgId, actorId, actorEmail);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate gateway credentials/configuration' })
  validate(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.gateways.validate(id, orgId);
  }

  @Post(':id/sync-transactions')
  @ApiOperation({ summary: 'Pull transactions from the selected gateway into the unified store' })
  syncTransactions(
    @Param('id') id: string,
    @GetUser('organizationId') orgId: string,
    @Body() dto: SyncGatewayTransactionsDto,
  ) {
    return this.gateways.syncTransactions(id, orgId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('organizationId') orgId: string,
    @GetUser('id') actorId: string,
    @GetUser('email') actorEmail: string,
  ) {
    return this.gateways.remove(id, orgId, actorId, actorEmail);
  }
}
