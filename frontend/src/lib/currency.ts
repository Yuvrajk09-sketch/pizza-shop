/**
 * Currency utility — USD to INR conversion
 * Rate: 1 USD = 84.50 INR (update periodically)
 */
export const USD_TO_INR = 84.50;

/**
 * Convert a USD amount to INR
 */
export function toINR(usd: number): number {
  return Math.round(usd * USD_TO_INR * 100) / 100;
}

/**
 * Format a USD value as INR string with ₹ symbol and Indian number formatting
 * e.g. 1500.50 → "₹1,500.50"
 */
export function formatINR(usd: number): string {
  const inr = toINR(usd);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(inr);
}

/**
 * Format raw INR value (already in INR, not USD)
 */
export function formatINRRaw(inr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(inr);
}

/**
 * Generate a unique invoice number from order ID and date
 */
export function generateInvoiceNumber(orderId: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const short = orderId.replace('SC-', '').slice(0, 5).toUpperCase();
  return `INV-${year}${month}${day}-${short}`;
}
