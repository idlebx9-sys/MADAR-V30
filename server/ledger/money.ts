/**
 * Money / Decimal Engine for MADAR
 * 
 * Strict decimal arithmetic using integer cents (BigInt).
 * Completely eliminates IEEE-754 floating-point errors (e.g., 0.1 + 0.2 !== 0.3).
 * Prohibits parseFloat / Number float math for all ledger balances and transactions.
 */

export class Money {
  readonly cents: bigint;

  constructor(cents: bigint) {
    this.cents = cents;
  }

  /**
   * Parse a decimal string or numeric value into Money.
   * Accepts formats like: "100", "100.5", "100.50", "-50.25", etc.
   */
  static from(val: string | number | Money): Money {
    if (val instanceof Money) {
      return val;
    }
    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) {
        throw new Error(`قيمة مالية غير صالحة: ${val}`);
      }
      return Money.fromString(val.toFixed(2));
    }
    return Money.fromString(val);
  }

  static fromString(val: string): Money {
    const raw = String(val).trim();
    if (!/^-?\d+(\.\d{1,4})?$/.test(raw)) {
      throw new Error(`صيغة القيمة المالية غير مقبولة: "${val}"`);
    }

    const isNegative = raw.startsWith('-');
    const absStr = isNegative ? raw.slice(1) : raw;
    const [wholePart, fracPart = ''] = absStr.split('.');

    // Normalize fractional part to 2 decimal places (cents)
    const paddedFrac = (fracPart + '00').slice(0, 2);
    const whole = BigInt(wholePart);
    const centsPart = BigInt(paddedFrac);

    const totalCents = whole * 100n + centsPart;
    return new Money(isNegative ? -totalCents : totalCents);
  }

  static fromCents(cents: bigint | number): Money {
    return new Money(BigInt(cents));
  }

  static zero(): Money {
    return new Money(0n);
  }

  add(other: Money | string | number): Money {
    const o = Money.from(other);
    return new Money(this.cents + o.cents);
  }

  subtract(other: Money | string | number): Money {
    const o = Money.from(other);
    return new Money(this.cents - o.cents);
  }

  negate(): Money {
    return new Money(-this.cents);
  }

  abs(): Money {
    return new Money(this.cents < 0n ? -this.cents : this.cents);
  }

  isZero(): boolean {
    return this.cents === 0n;
  }

  isPositive(): boolean {
    return this.cents > 0n;
  }

  isNegative(): boolean {
    return this.cents < 0n;
  }

  greaterThan(other: Money | string | number): boolean {
    return this.cents > Money.from(other).cents;
  }

  greaterThanOrEqual(other: Money | string | number): boolean {
    return this.cents >= Money.from(other).cents;
  }

  lessThan(other: Money | string | number): boolean {
    return this.cents < Money.from(other).cents;
  }

  lessThanOrEqual(other: Money | string | number): boolean {
    return this.cents <= Money.from(other).cents;
  }

  equals(other: Money | string | number): boolean {
    return this.cents === Money.from(other).cents;
  }

  /**
   * Format as standard 2-decimal string, e.g. "150.00" or "-25.50"
   */
  toString(): string {
    const isNeg = this.cents < 0n;
    const absCents = isNeg ? -this.cents : this.cents;
    const whole = absCents / 100n;
    const frac = absCents % 100n;
    const fracStr = frac < 10n ? `0${frac}` : `${frac}`;
    return `${isNeg ? '-' : ''}${whole}.${fracStr}`;
  }

  toJSON(): string {
    return this.toString();
  }
}
