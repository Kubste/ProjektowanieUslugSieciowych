from django.core.management.base import BaseCommand
from database_manager.models import ForecastData, City
from django.conf import settings
from datetime import datetime
import requests
import time

class Command(BaseCommand):
    help = 'Update missing weather icons for existing forecasts'

    def handle(self, *args, **options):
        # Pobierz prognozy bez ikon
        forecasts = ForecastData.objects.filter(icon__isnull=True)
        
        if not forecasts.exists():
            self.stdout.write(self.style.SUCCESS('All forecasts already have icons'))
            return

        self.stdout.write(f'Updating icons for {forecasts.count()} forecasts...')

        updated_count = 0
        errors = 0

        for forecast in forecasts:
            try:
                # Pobierz współrzędne miasta
                city = forecast.city
                if not city.latitude or not city.longitude:
                    self.stdout.write(f'Skipping {city} - missing coordinates')
                    continue

                # Pobierz dane historyczne
                timestamp = int(time.mktime(forecast.date.timetuple()))
                
                params = {
                    'lat': city.latitude,
                    'lon': city.longitude,
                    'dt': timestamp,
                    'units': 'metric',
                    'appid': settings.OPENWEATHER_API_KEY
                }

                response = requests.get('https://api.openweathermap.org/data/2.5/onecall/timemachine', params=params)
                response.raise_for_status()
                data = response.json()

                if data.get('current', {}).get('weather', []):
                    forecast.icon = data['current']['weather'][0]['icon']
                    forecast.save()
                    updated_count += 1
                    self.stdout.write(f'Updated icon for {forecast.city} on {forecast.date}')
                else:
                    self.stdout.write(f'No weather data found for {forecast.city} on {forecast.date}')
                
                # Ogranicz zapytania do 60/min (limit OpenWeatherMap)
                time.sleep(1)

            except requests.RequestException as e:
                errors += 1
                self.stdout.write(self.style.ERROR(f'Error for {forecast.city} on {forecast.date}: {str(e)}'))
                continue

        self.stdout.write(self.style.SUCCESS(
            f'Successfully updated {updated_count} forecasts. Errors: {errors}'
        ))