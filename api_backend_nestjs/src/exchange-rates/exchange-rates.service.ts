import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  // Rates: how many units of currency X = 1 USD
  private rates: Record<string, number> = {
    USD: 1,
    NGN: 1600,
    GBP: 0.79,
    EUR: 0.92,
    GHS: 15.6,
    KES: 129,
    ZAR: 18.8,
  };
  private lastFetched: Date | null = null;

  // Refresh every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshRates() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) return;
      const data = await res.json() as { rates?: Record<string, number> };
      if (data?.rates) {
        this.rates = { USD: 1, ...data.rates };
        this.lastFetched = new Date();
        this.logger.log('Exchange rates updated');
      }
    } catch (err: any) {
      this.logger.warn(`Failed to refresh exchange rates: ${err.message}`);
    }
  }

  /**
   * Convert an amount from sourceCurrency to targetCurrency.
   * Both must be ISO 4217 codes (e.g. "NGN", "USD").
   */
  convert(amount: number, from: string, to: string): number {
    const fromRate = this.rates[from.toUpperCase()] ?? 1;
    const toRate   = this.rates[to.toUpperCase()] ?? 1;
    // amount / fromRate gives USD, then * toRate gives target
    return (amount / fromRate) * toRate;
  }

  getRate(currency: string): number {
    return this.rates[currency.toUpperCase()] ?? 1;
  }

  getSupportedCurrencies(): string[] {
    return Object.keys(this.rates);
  }

  getLastFetched(): Date | null {
    return this.lastFetched;
  }
}
