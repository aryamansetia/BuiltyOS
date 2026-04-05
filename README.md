# BuiltyOS MVP

Production-ready MVP to digitize local goods transport agency workflows and connect agencies with business customers.

## Recent upgrades (April 2026)

- Agency dashboard redesigned into a modular SaaS layout (action bar, KPI cards, route management, operations panel, activity feed).
- Incoming Booking Management upgraded into an interactive data interface with search, status tabs, row actions, expandable details, and pagination.
- Worker role introduced with workforce modules:
  - Transport Load Marketplace
  - Jobs and recruitment workflow
  - Open applications pipeline
- New backend modules and APIs for loads, jobs, and applications.
- Tracking page upgraded to a live OpenStreetMap-based view using React Leaflet.

## What this project solves

This platform replaces manual transport processes with a connected digital flow:

1. Customer books shipment.
2. Agency generates LR/Builty.
3. Agency creates dispatch challan and assigns vehicle.
4. GPS tracking links LR to vehicle location.
5. Agency creates arrival challan.
6. Agency confirms delivery.

Shipment status progression:

`Booked -> Dispatched -> Arrived -> Delivered`

## Tech stack

- Frontend: React + React Router + Axios + i18next + React Leaflet + Leaflet
- Backend: Node.js + Express + JWT Auth + express-validator
- Database: MongoDB + Mongoose
- Security: bcrypt password hashing + JWT-protected APIs + role-based access

## Project structure

```text
BuiltyOS/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seed/
      services/
      utils/
    .env.example
    package.json
  frontend/
    src/
      api/
      components/
        agency/
          bookings/
      context/
      i18n/
        locales/
      pages/
        agency/
        common/
        customer/
        workforce/
      styles/
    .env.example
    package.json
  docs/
    api-samples.http
  .gitignore
  README.md
```

## Backend setup (step-by-step)

1. Open terminal in `backend`.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and set values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/builtyos
JWT_SECRET=replace_this_with_a_strong_secret
JWT_EXPIRES_IN=7d
GPS_SIMULATION_INTERVAL_MS=20000
FRONTEND_URL=http://localhost:5173
```

4. Seed dummy data:

```bash
npm run seed
```

5. Run backend server:

```bash
npm run dev
```

Backend base URL: `http://localhost:5000/api`

## Frontend setup (step-by-step)

1. Open terminal in `frontend`.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Dummy users (after seed)

- Agency user
  - Email: `agency@builtyos.com`
  - Password: `Password123`

- Customer user
  - Email: `customer@builtyos.com`
  - Password: `Password123`

- Worker user
  - Not seeded by default.
  - Create through register API/UI with `role: worker`.
  - Sample payload is available in `docs/api-samples.http`.

Seed also prints a sample LR number for tracking test.

## API modules implemented

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Agency

- `POST /api/agency/create`
- `POST /api/agency/route`
- `PATCH /api/agency/route/:routeId`
- `DELETE /api/agency/route/:routeId`
- `GET /api/agency/search?from=&to=`
- `GET /api/agency/`
- `GET /api/agency/me`

### Booking

- `POST /api/booking/create`
- `GET /api/booking/user/`
- `GET /api/booking/agency`
- `GET /api/booking/agency/stats`

### Documents

- `POST /api/lr/create`
- `GET /api/lr/:lrId/pdf` (mock document export)
- `POST /api/dispatch/create`
- `POST /api/arrival/create`
- `POST /api/delivery/create`

### Tracking and GPS

- `GET /api/tracking/?lrNumber=...`
- `POST /api/gps/update`

### Vehicles

- `POST /api/vehicle/create`
- `GET /api/vehicle/`

### Loads marketplace

- `POST /api/loads`
- `GET /api/loads`
- `GET /api/loads/:id`
- `POST /api/loads/:id/apply`
- `POST /api/loads/:id/assign`

### Jobs and applications

- `POST /api/jobs`
- `GET /api/jobs`
- `POST /api/jobs/:id/apply`
- `GET /api/jobs/:id/applications`
- `POST /api/applications/open`
- `GET /api/applications/open`
- `PATCH /api/applications/:id`

## Multilingual support

UI is implemented with i18next and language persistence in localStorage (`builtyos_language`):

- English (`en`)
- Hindi (`hi`)
- Tamil (`ta`)

## Security and architecture highlights

- Password hashing with bcryptjs
- JWT authentication for protected APIs
- Role authorization (`customer`, `agency`, `worker`)
- Input validation with express-validator
- Centralized error middleware
- MVC-ish backend organization
- Reusable frontend components and protected routes

## Optional analytics included

Agency dashboard includes basic analytics:

- Total bookings
- In-transit shipments
- Delivered shipments

Agency UI also includes:

- Route CRUD controls (add/edit/delete)
- Operations summary panel
- Activity feed
- Action-driven booking management table

## Quick validation checklist

1. Register/login as customer and create booking.
2. Login as agency and create agency profile/routes if needed.
3. Generate LR for booking.
4. Create dispatch challan and assign vehicle.
5. Track shipment by LR number.
6. Create arrival challan.
7. Create delivery record.
8. Confirm status reaches `Delivered`.

## Notes

- GPS updates can be posted manually using `/api/gps/update`.
- Background GPS simulation auto-runs on backend startup for active vehicles.
- Tracking page renders live map tiles via OpenStreetMap + React Leaflet.
- For quick API testing, use `docs/api-samples.http`.
