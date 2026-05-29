import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private search1: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across transactions and gateways' })
  search(
    @GetUser('organizationId') orgId: string,
    @Query('q') q: string,
  ) {
    return this.search1.globalSearch(orgId, q ?? '');
  }
}
