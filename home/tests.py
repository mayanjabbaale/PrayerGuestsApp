from django.test import TestCase
from home.models import Guests


class GuestsModelTests(TestCase):
    def test_str_returns_name(self):
        g = Guests.objects.create(name="Alice", age=30, phone_number="0700", address="Kampala")
        self.assertEqual(str(g), "Alice")

    def test_default_prayed_for_is_false(self):
        g = Guests.objects.create(name="Bob", age=25, phone_number="0701", address="Jinja")
        self.assertFalse(g.prayed_for)

    def test_created_at_and_updated_at_set_automatically(self):
        g = Guests.objects.create(name="Carol", age=40, phone_number="0702", address="Entebbe")
        self.assertIsNotNone(g.created_at)
        self.assertIsNotNone(g.updated_at)

    def test_optional_fields_can_be_blank(self):
        Guests.objects.create(name="Dan", age=22, phone_number="0703", address="Mbale",
                              prayer_notes="")
        # prayer_notes is blank=True, null=True so should accept empty string
        self.assertEqual(Guests.objects.filter(name="Dan").count(), 1)
