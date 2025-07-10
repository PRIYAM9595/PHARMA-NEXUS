from django.core.management.base import BaseCommand
from pharmacy.models import DrugData
import csv
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Import drug data from dataset.csv into DrugData model.'

    def handle(self, *args, **options):
        csv_path = os.path.join(settings.BASE_DIR, 'dataset.csv')
        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f'File not found: {csv_path}'))
            return

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                obj, created = DrugData.objects.get_or_create(
                    name=row['Name'],
                    category=row['Category'],
                    dosage_form=row['Dosage Form'],
                    strength=row['Strength'],
                    manufacturer=row['Manufacturer'],
                    indication=row['Indication'],
                    classification=row['Classification'],
                )
                if created:
                    count += 1
            self.stdout.write(self.style.SUCCESS(f'Imported {count} new records into DrugData.')) 