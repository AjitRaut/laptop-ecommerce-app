from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('confirm-payment/', views.confirm_payment, name='confirm-payment'),
    path('razorpay/create/', views.create_razorpay_order, name='razorpay-create'),
    path('razorpay/verify/', views.verify_razorpay_payment, name='razorpay-verify'),
]
