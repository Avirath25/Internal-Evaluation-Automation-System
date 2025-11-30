from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # send all app routes to core.urls
    path("", include("core.urls")),
]
