import { TimeUnit } from '../enums/time-unit';

export function calculateExpirationDate(period: number, unit: TimeUnit): Date {
  const now = new Date();
  switch (unit) {
    case TimeUnit.SECONDS:
      return new Date(now.getTime() + period * 1000);
    case TimeUnit.MINUTES:
      return new Date(now.getTime() + period * 60 * 1000);
    case TimeUnit.HOURS:
      return new Date(now.getTime() + period * 60 * 60 * 1000);
    default:
      throw new Error('Unsupported time unit');
  }
}
