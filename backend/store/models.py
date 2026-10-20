from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='product/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)

    def __str__(self):
        return self.user.username

class Order(models.Model):
    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('ONLINE', 'Online Payment'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    address = models.TextField(default='')
    phone = models.CharField(max_length=15, default='')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='COD')
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Order {self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart {self.id} for {self.user}"
    
    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"
