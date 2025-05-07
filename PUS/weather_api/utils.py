from django.conf import settings
from datetime import datetime, timedelta
import requests
from database_manager.models import ForecastData, City
from .openweather_client import OpenWeatherClient

def fetch_and_save_city_coordinates(city):
    if city.latitude and city.longitude:
        return
        
    weather_client = OpenWeatherClient(api_key=settings.OPENWEATHER_API_KEY)
    
    try:
        # Use current weather API to get coordinates
        params = {
            "q": city.city_name,
            "appid": settings.OPENWEATHER_API_KEY
        }
        response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params)
        response.raise_for_status()
        data = response.json()
        
        city.latitude = data["coord"]["lat"]
        city.longitude = data["coord"]["lon"]
        city.save()
    except requests.RequestException as e:
        print(f"Error fetching coordinates for city {city.city_name}: {e}")

def fetch_and_save_forecast(route_city):
    city = route_city.city
    arrival_date = route_city.arrival_date
    departure_date = route_city.departure_date

    if not city.city_name:
        return

    # First ensure we have coordinates
    fetch_and_save_city_coordinates(city)

    weather_client = OpenWeatherClient(api_key=settings.OPENWEATHER_API_KEY)

    try:
        data = weather_client.get_daily_forecast_by_city(city.city_name)
    except requests.RequestException as e:
        print(f"Error for city {city.city_name}: {e}")
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
            "snow": forecast.get("snow", 0),
            "precipitation_probability": forecast.get("pop", 0),
            "description": forecast.get("weather", [{}])[0].get("description", ""),
            "main_weather": forecast.get("weather", [{}])[0].get("main", ""),
            "icon": forecast.get("weather", [{}])[0].get("icon", ""),
        }
        ForecastData.objects.update_or_create(
            city=city,
            date=forecast_date,
            defaults=defaults
        )

def fetch_and_save_forecasts_for_route(route):
    for route_city in route.route_cities.all():
        fetch_and_save_forecast(route_city)
        
    # Update route summary after updating all cities
    update_route_summary(route)

def update_route_summary(route):
    route_cities = route.route_cities.order_by('position')
    if not route_cities:
        return
        
    # Update start and end dates
    route.starts_at = route_cities.first().arrival_date
    route.ends_at = route_cities.last().departure_date
    
    # Calculate average temperature for the route
    forecasts = ForecastData.objects.filter(
        city__in=[rc.city for rc in route_cities],
        date__gte=route.starts_at,
        date__lte=route.ends_at
    )
    
    if forecasts.exists():
        route.avg_temp = sum(f.temp for f in forecasts) / forecasts.count()
    
    route.save()