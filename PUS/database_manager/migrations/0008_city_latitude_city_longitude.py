# Generated by Django 5.1.7 on 2025-04-09 21:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database_manager', '0007_remove_city_latitude_remove_city_longitude'),
    ]

    operations = [
        migrations.AddField(
            model_name='city',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='city',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
    ]
