from decimal import Decimal
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from PIL import Image, ImageDraw, ImageFont

from store.models import Category, Product

# category name -> (soft background colour for the generated image, [(product name, description, price)])
SEED_DATA = {
    'Electronics': ('#dfe3e6', [
        ('Wireless Earbuds', 'Bluetooth 5.3 earbuds with noise cancellation and 30-hour battery life.', '2499.00'),
        ('Smart Watch', 'Fitness tracking, heart-rate monitor and 7-day battery in a slim aluminium case.', '3999.00'),
        ('Portable Speaker', 'Waterproof Bluetooth speaker with deep bass and 12 hours of playback.', '1799.00'),
        ('Power Bank 20000mAh', 'Fast-charging power bank with USB-C PD that charges a phone four times.', '1499.00'),
        ('Mechanical Keyboard', 'Compact 75% keyboard with hot-swappable switches and RGB backlight.', '4599.00'),
    ]),
    'Clothing': ('#ebdcd6', [
        ('Cotton T-Shirt', 'Soft 100% cotton crew-neck tee in a relaxed everyday fit.', '499.00'),
        ('Denim Jacket', 'Classic blue denim jacket with button front and chest pockets.', '1999.00'),
        ('Hooded Sweatshirt', 'Warm fleece-lined hoodie with kangaroo pocket.', '1299.00'),
        ('Running Shoes', 'Lightweight breathable running shoes with cushioned sole.', '2799.00'),
        ('Slim Fit Chinos', 'Stretch cotton chinos that work for office and weekend.', '1499.00'),
    ]),
    'Books': ('#ece2cf', [
        ('Atomic Habits', 'James Clear on building good habits and breaking bad ones.', '399.00'),
        ('Clean Code', 'Robert C. Martin\'s handbook of agile software craftsmanship.', '899.00'),
        ('The Psychology of Money', 'Morgan Housel on timeless lessons about wealth and happiness.', '349.00'),
        ('Deep Work', 'Cal Newport on focused success in a distracted world.', '449.00'),
    ]),
    'Home & Kitchen': ('#dde3d7', [
        ('Stainless Steel Bottle', 'Insulated 1L bottle that keeps drinks cold for 24 hours.', '699.00'),
        ('Non-Stick Frying Pan', '28cm granite-coated pan, induction compatible.', '1199.00'),
        ('Ceramic Coffee Mug Set', 'Set of four 350ml mugs, microwave and dishwasher safe.', '799.00'),
        ('LED Desk Lamp', 'Dimmable desk lamp with three colour temperatures and USB port.', '1099.00'),
    ]),
    'Sports & Fitness': ('#e2dde6', [
        ('Yoga Mat', '6mm anti-slip yoga mat with carrying strap.', '899.00'),
        ('Adjustable Dumbbells', 'Pair of dumbbells adjustable from 2.5kg to 12kg.', '3499.00'),
        ('Skipping Rope', 'Speed rope with ball bearings and adjustable steel cable.', '299.00'),
        ('Gym Duffel Bag', 'Water-resistant 40L bag with separate shoe compartment.', '1299.00'),
    ]),
}


SERIF_FONTS = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
    '/Library/Fonts/Georgia.ttf',
    'C:/Windows/Fonts/georgia.ttf',
]


def load_font(size):
    """Use a serif font if the system has one, otherwise Pillow's built-in font."""
    for path in SERIF_FONTS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def make_image(title, category, colour):
    """Draw a minimal 800x1000 product image: soft background, serif title, small category label."""
    width, height = 800, 1000
    ink = '#3f3a36'
    img = Image.new('RGB', (width, height), colour)
    draw = ImageDraw.Draw(img)

    title_font = load_font(60)
    label_font = load_font(22)

    # Wrap the title onto multiple lines so it fits comfortably
    lines, line = [], ''
    for word in title.split():
        candidate = f'{line} {word}'.strip()
        if draw.textlength(candidate, font=title_font) > 560 and line:
            lines.append(line)
            line = word
        else:
            line = candidate
    lines.append(line)

    line_height = 76
    y = height // 2 - len(lines) * line_height // 2
    for text in lines:
        draw.text(((width - draw.textlength(text, font=title_font)) / 2, y), text, font=title_font, fill=ink)
        y += line_height

    # Thin rule above the title and the category name below it
    draw.line([(width / 2 - 30, height // 2 - len(lines) * line_height // 2 - 50),
               (width / 2 + 30, height // 2 - len(lines) * line_height // 2 - 50)], fill=ink, width=2)
    label = ' '.join(category.upper())
    draw.text(((width - draw.textlength(label, font=label_font)) / 2, y + 30), label, font=label_font, fill='#8a817a')

    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return ContentFile(buffer.getvalue())


class Command(BaseCommand):
    help = 'Create sample categories and products (with images) for demos and local development.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear', action='store_true',
            help='Delete all existing categories and products before seeding.',
        )
        parser.add_argument(
            '--refresh-images', action='store_true',
            help='Redraw the images of seeded products that already exist.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Deleted existing categories and products.'))

        created = refreshed = 0
        for category_name, (colour, products) in SEED_DATA.items():
            category, _ = Category.objects.get_or_create(
                slug=slugify(category_name), defaults={'name': category_name},
            )
            for name, description, price in products:
                existing = Product.objects.filter(name=name, category=category).first()
                if existing:
                    if options['refresh_images']:
                        existing.image.delete(save=False)
                        existing.image.save(f'{slugify(name)}.png', make_image(name, category_name, colour))
                        refreshed += 1
                    continue
                product = Product(category=category, name=name, description=description, price=Decimal(price))
                product.image.save(f'{slugify(name)}.png', make_image(name, category_name, colour), save=False)
                product.save()
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {created} new products across {len(SEED_DATA)} categories'
            + (f', refreshed {refreshed} images.' if refreshed else '.')
        ))
