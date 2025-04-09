import requests
from datetime import datetime

class OpenWeatherClient:
    BASE_URL = "https://api.openweathermap.org/data/2.5/forecast/daily"

    def __init__(self, api_key):
        self.api_key = api_key

    def get_daily_forecast_by_city(self, city_name):
        params = {
            "q": city_name,
            "cnt": 16,
            "units": "metric",
            "appid": self.api_key
        }
        response = requests.get(self.BASE_URL, params=params)
        response.raise_for_status()
        return response.json()

    def filter_forecasts_by_dates(self, data, arrival_date, departure_date):
        filtered = {}
        for day in data.get("list", []):
            forecast_date = datetime.fromtimestamp(day["dt"]).date()
            if arrival_date <= forecast_date <= departure_date:
                filtered[forecast_date] = day
        return filtered
