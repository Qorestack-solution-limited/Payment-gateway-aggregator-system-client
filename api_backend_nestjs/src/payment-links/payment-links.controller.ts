import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaymentLinksService, CreatePaymentLinkDto } from './payment-links.service';

@ApiTags('Payment Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-links')
export class PaymentLinksController {
  constructor(private links: PaymentLinksService) {}

  @Get()
  @ApiOperation({ summary: 'List all payment links for the organisation' })
  findAll(@GetUser('organizationId') orgId: string) {
    return this.links.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.links.findOne(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment link' })
  create(@GetUser('organizationId') orgId: string, @Body() dto: CreatePaymentLinkDto) {
    return this.links.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @GetUser('organizationId') orgId: string, @Body() dto: any) {
    return this.links.update(id, orgId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.links.remove(id, orgId);
  }
}
