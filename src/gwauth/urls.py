from django.urls import path

from gwauth.views import ligo_auth

urlpatterns = [
    path("ligo/", ligo_auth, name="ligo_auth")
]
