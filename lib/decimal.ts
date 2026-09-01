import { Prisma } from "@prisma/client";

export function toDecimal(value: string | undefined | null): Prisma.Decimal | null {
  if (value === undefined || value === null || value === "") return null;
  return new Prisma.Decimal(value);
}

export function decimalToString(value: Prisma.Decimal | null | undefined): string | null {
  return value === null || value === undefined ? null : value.toFixed(2);
}

export function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value.toString());
}
