import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RoutingService, CreateRoutingRuleDto } from './routing.service';

@ApiTags('Routing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routing')
export class RoutingController {
  constructor(private routing: RoutingService) {}

  @Get()
  @ApiOperation({ summary: 'List all routing rules for the organisation' })
  findAll(@GetUser('organizationId') orgId: string) {
    return this.routing.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.routing.findOne(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a routing rule' })
  create(@GetUser('organizationId') orgId: string, @Body() dto: CreateRoutingRuleDto) {
    return this.routing.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @GetUser('organizationId') orgId: string, @Body() dto: any) {
    return this.routing.update(id, orgId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.routing.remove(id, orgId);
  }

  @Post('resolve')
  @ApiOperation({ summary: 'Simulate which gateway would be selected for given transaction parameters' })
  resolve(@GetUser('organizationId') orgId: string, @Body() body: { amount: number; currency?: string }) {
    return this.routing.resolveGateway(orgId, body).then((gatewayId) => ({ gatewayId }));
  }
}
