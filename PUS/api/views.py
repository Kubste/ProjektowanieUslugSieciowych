from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from database_manager.models import City, Route, RouteCity, ForecastData, Recommendation
from .serializers import (
    CitySerializer, RouteSerializer, RouteCitySerializer,
    ForecastDataSerializer, RecommendationSerializer
)

class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsAuthenticated]


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RouteCityViewSet(viewsets.ModelViewSet):
    queryset = RouteCity.objects.all()
    serializer_class = RouteCitySerializer
    permission_classes = [IsAuthenticated]


class ForecastDataViewSet(viewsets.ModelViewSet):
    queryset = ForecastData.objects.all()
    serializer_class = ForecastDataSerializer
    permission_classes = [IsAuthenticated]


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]
