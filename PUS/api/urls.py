from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CityViewSet, RouteViewSet, RouteCityViewSet, ForecastDataViewSet, RecommendationViewSet

app_name = 'api'

router = DefaultRouter()

router.register(r'route', RouteViewSet)
router.register(r'route_city', RouteCityViewSet)
router.register(r'forecast_data', ForecastDataViewSet)
router.register(r'recommendation', RecommendationViewSet)
router.register(r'city', CityViewSet, basename='city')
router.register(r'forecast', ForecastDataViewSet, basename='forecast')

urlpatterns = [
path('', include(router.urls)),
]
