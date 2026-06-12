import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export type DashboardEvent = {
  type: 'transaction.created' | 'transaction.updated' | 'transaction.refunded' | 'gateway.synced';
  orgId: string;
  data: Record<string, unknown>;
};

@Injectable()
export class EventsBusService {
  private readonly bus$ = new Subject<DashboardEvent>();

  emit(event: DashboardEvent) {
    this.bus$.next(event);
  }

  stream(orgId: string) {
    return this.bus$.pipe(
      filter((e) => e.orgId === orgId),
      map((e) => ({ data: e })),
    );
  }
}
