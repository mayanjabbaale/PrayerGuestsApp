from django.db import models


class Guests(models.Model):
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=200)
    prayer_notes = models.TextField(blank=True, null=True)

    prayed_for = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
