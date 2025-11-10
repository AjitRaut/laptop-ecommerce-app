import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order, Payment
from orders.utils import send_invoice_email
from decimal import Decimal

# Use secret key from settings
stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for a given order.
    """
    try:
        order_id = request.data.get('order_id')
        order = Order.objects.get(order_id=order_id, user=request.user)

        # Convert to Decimal for precise calculation
        amount_in_rupees = Decimal(str(order.final_amount))
        
        # Convert INR to paise (multiply by 100)
        amount_in_paise = int(amount_in_rupees * 100)
        
        # Stripe limit check (99,99,999 paise = 9,99,999.99 rupees)
        max_amount_paise = 99999999  # ₹9,99,999.99
        
        if amount_in_paise > max_amount_paise:
            return Response({
                'error': f'Amount exceeds Stripe limit. Maximum allowed: ₹9,99,999.99'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if amount_in_paise < 50:  # Minimum 50 paise
            return Response({
                'error': 'Amount too small. Minimum amount is ₹0.50'
            }, status=status.HTTP_400_BAD_REQUEST)

        intent = stripe.PaymentIntent.create(
            amount=amount_in_paise,  # Amount in paise
            currency='inr',
            metadata={'order_id': str(order.order_id)}
        )

        return Response({
            'client_secret': intent.client_secret,
            'amount': float(order.final_amount)
        }, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirm a Stripe payment after success on frontend.
    """
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        order_id = request.data.get('order_id')

        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status == 'succeeded':
            order = Order.objects.get(order_id=order_id, user=request.user)
            order.payment_status = 'paid'
            order.payment_transaction_id = payment_intent_id
            order.status = 'confirmed'
            order.save()

            # Record payment in DB
            Payment.objects.create(
                order=order,
                amount=order.final_amount,
                payment_method='stripe',
                transaction_id=payment_intent_id,
                status='success'
            )

            # Optional email confirmation
            send_invoice_email(order, "payment_confirmation")

            return Response({'message': 'Payment confirmed successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Payment not completed'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)