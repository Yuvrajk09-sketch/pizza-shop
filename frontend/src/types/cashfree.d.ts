declare module '@cashfreepayments/cashfree-js' {
  export function load(options: { mode: 'sandbox' | 'production' }): Promise<{
    checkout: (params: { paymentSessionId: string; redirectTarget?: string }) => Promise<any>;
  }>;
}
