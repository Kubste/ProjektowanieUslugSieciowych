import requests
from datetime import datetime
from django.conf import settings


def fetch_16day_forecast(city):
    url = "https://api.openweathermap.org/data/2.5/forecast/daily"
    params = {
        "q": city,
        "cnt": 16,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "pl",
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        daily_forecasts = data.get("list", [])
        for entry in daily_forecasts:
            entry['date'] = datetime.fromtimestamp(entry["dt"]).date()
        return daily_forecasts
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")


def get_forecast_for_route_city(route_city):
    forecasts = fetch_16day_forecast(route_city.city)
    chosen_forecasts = []
    for forecast in forecasts:
        forecast_date = forecast["date"]
        if route_city.arrival_date <= forecast_date <= route_city.departure_date:
            chosen_forecasts.append(forecast)
    return chosen_forecasts
