/**
 * Native INR Currency Formatter
 * SliceCraft Artisan operates natively in Indian Rupees (INR - ₹).
 */
export const USD_TO_INR = 1;

/**
 * Return native INR amount
 */
export function toINR(amount: number): number {
  return Number(amount || 0);
}

/**
 * Format an INR value as currency string with ₹ symbol and Indian number system (e.g. ₹1,299.00)
 */
export function formatINR(amount: number): string {
  const val = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Alias for formatINR
 */
export function formatINRRaw(inr: number): string {
  return formatINR(inr);
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
