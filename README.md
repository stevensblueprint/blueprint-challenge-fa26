# LibraryConnect Resource Hub

## Welcome to the Fall 2026 Coding Challenge!

To complete the challenge, please fork this repository, create a branch for your changes, and open a pull request against `main` when you're ready to submit your challenge. Please label your pull request with your name, such as `[Your Name] - Short description of your changes`.  

Details below, and good luck!

## Background

LibraryConnect is a public library system that helps patrons discover books and manages the lending process across its branches.

Currently, staff track the catalog and checkouts using spreadsheets, email, and paper forms. This process is inefficient and makes it difficult to:

- Keep catalog information up to date
- Quickly search for relevant books
- Track which patrons checked out which books
- Understand usage and demand across the collection

LibraryConnect has asked Blueprint to design and build a simple internal web application that centralizes catalog information and checkout tracking in one place.

The goal is to create a lightweight tool that staff can use daily to manage the book catalog and record checkouts.

---

## Product Goal

Build a full-stack web application that allows library staff to:

- Manage the book catalog
- Search and filter available books
- Record and view checkouts made to patrons

The application should include:

- React frontend
- FastAPI backend
- PostgreSQL database

---

## Feature — Book Management

### Context

LibraryConnect maintains a catalog of books across its branches. Staff frequently need to add new books, update existing ones, and browse the catalog when assisting patrons.

The system should allow staff to store structured information about each book and view it later.

### Requirements

The system must allow staff to:

- Create a new book
- View a list of all books
- View details of a single book

Each book must include:

| Field | Type |
|---|---|
| Title | string |
| Genre | enum (`Fiction`, `Non-Fiction`, `Children`, `Reference`, `Periodical`, `Other`) |
| Description | text |
| Author | string |
| Publisher email | email |
| Shelf location / call number | string |

---

## Feature — Search and Filtering

### Context

When working with patrons, staff often need to quickly find relevant books (for example: children's books or reference material). Searching manually through spreadsheets is slow and error-prone.

The system should support quick discovery of books through search and genre filtering.

### Requirements

The system must allow staff to:

- Search books by title
- Filter books by genre

Search and filters should apply to the book list view.

---

## Feature — Checkout Tracking

### Context

When a patron borrows a book, staff record a checkout. Tracking checkouts helps LibraryConnect understand which books are most popular and ensures follow-up on overdue returns.

Currently, checkouts are tracked in notes or emails and are difficult to track historically.

The system should allow staff to record checkouts linked to specific books.

### Requirements

The system must allow staff to:

- Create a checkout for a book
- View checkouts associated with a book

Each checkout must include:

| Field | Type |
|---|---|
| Patron name | string |
| Book | foreign key → Book |
| Date | date |
| Notes | text |

---

## Frontend Requirements

### Context

LibraryConnect staff are not technical users. The interface should be simple, clear, and easy to navigate so staff can quickly access catalog information and record checkouts during patron interactions.

### Requirements

The frontend must include:

- Book list page
- Book creation form
- Book detail page
- Checkout creation form

The frontend must:

- Communicate with the FastAPI backend via API calls
- Display data from the database
- Submit forms to create books and checkouts

---

## Backend Requirements

### Context

The backend will serve as the system of record for books and checkouts. It must expose a clean API that the frontend can use and ensure data validation and persistence.

### Requirements

The backend must:

- Provide REST API endpoints for books and checkouts
- Validate request data
- Store and retrieve data from PostgreSQL

### Expected Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/books` | Create a new book |
| `GET` | `/books` | List all books (supports search & genre filter) |
| `GET` | `/books/{id}` | Get details of a single book |
| `POST` | `/checkouts` | Create a checkout |
| `GET` | `/books/{id}/checkouts` | List checkouts for a book |

---

## Starter Implementation Included

This repository now includes a starter full-stack implementation with:

- `frontend/` React + Vite UI for book list/search/filter, book creation, book detail, and checkout creation
- `backend/` FastAPI REST API with PostgreSQL persistence for books and checkouts
- `docker-compose.yml` PostgreSQL + backend + frontend services

### Run with Docker

From the repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Smoke Tests with curl

After `docker compose up --build` is running in another terminal:

```bash
./scripts/smoke-test.sh
```

What it verifies:

- `GET http://localhost:8000/` returns a backend health payload
- `GET http://localhost:8000/docs` is reachable
- `GET http://localhost:5173` serves HTML from the frontend

### Backend Tests (pytest)

From the repository root, install backend test dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

```bash
python3 -m pip install -r requirements.txt
```

Run all backend tests:

```bash
cd ..
python3 -m pytest -q backend/tests
```

### Frontend Tests (Jest)

From the repository root, install frontend dependencies:

```bash
cd frontend
npm ci
```

Run all frontend tests:

```bash
npm test -- --runInBand
```

### Automated pass/fail grading

GitHub Actions runs **Challenge tests** on every push and pull request, and can
also be run manually from the Actions tab. Python 3.12 runs the backend pytest
suite; Node.js 22 runs the frontend Jest suite. No running servers or Docker
containers are needed: backend tests use an isolated SQLite database, and
frontend tests run in jsdom with mocked API calls.

Use the **Grade** check on the submission's latest commit:

- **PASS**: both Backend tests and Frontend tests passed.
- **FAIL**: either suite failed or did not complete successfully. Open its job
  log for the failing test or setup error; rerun after resolving setup failures.

The unimplemented starter is expected to fail. These tests do not replace the
challenge TODOs with a solution. Builds, lint, and Docker smoke checks are not
additional grading requirements.

The frontend tests use the supplied API exports, component props, section
headings, labels, and catalog rows. Preserve these testing interfaces when
completing the TODOs. Within them, automatic or manual loading, immediate or
debounced filtering, client-side or API filtering, and refetching or updating
local state after creation are supported. HTTP assertions allow default GET,
either query parameter order, header casing differences, JSON key order
differences, and string or numeric checkout book IDs. Tests still require the
correct requests, saved field values, and displayed results.

Use the repository's test files and workflow unchanged when grading submissions.
A green check reports these automated requirements; it does not verify visual
design or PostgreSQL deployment.

### Stop Services

```bash
docker compose down
```

---
