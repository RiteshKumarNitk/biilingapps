
import { format } from 'date-fns'

export const generateInvoiceHTML = (invoice: any, items: any[], tenant: any) => {
    const itemsRows = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.unit_price}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.gst_rate}%</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.total_amount}</td>
    </tr>
  `).join('')

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .header h1 { margin: 0; color: #2563eb; }
        .header p { margin: 5px 0 0; font-size: 14px; color: #666; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .bill-to h3, .invoice-meta h3 { font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 10px; }
        .invoice-meta { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; background-color: #f8fafc; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; }
        .totals { float: right; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .totals-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
        .footer { clear: both; margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>${tenant.name}</h1>
            <p>${tenant.address || ''}</p>
            <p>${tenant.email || ''} | ${tenant.phone || ''}</p>
            <p>GSTIN: ${tenant.gstin || 'N/A'}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0;">INVOICE</h2>
            <p>#${invoice.invoice_number}</p>
          </div>
        </div>

        <div class="details">
          <div class="bill-to">
            <h3>Billed To</h3>
            <p><strong>${invoice.party_name}</strong></p>
            <!-- Add Party Address if available via join -->
          </div>
          <div class="invoice-meta">
            <h3>Details</h3>
            <p>Date: ${format(new Date(invoice.date), 'dd MMM yyyy')}</p>
            <p>Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : 'N/A'}</p>
            <p>Status: ${invoice.payment_status?.toUpperCase()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">GST</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>₹${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Total GST</span>
            <span>₹${(invoice.grand_total - invoice.subtotal).toFixed(2)}</span>
          </div>
          <div class="totals-row final">
            <span>Total</span>
            <span>₹${invoice.grand_total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
