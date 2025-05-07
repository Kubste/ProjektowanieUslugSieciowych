from rest_framework.exceptions import PermissionDenied
from database_manager.models import City, Route, RouteCity, ForecastData, Recommendation
from .serializers import (CitySerializer, RouteSerializer, RouteCitySerializer, ForecastDataSerializer, RecommendationSerializer)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from weather_api.utils import fetch_and_save_forecasts_for_route
import requests
from django.conf import settings

class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def search(self, request):
        search_term = request.query_params.get('q', '')
        
        # Wyszukaj w lokalnej bazie danych
        local_results = City.objects.filter(city_name__icontains=search_term)
        
        if local_results.count() >= 5:
            serializer = self.get_serializer(local_results, many=True)
            return Response(serializer.data)
        
        # Jeśli mniej niż 5 wyników, zapytaj OpenWeather
        try:
            url = f"http://api.openweathermap.org/geo/1.0/direct?q={search_term}&limit=5&appid={settings.OPENWEATHER_API_KEY}"
            response = requests.get(url)
            response.raise_for_status()
            api_results = response.json()
            
            # Zapisz nowe miasta do bazy
            for city_data in api_results:
                city, created = City.objects.get_or_create(
                    city_name=city_data['name'],
                    defaults={
                        'latitude': float(city_data['lat']),
                        'longitude': float(city_data['lon'])
                    }
                )
            
            # Połącz wyniki
            combined_results = list(local_results) + [
                City(
                    city_name=city['name'],
                    latitude=float(city['lat']),
                    longitude=float(city['lon'])
                ) for city in api_results
            ][:5]
            
            serializer = self.get_serializer(combined_results, many=True)
            return Response(serializer.data)
            
        except requests.RequestException as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
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

    @action(detail=False, methods=['post'])
    def fetch_forecast(self, request):
        city_id = request.data.get('cityId')
        start_date = request.data.get('startDate')
        end_date = request.data.get('endDate')

        try:
            city = City.objects.get(id=city_id)
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()

            # Pobierz istniejące prognozy
            existing_forecasts = ForecastData.objects.filter(
                city=city,
                date__range=[start, end]
            )

            # Sprawdź, czy potrzebujemy nowych danych
            dates_to_fetch = []
            current_date = start
            while current_date <= end:
                if not existing_forecasts.filter(date=current_date).exists():
                    dates_to_fetch.append(current_date)
                current_date += timedelta(days=1)

            if dates_to_fetch:
                # Pobierz nowe dane z OpenWeather
                weather_client = OpenWeatherClient(api_key=settings.OPENWEATHER_API_KEY)
                data = weather_client.get_daily_forecast_by_city(city.city_name)
                forecasts = weather_client.filter_forecasts_by_dates(data, start, end)

                for date, forecast in forecasts.items():
                    ForecastData.objects.update_or_create(
                        city=city,
                        date=date,
                        defaults={
                            'temp': forecast.get('temp', {}).get('day'),
                            'feels_like': forecast.get('feels_like', {}).get('day'),
                            # ... (inne pola prognozy)
                        }
                    )

            # Zwróć wszystkie prognozy dla zakresu dat
            all_forecasts = ForecastData.objects.filter(
                city=city,
                date__range=[start, end]
            ).order_by('date')

            serializer = self.get_serializer(all_forecasts, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': str(e)}, status=400)
        

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
