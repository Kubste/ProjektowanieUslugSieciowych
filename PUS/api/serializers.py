from rest_framework import serializers
from database_manager.models import City, Route, RouteCity, ForecastData, Recommendation
from django.contrib.auth import get_user_model

User = get_user_model()

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'city_name', 'latitude', 'longitude']


class ForecastDataSerializer(serializers.ModelSerializer):
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())

    class Meta:
        model = ForecastData
        fields = [
            'id', 'city', 'date', 'temp', 'feels_like', 'pressure',
            'min_temp', 'max_temp', 'clouds', 'wind_speed',
            'visibility', 'description', 'alerts', 'main_weather'
        ]


class RouteCitySerializer(serializers.ModelSerializer):
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    route = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = RouteCity
        fields = ['id', 'route', 'city', 'position', 'arrival_date', 'departure_date']


class RecommendationSerializer(serializers.ModelSerializer):
    route = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['route'].queryset = Route.objects.filter(user=request.user)

    def validate_route(self, value):
        request = self.context.get('request')
        if request and value.user != request.user:
            raise serializers.ValidationError()
        return value

    class Meta:
        model = Recommendation
        fields = ['id', 'route', 'recommendation']


class RouteSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    route_cities = RouteCitySerializer(many=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'name', 'user', 'created_at',
            'starts_at', 'ends_at', 'route_cities', 'recommendations'
        ]

    def create(self, validated_data):
        route_cities_data = validated_data.pop('route_cities', [])
        route = Route.objects.create(**validated_data)
        for route_city_data in route_cities_data:
            RouteCity.objects.create(route=route, **route_city_data)
        return route
