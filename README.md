# BuiltyOS MVP

Production-ready MVP to digitize local goods transport agency workflows and connect agencies with business customers.

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

- Frontend: React + React Router + Axios + i18next
- Backend: Node.js + Express + JWT Auth
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
      context/
      i18n/
        locales/
      pages/
        agency/
        common/
        customer/
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

Seed also prints a sample LR number for tracking test.

## API modules implemented

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Agency

- `POST /api/agency/create`
- `POST /api/agency/route`
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

## Multilingual support

UI is implemented with i18next and language persistence in localStorage (`builtyos_language`):

- English (`en`)
- Hindi (`hi`)
- Tamil (`ta`)

## Security and architecture highlights

- Password hashing with bcryptjs
- JWT authentication for protected APIs
- Role authorization (`customer`, `agency`)
- Input validation with express-validator
- Centralized error middleware
- MVC-ish backend organization
- Reusable frontend components and protected routes

## Optional analytics included

Agency dashboard includes basic analytics:

- Total bookings
- In-transit shipments
- Delivered shipments

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
- Frontend map area is mocked with coordinates for MVP simplicity.
