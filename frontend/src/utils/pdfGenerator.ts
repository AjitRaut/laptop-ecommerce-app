import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Order } from '@/types';
import { formatDate, formatPrice } from './formatters';

export const generateOrderPDF = async (order: Order): Promise<void> => {
  // Create a temporary div with order details
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.padding = '40px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.width = '800px';
  
  tempDiv.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #1e40af; font-size: 32px; margin: 0;">LaptopWorld</h1>
        <p style="color: #6b7280; font-size: 16px; margin: 5px 0;">Premium Laptops & Accessories</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 10px;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order.order_id}</p>
          <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
          <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
          <p><strong>Payment Status:</strong> ${order.payment_status.toUpperCase()}</p>
        </div>
        <div>
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 10px;">Shipping Address</h2>
          <p><strong>${order.shipping_name}</strong></p>
          <p>${order.shipping_address}</p>
          <p>${order.shipping_city}, ${order.shipping_state} ${order.shipping_pincode}</p>
          <p>Phone: ${order.shipping_phone}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 40px;">
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Product</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Price</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Quantity</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.product_name}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${formatPrice(item.product_price)}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">${formatPrice(item.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 40px; text-align: right;">
        <div style="display: inline-block; text-align: left;">
          <p style="margin: 5px 0;"><strong>Subtotal: ${formatPrice(order.total_amount)}</strong></p>
          <p style="margin: 5px 0;">Tax (18%): ${formatPrice(order.tax_amount)}</p>
          <p style="margin: 5px 0;">Shipping: ${formatPrice(order.shipping_charges)}</p>
          ${parseFloat(order.discount_amount) > 0 ? `<p style="margin: 5px 0; color: #dc2626;">Discount: -${formatPrice(order.discount_amount)}</p>` : ''}
          <hr style="margin: 10px 0;">
          <p style="margin: 10px 0; font-size: 18px;"><strong>Final Total: ${formatPrice(order.final_amount)}</strong></p>
        </div>
      </div>
      
      <div style="margin-top: 60px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Thank you for shopping with LaptopWorld!</p>
        <p>For any queries, please contact us at support@laptopworld.com</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(tempDiv);
  
  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`order-${order.order_id}.pdf`);
  } finally {
    document.body.removeChild(tempDiv);
  }
};

export const generateInvoicePDF = async (order: Order): Promise<void> => {
  // Similar to order PDF but formatted as invoice
  await generateOrderPDF(order);
};