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
            "temp": forecast.get("temp", {}).get("day", 0),
            "feels_like": forecast.get("feels_like", {}).get("day", 0),
            "pressure": forecast.get("pressure", 0),
            "humidity": forecast.get("humidity", 0),
            "min_temp": forecast.get("temp", {}).get("min", 0),
            "max_temp": forecast.get("temp", {}).get("max", 0),
            "clouds": forecast.get("clouds", 0),
            "wind_speed": forecast.get("speed", 0),
            "rain": forecast.get("rain", 0),
            "precipitation_probability": forecast.get("pop", 0),
            "description": forecast.get("weather", [{}])[0].get("description", ""),
            "main_weather": forecast.get("weather", [{}])[0].get("main", ""),
        }
        ForecastData.objects.update_or_create(
            city=city,
            date=forecast_date,
            defaults=defaults
        )

def fetch_and_save_forecasts_for_route(route):
    for route_city in route.route_cities.all():
        fetch_and_save_forecast(route_city)