from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("api/guests/", views.guest_create, name="guest_create"),
    path("api/guests/<int:guest_id>/", views.guest_update, name="guest_update"),
    path("api/guests/<int:guest_id>/delete/", views.guest_delete, name="guest_delete"),
]
