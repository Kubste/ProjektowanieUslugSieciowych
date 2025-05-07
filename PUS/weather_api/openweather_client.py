import requests
from datetime import datetime, timedelta
from django.core.cache import cache
from django.conf import settings

class OpenWeatherClient:
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self, api_key):
        self.api_key = api_key

    def get_daily_forecast_by_city(self, city_name):
        cache_key = f"weather_forecast_{city_name.lower()}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
            
        params = {
            "q": city_name,
            "cnt": 16,
            "units": "metric",
            "appid": self.api_key
        }
        
        try:
            response = requests.get(f"{self.BASE_URL}/forecast/daily", params=params)
            response.raise_for_status()
            data = response.json()
            
            # Cache for 1 hour
            cache.set(cache_key, data, 3600)
            return data
        except requests.RequestException as e:
            # Fallback to 3-hour forecast if daily not available
            try:
                return self.get_3hour_forecast_by_city(city_name)
            except:
                raise e

    def get_3hour_forecast_by_city(self, city_name):
        params = {
            "q": city_name,
            "units": "metric",
            "appid": self.api_key
        }
        
        response = requests.get(f"{self.BASE_URL}/forecast", params=params)
        response.raise_for_status()
        return response.json()

    def filter_forecasts_by_dates(self, data, arrival_date, departure_date):
        filtered = {}
        
        # Handle daily forecast format
        if "list" in data and isinstance(data["list"], list) and "temp" in data["list"][0]:
            for day in data.get("list", []):
                forecast_date = datetime.fromtimestamp(day["dt"]).date()
                if arrival_date <= forecast_date <= departure_date:
                    filtered[forecast_date] = day
        
        # Handle 3-hour forecast format
        elif "list" in data and isinstance(data["list"], list):
            current_date = arrival_date
            while current_date <= departure_date:
                daily_data = {
                    "temp": {"day": 0, "min": 1000, "max": -1000},
                    "feels_like": {"day": 0},
                    "pressure": 0,
                    "humidity": 0,
                    "weather": [],
                    "clouds": 0,
                    "speed": 0,
                    "rain": 0,
                    "pop": 0,
                    "count": 0
                }
                
                for forecast in data["list"]:
                    forecast_date = datetime.fromtimestamp(forecast["dt"]).date()
                    if forecast_date == current_date:
                        # Aggregate 3-hour data into daily
                        daily_data["temp"]["day"] += forecast["main"]["temp"]
                        daily_data["temp"]["min"] = min(daily_data["temp"]["min"], forecast["main"]["temp_min"])
                        daily_data["temp"]["max"] = max(daily_data["temp"]["max"], forecast["main"]["temp_max"])
                        daily_data["feels_like"]["day"] += forecast["main"]["feels_like"]
                        daily_data["pressure"] += forecast["main"]["pressure"]
                        daily_data["humidity"] += forecast["main"]["humidity"]
                        daily_data["clouds"] += forecast["clouds"]["all"]
                        daily_data["speed"] += forecast["wind"]["speed"]
                        daily_data["rain"] += forecast.get("rain", {}).get("3h", 0)
                        daily_data["pop"] += forecast.get("pop", 0)
                        daily_data["count"] += 1
                        
                        if not daily_data["weather"]:
                            daily_data["weather"] = forecast["weather"]
                
                if daily_data["count"] > 0:
                    # Calculate averages
                    daily_data["temp"]["day"] /= daily_data["count"]
                    daily_data["feels_like"]["day"] /= daily_data["count"]
                    daily_data["pressure"] /= daily_data["count"]
                    daily_data["humidity"] /= daily_data["count"]
                    daily_data["clouds"] /= daily_data["count"]
                    daily_data["speed"] /= daily_data["count"]
                    daily_data["pop"] /= daily_data["count"]
                    
                    filtered[current_date] = daily_data
                
                current_date += timedelta(days=1)
        
        return filtered