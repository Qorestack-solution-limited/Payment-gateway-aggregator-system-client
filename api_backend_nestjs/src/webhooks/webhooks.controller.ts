import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@ApiTags('Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooks: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List all webhook endpoints' })
  findAll(@GetUser('organizationId') orgId: string) {
    return this.webhooks.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.webhooks.findOne(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new webhook endpoint' })
  create(@GetUser('organizationId') orgId: string, @Body() dto: CreateWebhookDto) {
    return this.webhooks.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @GetUser('organizationId') orgId: string, @Body() dto: UpdateWebhookDto) {
    return this.webhooks.update(id, orgId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.webhooks.remove(id, orgId);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get delivery history for a webhook' })
  deliveries(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.webhooks.getDeliveries(id, orgId);
  }

  @Post(':id/test')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send a test event to a webhook endpoint' })
  sendTest(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.webhooks.sendTestEvent(id, orgId);
  }

  @Post('deliveries/:deliveryId/retry')
  @HttpCode(200)
  @ApiOperation({ summary: 'Manually retry a failed webhook delivery' })
  retryDelivery(@Param('deliveryId') deliveryId: string, @GetUser('organizationId') orgId: string) {
    return this.webhooks.retryDelivery(deliveryId, orgId);
  }
}
