from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Product, Category, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer, CheckoutSerializer

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def get_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, context = {'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product = get_object_or_404(Product, id=request.data.get('product_id'))
    cart, created = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += 1
        item.save()
    return Response({'message': 'Product added to cart', 'cart': CartSerializer(cart, context={'request': request}).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')

    if not item_id or quantity is None:
        return Response({'error': 'Item ID and quantity are required'}, status=400)

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return Response({'error': 'Quantity must be a number'}, status=400)

    # Only allow editing items in the current user's own cart
    item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    if quantity < 1:
        item.delete()
        return Response({'message': 'Item removed from cart'})

    item.quantity = quantity
    item.save()
    serializer = CartItemSerializer(item, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    CartItem.objects.filter(id=item_id, cart__user=request.user).delete()
    return Response({'message': 'Item removed from cart'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    serializer = CheckoutSerializer(data=request.data)
    if not serializer.is_valid():
        # Return the first validation message so the frontend can show it directly
        field, messages = next(iter(serializer.errors.items()))
        return Response({'error': f"{field}: {messages[0]}", 'errors': serializer.errors}, status=400)

    cart, created = Cart.objects.get_or_create(user=request.user)
    items = list(cart.items.select_related('product'))
    if not items:
        return Response({'error': 'Cart is empty'}, status=400)

    total = sum(item.product.price * item.quantity for item in items)

    # Create the order and clear the cart together, so a failure can't leave half an order
    with transaction.atomic():
        order = Order.objects.create(user=request.user, total_amount=total, **serializer.validated_data)
        OrderItem.objects.bulk_create([
            OrderItem(order=order, product=item.product, quantity=item.quantity, price=item.product.price)
            for item in items
        ])
        cart.items.all().delete()

    return Response({'message': 'Order created successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User created successfully", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
