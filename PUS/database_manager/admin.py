from django.contrib import admin
from .models import City, Route, RouteCity, ForecastData, Recommendation

# Register your models here.
admin.site.register(City)
admin.site.register(Route)
admin.site.register(RouteCity)
admin.site.register(ForecastData)
admin.site.register(Recommendation)
