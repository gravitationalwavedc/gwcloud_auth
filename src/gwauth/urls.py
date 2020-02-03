from django.urls import path

urlpatterns = [
    path("ligo/", ligo_auth, "ligo_auth")
]