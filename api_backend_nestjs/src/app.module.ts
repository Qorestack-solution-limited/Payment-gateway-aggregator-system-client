import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GatewaysModule } from './gateways/gateways.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { SearchModule } from './search/search.module';
import { CustomersModule } from './customers/customers.module';
import { EventsBusModule } from './events/events-bus.module';
import { AuditModule } from './audit/audit.module';
import { SyncSchedulerModule } from './sync-scheduler/sync-scheduler.module';
import { PaymentLinksModule } from './payment-links/payment-links.module';
import { RoutingModule } from './routing/routing.module';
import { SettlementsModule } from './settlements/settlements.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,   limit: 20  },  // 20 req/s per IP
      { name: 'medium', ttl: 60000,  limit: 200 },  // 200 req/min per IP
      { name: 'long',   ttl: 3600000, limit: 2000 }, // 2000 req/hr per IP
    ]),
    PrismaModule,
    MailModule,
    EventsBusModule,
    AuditModule,
    ExchangeRatesModule,
    AuthModule,
    PaymentsModule,
    UsersModule,
    GatewaysModule,
    TransactionsModule,
    AnalyticsModule,
    ApiKeysModule,
    WebhooksModule,
    DashboardModule,
    NotificationsModule,
    SearchModule,
    CustomersModule,
    SyncSchedulerModule,
    PaymentLinksModule,
    RoutingModule,
    SettlementsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
