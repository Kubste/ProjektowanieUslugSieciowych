from django.conf import settings
from datetime import datetime
import requests
from database_manager.models import ForecastData
from .openweather_client import OpenWeatherClient

def fetch_and_save_forecast(route_city):
    city = route_city.city
    arrival_date = route_city.arrival_date
    departure_date = route_city.departure_date

    if not city.city_name:
        return

    weather_client = OpenWeatherClient(api_key=settings.OPENWEATHER_API_KEY)

    try:
        data = weather_client.get_daily_forecast_by_city(city.city_name)
    except requests.RequestException as e:
        print(f"Błąd dla miasta: {city.city_name}: {e}")
        return

    forecasts = weather_client.filter_forecasts_by_dates(data, arrival_date, departure_date)

    for forecast_date, forecast in forecasts.items():
        defaults = {
            "temp": forecast["temp"]["day"],
            "feels_like": forecast["feels_like"]["day"],
            "pressure": forecast["pressure"],
            "min_temp": forecast["temp"]["min"],
            "max_temp": forecast["temp"]["max"],
            "clouds": forecast["clouds"],
            "wind_speed": forecast["speed"],
            "visibility": 0,    # nie ma visibility
            "description": forecast["weather"][0]["description"],
            "alerts": "",
            "main_weather": forecast["weather"][0]["main"],
        }
        ForecastData.objects.update_or_create(
            city=city,
            date=forecast_date,
            defaults=defaults
        )

def fetch_and_save_forecasts_for_route(route):
    for route_city in route.route_cities.all():
        fetch_and_save_forecast(route_city)