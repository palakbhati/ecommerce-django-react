from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_cart_cartitem'),
    ]

    operations = [
        migrations.RenameField(
            model_name='orderitem',
            old_name='Product',
            new_name='product',
        ),
        migrations.AddField(
            model_name='order',
            name='name',
            field=models.CharField(default='', max_length=100),
        ),
        migrations.AddField(
            model_name='order',
            name='address',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='order',
            name='phone',
            field=models.CharField(default='', max_length=15),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('COD', 'Cash on Delivery'), ('ONLINE', 'Online Payment')], default='COD', max_length=10),
        ),
    ]
