import os

from django.conf import settings
from django.core.files import File
from django.core.files.storage import FileSystemStorage, default_storage
from django.core.management.base import BaseCommand, CommandError

from store.models import Product


class Command(BaseCommand):
    help = (
        'Upload product images from the local media/ folder to the configured storage. '
        'Run it with CLOUDINARY_URL and DATABASE_URL set to copy your photos to production.'
    )

    def handle(self, *args, **options):
        if isinstance(default_storage, FileSystemStorage):
            raise CommandError('Storage is the local media/ folder. Set CLOUDINARY_URL to upload to Cloudinary.')

        local_media = settings.BASE_DIR / 'media'
        uploaded = missing = 0

        for product in Product.objects.exclude(image=''):
            local_path = local_media / product.image.name
            if not local_path.exists():
                self.stdout.write(self.style.WARNING(f'No local file for {product.name}: {local_path}'))
                missing += 1
                continue

            with open(local_path, 'rb') as f:
                product.image.save(os.path.basename(local_path), File(f), save=True)
            uploaded += 1
            self.stdout.write(f'Uploaded {product.name}')

        self.stdout.write(self.style.SUCCESS(f'Uploaded {uploaded} images, {missing} missing.'))
