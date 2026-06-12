import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List unique customers aggregated from transactions' })
  findAll(
    @GetUser('organizationId') orgId: string,
    @Query('search') search?: string,
  ) {
    return this.customers.findAll(orgId, search);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get a customer profile with their transaction history' })
  async findOne(
    @GetUser('organizationId') orgId: string,
    @Param('email') email: string,
  ) {
    const customer = await this.customers.findOne(orgId, decodeURIComponent(email));
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
