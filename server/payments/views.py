import stripe
import razorpay
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order, Payment
from orders.utils import send_invoice_email


stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    try:
        order_id = request.data.get('order_id')
        order = Order.objects.get(order_id=order_id, user=request.user)
        
        intent = stripe.PaymentIntent.create(
            amount=int(order.final_amount * 100),  # Amount in cents
            currency='inr',
            metadata={'order_id': str(order.order_id)}
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'amount': order.final_amount
        })
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        order_id = request.data.get('order_id')
        
        # Verify payment with Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            order = Order.objects.get(order_id=order_id, user=request.user)
            order.payment_status = 'paid'
            order.payment_transaction_id = payment_intent_id
            order.status = 'confirmed'
            order.save()
            
            # Create payment record
            Payment.objects.create(
                order=order,
                amount=order.final_amount,
                payment_method='stripe',
                transaction_id=payment_intent_id,
                status='success'
            )

            send_invoice_email(order, "payment_confirmation")
            
            return Response({'message': 'Payment confirmed successfully', 'invoice_sent': True})
        else:
            return Response({'error': 'Payment failed'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        order_id = request.data.get('order_id')
        order = Order.objects.get(order_id=order_id, user=request.user)
        
        razorpay_order = client.order.create({
            'amount': int(order.final_amount * 100),
            'currency': 'INR',
            'notes': {
                'order_id': str(order.order_id)
            }
        })
        
        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount': order.final_amount,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID
        })
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_razorpay_payment(request):
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        payment_data = {
            'razorpay_order_id': request.data.get('razorpay_order_id'),
            'razorpay_payment_id': request.data.get('razorpay_payment_id'),
            'razorpay_signature': request.data.get('razorpay_signature')
        }
        
        # Verify signature
        client.utility.verify_payment_signature(payment_data)
        
        order_id = request.data.get('order_id')
        order = Order.objects.get(order_id=order_id, user=request.user)
        order.payment_status = 'paid'
        order.payment_transaction_id = payment_data['razorpay_payment_id']
        order.status = 'confirmed'
        order.save()
        
        # Create payment record
        Payment.objects.create(
            order=order,
            amount=order.final_amount,
            payment_method='razorpay',
            transaction_id=payment_data['razorpay_payment_id'],
            status='success'
        )
        
        return Response({'message': 'Payment verified successfully'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)