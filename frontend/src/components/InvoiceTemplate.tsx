'use client';

import React, { useRef } from 'react';
import { Order } from '@/types/pizza';
import { formatINR, toINR, generateInvoiceNumber, USD_TO_INR } from '@/lib/currency';

interface InvoiceProps {
  order: Order;
  onClose?: () => void;
}

export default function InvoiceTemplate({ order, onClose }: InvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const invoiceNo = generateInvoiceNumber(order.id, order.created_at);
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const invoiceTime = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    if (!printRef.current) return;
    
    // Dynamically load html2pdf to download without printing dialog
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = printRef.current;
      const opt = {
        margin:       0,
        filename:     `${invoiceNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // Use html2pdf to directly download
      (window as unknown as { html2pdf: () => any }).html2pdf().set(opt).from(element).save();
    };
    document.body.appendChild(script);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-4 py-8">
      {/* Action Bar */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-[110]">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-all shadow-xl shadow-orange-600/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Download PDF
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* A4 Invoice Paper */}
      <div style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          ref={printRef}
          style={{
            fontFamily: "'Outfit', -apple-system, sans-serif",
            background: '#FDFCF8',
            width: '794px',
            minHeight: '1120px',
            color: '#1C1B18',
            position: 'relative',
          }}
        >
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* === TOP HEADER BAND === */}
        <div style={{
          background: 'linear-gradient(135deg, #1C1B18 0%, #2D2A22 60%, #3D3020 100%)',
          padding: '48px 56px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '220px', height: '220px', borderRadius: '50%',
            background: 'rgba(255,91,38,0.12)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '40%',
            width: '140px', height: '140px', borderRadius: '50%',
            background: 'rgba(245,158,11,0.06)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #D97706, #FF5B26)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px',
                }}>🍕</div>
                <div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '32px', fontWeight: '700', letterSpacing: '0.06em',
                    color: '#FFFFFF', lineHeight: 1,
                  }}>
                    SLICE<span style={{ color: '#FF5B26' }}>CRAFT</span>
                  </div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '11px', fontWeight: '400', letterSpacing: '0.28em',
                    color: '#A89070', marginTop: '3px', textTransform: 'uppercase',
                  }}>Artisan Neapolitan Pizzeria</div>
                </div>
              </div>
              <div style={{ marginTop: '18px', fontSize: '11px', color: '#7A6A58', lineHeight: '1.7', letterSpacing: '0.01em' }}>
                <div>Linking Road, Bandra West, Mumbai</div>
                <div>GSTIN: 27AABCU9603R1ZN &nbsp;|&nbsp; hello@slicecraft.in</div>
                <div>+91 98765 43210</div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '48px', fontWeight: '300', color: '#FF5B26',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>TAX INVOICE</div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#7A6A58', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Invoice No.</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{invoiceNo}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#7A6A58', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Order Ref.</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{order.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#7A6A58', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Date</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#E5D5C0' }}>{invoiceDate}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#7A6A58', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Time</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#E5D5C0' }}>{invoiceTime}</span>
                </div>
                <div style={{
                  marginTop: '10px', padding: '6px 16px', borderRadius: '100px',
                  background: order.status === 'delivered' ? 'rgba(34,197,94,0.2)' : 'rgba(255,91,38,0.2)',
                  border: `1px solid ${order.status === 'delivered' ? 'rgba(34,197,94,0.4)' : 'rgba(255,91,38,0.4)'}`,
                  fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em',
                  color: order.status === 'delivered' ? '#4ADE80' : '#FF7A45',
                  textTransform: 'uppercase',
                }}>
                  {order.status === 'delivered' ? '✓ Paid & Delivered' : order.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === BILL TO / DELIVER TO === */}
        <div style={{ padding: '36px 56px 0', display: 'flex', gap: '40px' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.2em',
              color: '#FF5B26', textTransform: 'uppercase', marginBottom: '12px',
            }}>Bill To</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1C1B18', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.02em' }}>
              {order.customer_name}
            </div>
            <div style={{ fontSize: '12px', color: '#5A5040', marginTop: '6px', lineHeight: '1.8' }}>
              <div>{order.customer_email}</div>
              <div>{order.customer_phone}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.2em',
              color: '#FF5B26', textTransform: 'uppercase', marginBottom: '12px',
            }}>Deliver To</div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1C1B18', lineHeight: '1.8' }}>
              <div>{order.delivery_address}</div>
              <div>{order.delivery_city}</div>
              {order.delivery_notes && (
                <div style={{ fontSize: '11px', color: '#8A7A68', marginTop: '4px', fontStyle: 'italic' }}>
                  Note: {order.delivery_notes}
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.2em',
              color: '#FF5B26', textTransform: 'uppercase', marginBottom: '12px',
            }}>Payment</div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1C1B18', lineHeight: '1.8' }}>
              <div style={{ textTransform: 'capitalize' }}>{order.payment_method.replace('_', ' ')}</div>
              <div style={{ fontSize: '11px', color: '#8A7A68', marginTop: '2px' }}>
                Exchange Rate: 1 USD = ₹{USD_TO_INR.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* === ELEGANT DIVIDER === */}
        <div style={{ padding: '28px 56px 0' }}>
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #D4B896 20%, #D4B896 80%, transparent 100%)',
          }} />
        </div>

        {/* === LINE ITEMS TABLE === */}
        <div style={{ padding: '28px 56px 0' }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 16px',
            background: '#F4EFE6',
            borderRadius: '8px 8px 0 0',
            borderBottom: '2px solid #D4B896',
          }}>
            {['Description', 'Qty', 'Size', 'Unit Price', 'Amount'].map((h, i) => (
              <div key={h} style={{
                flex: i === 0 ? '2.5' : i === 1 ? '0.7' : '1',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '10px', fontWeight: '600', letterSpacing: '0.18em',
                color: '#7A5C3A', textTransform: 'uppercase',
                textAlign: i >= 3 ? 'right' : 'left',
              }}>{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '14px 16px',
                background: idx % 2 === 0 ? '#FDFCF8' : '#FAF7F2',
                borderBottom: '1px solid #ECE5D8',
                alignItems: 'start',
              }}
            >
              <div style={{ flex: '2.5' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1C1B18', letterSpacing: '0.01em' }}>
                  {item.pizza_name}
                </div>
                <div style={{ fontSize: '10.5px', color: '#8A7A68', marginTop: '3px', letterSpacing: '0.02em' }}>
                  {item.crust_type.replace('_', ' ')} Crust • {item.sauce_type.replace('_', ' ')} Sauce
                </div>
                {item.selected_toppings.length > 0 && (
                  <div style={{ fontSize: '10px', color: '#A89070', marginTop: '4px', lineHeight: '1.6', fontStyle: 'italic' }}>
                    + {item.selected_toppings.join(', ')}
                  </div>
                )}
              </div>
              <div style={{ flex: '0.7', fontSize: '13px', fontWeight: '500', color: '#3A3020', textAlign: 'left' }}>
                {item.quantity}
              </div>
              <div style={{ flex: '1', fontSize: '12px', color: '#5A5040', textTransform: 'capitalize' }}>
                {item.size}
              </div>
              <div style={{ flex: '1', fontSize: '13px', fontWeight: '500', color: '#3A3020', textAlign: 'right', fontFamily: 'monospace' }}>
                {formatINR(item.unit_price)}
              </div>
              <div style={{ flex: '1', fontSize: '13px', fontWeight: '700', color: '#1C1B18', textAlign: 'right', fontFamily: 'monospace' }}>
                {formatINR(item.total_price)}
              </div>
            </div>
          ))}

          {/* Table Footer line */}
          <div style={{ height: '2px', background: '#D4B896', borderRadius: '0 0 4px 4px' }} />
        </div>

        {/* === TOTALS SECTION === */}
        <div style={{ padding: '24px 56px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '320px' }}>
            {/* Subtotal, Tax, Delivery */}
            {[
              { label: 'Subtotal', usd: order.subtotal },
              { label: 'GST / Tax (8.875%)', usd: order.tax },
              { label: 'Express Delivery', usd: order.delivery_fee },
            ].map(({ label, usd }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px dashed #E0D5C5',
              }}>
                <span style={{ fontSize: '12px', color: '#7A6A58', letterSpacing: '0.02em' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#3A3020', fontFamily: 'monospace' }}>
                  {formatINR(usd)}
                </span>
              </div>
            ))}

            {/* Grand Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', marginTop: '10px',
              background: 'linear-gradient(135deg, #1C1B18, #2D2820)',
              borderRadius: '10px',
            }}>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '10px', fontWeight: '600', letterSpacing: '0.18em',
                  color: '#A89070', textTransform: 'uppercase',
                }}>Total Amount</div>
                <div style={{ fontSize: '10px', color: '#6A5A48', marginTop: '2px' }}>
                  (USD ${order.total_amount.toFixed(2)})
                </div>
              </div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px', fontWeight: '700', color: '#FF5B26', letterSpacing: '-0.01em',
              }}>
                {formatINR(order.total_amount)}
              </div>
            </div>
          </div>
        </div>

        {/* === THANK YOU / NOTES === */}
        <div style={{ padding: '36px 56px 0', display: 'flex', gap: '40px' }}>
          <div style={{ flex: 2 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.2em',
              color: '#FF5B26', textTransform: 'uppercase', marginBottom: '10px',
            }}>Notes</div>
            <div style={{ fontSize: '11.5px', color: '#8A7A68', lineHeight: '1.8' }}>
              All prices are inclusive of applicable taxes. This is a computer-generated invoice and does not require a physical signature. For disputes or refunds, contact us within 48 hours of delivery.
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.2em',
              color: '#FF5B26', textTransform: 'uppercase', marginBottom: '10px',
            }}>Authorised By</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '28px', fontWeight: '400', fontStyle: 'italic',
              color: '#1C1B18', lineHeight: 1.2,
            }}>SliceCraft</div>
            <div style={{ fontSize: '10px', color: '#A89070', marginTop: '4px', letterSpacing: '0.06em' }}>
              Artisans Inc.
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <div style={{ padding: '32px 56px 40px', marginTop: '24px' }}>
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #D4B896 20%, #D4B896 80%, transparent 100%)',
            marginBottom: '24px',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20px', fontWeight: '600', fontStyle: 'italic',
              color: '#C4A87A', letterSpacing: '0.04em',
            }}>
              Thank you for your order. Buon Appetito! 🍕
            </div>
            <div style={{ fontSize: '10px', color: '#A89070', textAlign: 'right', letterSpacing: '0.06em' }}>
              <div>slicecraft.in</div>
              <div style={{ marginTop: '2px', color: '#7A6A58' }}>FSSAI: 10019012000233</div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
