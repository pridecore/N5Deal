export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoney(value: string | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined || value === "") return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
}

export function labelize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
