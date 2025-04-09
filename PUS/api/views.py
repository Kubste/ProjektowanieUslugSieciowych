from rest_framework.exceptions import PermissionDenied
from database_manager.models import City, Route, RouteCity, ForecastData, Recommendation
from .serializers import (CitySerializer, RouteSerializer, RouteCitySerializer, ForecastDataSerializer, RecommendationSerializer)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from weather_api.utils import fetch_and_save_forecasts_for_route

class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return City.objects.all()


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Route.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    #adres endpointu: http://127.0.0.1:8000/api/route/<route id>/update_forecast/ -u "<username>:<password>"
    @action(detail=True, methods=['post'], url_path='update_forecast')
    def update_forecasts(self, request, pk=None):
        route = self.get_object()
        fetch_and_save_forecasts_for_route(route)
        return Response({"detail": "Dane pogodowe zostały zaktualizowane."}, status=status.HTTP_200_OK)


class RouteCityViewSet(viewsets.ModelViewSet):
    queryset = RouteCity.objects.all()
    serializer_class = RouteCitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RouteCity.objects.filter(route__user=self.request.user)


class ForecastDataViewSet(viewsets.ModelViewSet):
    queryset = ForecastData.objects.all()
    serializer_class = ForecastDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ForecastData.objects.filter(city__in=City.objects.filter(in_routes__route__user=self.request.user))


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Recommendation.objects.filter(route__user=self.request.user)

    def perform_create(self, serializer):
        route = serializer.validated_data['route']
        if route.user != self.request.user:
            raise PermissionDenied()
        serializer.save()
