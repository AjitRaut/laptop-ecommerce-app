from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from io import BytesIO
import os
from datetime import datetime
import logging

# Set up logging for email debugging
logger = logging.getLogger(__name__)

def generate_invoice_pdf(order):
    """Generate PDF invoice for an order"""
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        # Container for the 'Flowable' objects
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph(f"<b>INVOICE</b>", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        # Invoice details
        invoice_data = [
            ['Invoice Number:', f'INV-{order.order_id}'],
            ['Order Date:', order.created_at.strftime('%Y-%m-%d')],
            ['Payment Status:', order.payment_status.upper()],
            ['Order Status:', order.status.upper()],
        ]
        
        invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(invoice_table)
        elements.append(Spacer(1, 12))
        
        # Billing details
        billing_info = Paragraph(f"""
            <b>Bill To:</b><br/>
            {order.shipping_name}<br/>
            {order.shipping_address}<br/>
            {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br/>
            Phone: {order.shipping_phone}
        """, styles['Normal'])
        elements.append(billing_info)
        elements.append(Spacer(1, 12))
        
        # Items table
        data = [['Product', 'Quantity', 'Unit Price', 'Total']]
        for item in order.items.all():
            data.append([
                item.product_name,
                str(item.quantity),
                f'₹{item.product_price}',
                f'₹{item.total_price}'
            ])
        
        # Add totals
        data.append(['', '', 'Subtotal:', f'₹{order.total_amount}'])
        data.append(['', '', 'Tax (18%):', f'₹{order.tax_amount}'])
        data.append(['', '', 'Shipping:', f'₹{order.shipping_charges}'])
        data.append(['', '', '<b>Total:</b>', f'<b>₹{order.final_amount}</b>'])
        
        table = Table(data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(table)
        
        # Build PDF
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        return pdf
    
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise

def send_invoice_email(order, invoice_type="payment_confirmation"):
    """
    Send invoice email to customer
    invoice_type: 'payment_confirmation' or 'order_confirmation'
    """
    try:
        # Validate order and user email
        if not order or not order.user or not order.user.email:
            logger.error("Invalid order or user email")
            return False
        
        # Generate PDF invoice
        logger.info(f"Generating PDF for order {order.order_id}")
        pdf_data = generate_invoice_pdf(order)
        
        # Email content based on type
        if invoice_type == "payment_confirmation":
            subject = f"Payment Confirmed - Invoice #{order.order_id}"
            template_name = "emails/payment_confirmation.html"
        else:
            subject = f"Order Confirmed - Invoice #{order.order_id}"
            template_name = "emails/order_confirmation.html"
        
        # Email context
        context = {
            'order': order,
            'user': order.user,
            'items': order.items.all(),
            'company_name': 'Laptop Shop',
        }
        
        try:
            # Render email templates
            html_content = render_to_string(template_name, context)
            text_content = render_to_string('emails/invoice_text.txt', context)
        except Exception as template_error:
            # Fallback to simple HTML if templates don't exist
            logger.warning(f"Template error: {template_error}. Using fallback content.")
            html_content = f"""
            <html>
            <body>
                <h2>Order Confirmation</h2>
                <p>Dear {order.user.first_name or order.user.username},</p>
                <p>Thank you for your order! Your order #{order.order_id} has been confirmed.</p>
                <p><strong>Total Amount: ₹{order.final_amount}</strong></p>
                <p>Your invoice is attached to this email.</p>
                <p>Thank you for shopping with Laptop Shop!</p>
            </body>
            </html>
            """
            text_content = f"""
Order Confirmation

Dear {order.user.first_name or order.user.username},

Thank you for your order! Your order #{order.order_id} has been confirmed.
Total Amount: ₹{order.final_amount}

Your invoice is attached to this email.

Thank you for shopping with Laptop Shop!
            """
        
        # Create email
        logger.info(f"Creating email for {order.user.email}")
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[order.user.email],
        )
        
        email.attach_alternative(html_content, "text/html")
        
        # Attach PDF invoice
        email.attach(
            f'Invoice-{order.order_id}.pdf',
            pdf_data,
            'application/pdf'
        )
        
        # Send email
        logger.info(f"Sending email to {order.user.email}")
        email.send(fail_silently=False)
        
        logger.info(f"Email sent successfully to {order.user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending invoice email: {str(e)}")
        print(f"[Email Error Details] {str(e)}")  # Keep console output for debugging
        return False