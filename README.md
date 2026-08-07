# God's Nature — Prayer Guests

A simple Django web app for tracking prayer guests: their contact details, prayer notes, and whether they've been prayed for. Built with a Bauhaus-inspired UI, inline-editable table cells, and a details drawer — no page reloads needed for day-to-day use.

Link --> https://www.pythonanywhere.com/user/tardigrade/webapps/#tab_id_tardigrade_pythonanywhere_com

## Features

- **Inline editable table** — click any cell (name, age, phone, address) to edit and autosave on blur
- **Prayer notes popover** — click a notes cell to open a larger textarea for longer notes
- **Details drawer** — click the eye icon on a row to view all fields for a guest in a side panel
- **Prayed-for toggle** — click the checkmark column to mark a guest as prayed for
- **Live stats** — total guests, prayed-for count, and pending count update as you edit
- **Add / delete guests** — add a blank row and fill it in, or delete a row with confirmation

## Tech Stack

- **Backend:** Django 6.0 (Python)
- **Database:** SQLite
- **Frontend:** Vanilla JS (`fetch`-based API calls), Tailwind CSS (via `django-tailwind`), custom Bauhaus-themed CSS
- **Error tracking:** Sentry
- **Deployment:** PythonAnywhere, via GitHub Actions on every push to `main`

## Project Structure

```
config/            # Django project settings, URLs, WSGI/ASGI entrypoints
home/               # Main app: models, views, templates, static assets
  ├── models.py     # Guests model
  ├── views.py      # Page + JSON API views (create/update/delete)
  ├── urls.py       # App routes
  ├── templates/    # home.html
  └── static/       # styles.css, script.js
theme/              # Tailwind theme app (django-tailwind)
.github/workflows/  # Deployment workflow
```

## Data Model

The `Guests` model (`home/models.py`) stores:

| Field | Type | Notes |
|---|---|---|
| `name` | CharField | required |
| `age` | PositiveIntegerField | optional |
| `phone_number` | CharField | |
| `address` | CharField | |
| `prayer_notes` | TextField | optional |
| `prayed_for` | BooleanField | defaults to `False` |
| `created_at` / `updated_at` | DateTimeField | auto-managed |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Renders the guest list page |
| `POST` | `/api/guests/` | Create a new guest (requires `name`) |
| `PATCH` | `/api/guests/<id>/` | Update one or more fields on a guest |
| `DELETE` | `/api/guests/<id>/delete/` | Delete a guest |

All write endpoints expect and return JSON, and are protected by Django's CSRF middleware (the page sets a CSRF cookie via `@ensure_csrf_cookie`).

## Getting Started

### Prerequisites

- Python 3.10+
- pip / virtualenv
- Node.js (only needed if you're modifying Tailwind source, via `django-tailwind`)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd <repo-folder>

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Build Tailwind CSS (first time / after style changes)
python manage.py tailwind build   # or `tailwind start` for dev watch mode

# Run the development server
python manage.py runserver
```

Then visit `http://127.0.0.1:8000/`.

### Creating an admin user (optional)

Guests can also be managed via the Django admin at `/admin/`:

```bash
python manage.py createsuperuser
```

## Configuration Notes

This project currently has some development-only settings checked into `config/settings.py` (secret key, `DEBUG = True`, a Sentry DSN, and a stray API token) that should be moved to environment variables before treating this as production-ready. A typical approach:

```python
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which redeploys the app on PythonAnywhere and reloads the webapp (with retry logic for transient `409` conflicts). This requires the following GitHub Actions secrets to be set:

- `PA_USERNAME`
- `PA_API_TOKEN`
- `PA_DOMAIN`
