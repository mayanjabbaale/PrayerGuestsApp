import json

from django.http import (
    JsonResponse,
    HttpResponseBadRequest,
    HttpResponseNotAllowed,
)
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Guests


def _serialize(g):
    """Convert a Guests row into a JSON-safe dict matching the template."""
    return {
        "id": g.id,
        "name": g.name or "",
        "age": g.age,
        "phone_number": g.phone_number or "",
        "address": g.address or "",
        "prayer_notes": g.prayer_notes or "",
        "prayed_for": bool(g.prayed_for),
    }


def _apply(g, data):
    """Apply a dict of fields to a Guests row, ignoring unknown keys.

    Raises ValueError if `age` is provided but cannot be parsed as an integer.
    """
    if "name" in data:
        g.name = data["name"] or ""
    if "age" in data:
        raw = data["age"]
        if raw in ("", None):
            g.age = None
        else:
            try:
                g.age = int(raw)
            except (TypeError, ValueError):
                raise ValueError("age must be an integer")
    if "phone_number" in data:
        g.phone_number = data["phone_number"] or ""
    if "address" in data:
        g.address = data["address"] or ""
    if "prayer_notes" in data:
        g.prayer_notes = data["prayer_notes"] or ""
    if "prayed_for" in data:
        g.prayed_for = bool(data["prayed_for"])


def _method_or_405(request, *allowed):
    """
    Return None if request.method is allowed,
    else an HttpResponseNotAllowed.
    """
    if request.method in allowed:
        return None
    return HttpResponseNotAllowed(allowed)


@ensure_csrf_cookie
def home(request):
    """
    Render the guests page.
    CSRF cookie is set so fetch() can authenticate.
    """
    guests = Guests.objects.all()
    return render(request, "home/home.html", {"guests": guests})


def guest_create(request):
    if (resp := _method_or_405(request, "POST")) is not None:
        return resp
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return HttpResponseBadRequest("invalid JSON")

    g = Guests()
    try:
        _apply(g, data)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))
    if not g.name:
        return HttpResponseBadRequest("name is required")
    g.save()
    return JsonResponse(_serialize(g), status=201)


def guest_update(request, guest_id):
    if (resp := _method_or_405(request, "PATCH")) is not None:
        return resp
    try:
        g = Guests.objects.get(pk=guest_id)
    except Guests.DoesNotExist:
        return HttpResponseBadRequest("not found")

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return HttpResponseBadRequest("invalid JSON")

    try:
        _apply(g, data)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))
    g.save()
    return JsonResponse(_serialize(g))


def guest_delete(request, guest_id):
    if (resp := _method_or_405(request, "DELETE")) is not None:
        return resp
    Guests.objects.filter(pk=guest_id).delete()
    return JsonResponse({"ok": True})
