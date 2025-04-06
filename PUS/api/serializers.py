from rest_framework import serializers
from database_manager.models import City, Route, RouteCity, ForecastData, Recommendation
from django.contrib.auth import get_user_model

User = get_user_model()

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'city_name', 'latitude', 'longitude']


class ForecastDataSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)

    class Meta:
        model = ForecastData
        fields = [
            'id', 'city', 'date', 'temp', 'feels_like', 'pressure',
            'min_temp', 'max_temp', 'clouds', 'wind_speed',
            'visibility', 'description', 'alerts', 'main_weather'
        ]


class RouteCitySerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)

    class Meta:
        model = RouteCity
        fields = ['id', 'route', 'city', 'position']


class RecommendationSerializer(serializers.ModelSerializer):
    route = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'route', 'recommendation']


class RouteSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    route_cities = RouteCitySerializer(many=True, read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'name', 'user', 'created_at',
            'starts_at', 'ends_at', 'route_cities', 'recommendations'
        ]