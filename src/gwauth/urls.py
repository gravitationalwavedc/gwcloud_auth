from django.urls import path

from gwauth.views import ligo_auth, ligo_continue

urlpatterns = [
    path("ligo/", ligo_auth, name="ligo_auth"),
    path("ligo_continue/<str:token>", ligo_continue, name="ligo_continue"),
]
