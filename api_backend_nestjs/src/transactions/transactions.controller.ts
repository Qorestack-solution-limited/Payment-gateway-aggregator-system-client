import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, QueryTransactionDto } from './dto/transaction.dto';
import { TransactionStatus } from '@prisma/client';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private txs: TransactionsService) {}

  @Get()
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'List transactions with pagination and filters' })
  findAll(@GetUser('organizationId') orgId: string, @Query() query: QueryTransactionDto) {
    return this.txs.findAll(orgId, query);
  }

  @Get('reference/:reference')
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'Find a transaction by reference' })
  findByReference(@Param('reference') reference: string, @GetUser('organizationId') orgId: string) {
    return this.txs.findByReference(reference, orgId);
  }

  @Get(':id')
  @UseGuards(ApiKeyAuthGuard)
  findOne(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.txs.findOne(id, orgId);
  }

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'Create a new transaction record' })
  create(
    @GetUser('organizationId') orgId: string,
    @Body() dto: CreateTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.txs.create(orgId, dto, idempotencyKey);
  }

  @Post(':id/verify')
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'Verify transaction status with the selected gateway provider' })
  verify(@Param('id') id: string, @GetUser('organizationId') orgId: string) {
    return this.txs.verify(id, orgId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update transaction status' })
  updateStatus(
    @Param('id') id: string,
    @GetUser('organizationId') orgId: string,
    @Body('status') status: TransactionStatus,
  ) {
    return this.txs.updateStatus(id, orgId, status);
  }
}
