from django.db import models
from django.conf import settings

class City(models.Model):
    city_name = models.CharField(max_length=64, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        verbose_name = "City"
        verbose_name_plural = "Cities"
        ordering = ["city_name"]

    def __str__(self):
        return self.city_name


class Route(models.Model):
    name = models.CharField(max_length=128)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="routes")
    created_at = models.DateTimeField(auto_now_add=True)
    starts_at = models.DateField(null=False, blank=False)
    ends_at = models.DateField(null=False, blank=False)

    class Meta:
        verbose_name = "Route"
        verbose_name_plural = "Routes"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.name} ({self.user})"


class RouteCity(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="route_cities")
    city = models.ForeignKey(City, on_delete=models.PROTECT, related_name="in_routes")
    position = models.PositiveIntegerField()
    arrival_date = models.DateField(null=False, blank=False)
    departure_date = models.DateField(null=False, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["route", "position"], name="unique_route_position")
        ]
        ordering = ["route", "position"]
        verbose_name = "Route City"
        verbose_name_plural = "Route Cities"

    def __str__(self):
        return f"{self.route.name} : {self.city.city_name} (#{self.position})"


class ForecastData(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="forecasts")
    date = models.DateField()
    temp = models.FloatField()
    feels_like = models.FloatField()
    pressure = models.IntegerField()
    humidity = models.IntegerField()
    min_temp = models.FloatField()
    max_temp = models.FloatField()
    clouds = models.IntegerField()
    wind_speed = models.FloatField()
    rain = models.FloatField()
    precipitation_probability = models.FloatField()
    description = models.TextField(null=True, blank=True)
    main_weather = models.CharField(max_length=64)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["city", "date"], name="unique_forecast_per_city")
        ]
        verbose_name = "Forecast Data"
        verbose_name_plural = "Forecast Data"
        ordering = ["city", "-date"]

    def __str__(self):
        return f"{self.city.city_name} — {self.date}"


class Recommendation(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="recommendations")
    recommendation = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["route"]
        verbose_name = "Recommendation"
        verbose_name_plural = "Recommendations"

    def __str__(self):
        return f"Recommendation for {self.route.name}"