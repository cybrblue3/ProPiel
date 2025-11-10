# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProPiel is a full-stack clinic management system for a dermatology clinic. It consists of three main applications:

- **Backend**: Node.js + Express REST API with MySQL database (Sequelize ORM)
- **Dashboard**: React + Material-UI admin/staff dashboard for managing clinic operations
- **Public Booking**: React + Material-UI public-facing appointment booking form

## Development Commands

### Backend (Node.js + Express)

```bash
cd backend
npm install                 # Install dependencies
npm run dev                 # Start development server with nodemon (port 5000)
npm start                   # Start production server
npm run create-db           # Create MySQL database
npm run seed                # Seed database with initial data
npm run setup               # Create database and seed in one command
npm run check-users         # Utility to check user accounts
```

**Environment Setup**: Backend requires `.env` file with database credentials and JWT secret. Default database: `propiel_clinic_v2`, MySQL on localhost:3306.

### Dashboard (React + Vite)

```bash
cd dashboard
npm install                 # Install dependencies
npm run dev                 # Start development server (port 3000)
npm run build               # Build for production
npm run lint                # Run ESLint
npm run preview             # Preview production build
```

**Environment Variables**: Uses `VITE_API_URL` to configure backend API endpoint (defaults to http://localhost:5000/api).

### Public Booking (React + Vite)

```bash
cd public-booking
npm install                 # Install dependencies
npm run dev                 # Start development server (port 3001)
npm run build               # Build for production
npm run lint                # Run ESLint
npm run preview             # Preview production build
```

## Architecture

### Backend Structure

**Entry Point**: `backend/app.js` - Initializes Express, configures middleware, registers routes, and starts server.

**Database**: MySQL via Sequelize ORM. Connection configured in `backend/config/db.js`. Database tables are automatically synchronized on server start using `sequelize.sync({ alter: false })`.

**Core Models** (backend/models/):
- User, Patient, Doctor, Service
- Appointment, Payment, PaymentProof, PaymentConfig
- Consent, Schedule, MedicalRecord, AppointmentHold, BlockedDate
- MedicalCase, Prescription, Photo

**Model Relationships** are defined in `backend/models/index.js`:
- User has one Doctor (userId foreign key)
- Patient has many Appointments, MedicalRecords, MedicalCases
- Doctor has many Appointments, Schedules, MedicalRecords, MedicalCases
- Service has many Schedules and Appointments
- Appointment has one Payment, PaymentProof, Consent, and MedicalRecord
- MedicalCase has many Prescriptions and Photos

**API Routes** (backend/routes/):
- `/api/auth` - Authentication (login, register, me, logout)
- `/api/public` - Public booking endpoints (no auth required)
- `/api/appointments` - Appointment management (requires auth)
- `/api/admin` - Admin-only endpoints (stats, bulk operations)
- `/api/patients` - Patient CRUD operations
- `/api/doctors` - Doctor management
- `/api/medical-cases` - Medical case management
- `/api/prescriptions` - Prescription management
- `/api/photos` - Photo management for medical cases

**Authentication**: JWT-based authentication implemented in `backend/middleware/auth.js`. Token is sent via `Authorization: Bearer <token>` header. Token includes user ID and is verified against User table. Inactive users are rejected.

**Authorization**: Role-based access control via `backend/middleware/roleCheck.js`. Three roles: `admin`, `receptionist`, `doctor`. Admin has full access, receptionist manages appointments/payments, doctor views appointments and manages medical records.

**File Uploads**: Multer middleware configured in `backend/middleware/upload.js`. Uploaded files stored in `backend/uploads/` directory (served statically at `/uploads`).

**Utilities** (backend/utils/):
- `generateToken.js` - JWT token generation
- `pdfGenerator.js` - Generate PDF documents (prescriptions, consents)
- `whatsapp.js` - WhatsApp notification integration
- `slotAvailability.js` - Calculate available appointment time slots
- `createDatabase.js`, `seed.js`, `checkUsers.js` - Database setup scripts

### Frontend Architecture (Dashboard)

**Entry Point**: `dashboard/src/main.jsx` renders App component wrapped in AuthProvider.

**Routing**: React Router v6 with role-based protected routes (see `dashboard/src/App.jsx`):
- Public: `/login`
- Admin/Receptionist: `/dashboard`, `/pending-appointments`, `/book-appointment`, `/settings`
- Doctor: `/doctor-dashboard`
- Shared: `/appointments`, `/patients`, `/medical-records`

**Authentication**: Context-based authentication in `dashboard/src/context/AuthContext.jsx`. Token and user stored in localStorage. `ProtectedRoute` component checks authentication and roles.

**API Client**: Axios instance configured in `dashboard/src/services/api.js`:
- Base URL from `VITE_API_URL` environment variable
- Request interceptor adds JWT token to all requests
- Response interceptor handles 401 errors (logout and redirect to login)
- Organized API functions: authAPI, patientsAPI, appointmentsAPI, servicesAPI, doctorsAPI, adminAPI

**UI Framework**: Material-UI v5 with custom theme (primary blue, secondary purple). Custom component overrides for buttons (no text transform, rounded corners) and cards (increased border radius, subtle shadow).

**Layout**: Persistent layout with navigation sidebar/header in `dashboard/src/components/Layout.jsx`. Role-based menu items.

### Frontend Architecture (Public Booking)

**Purpose**: Standalone public appointment booking form accessible without authentication.

**Entry Point**: `public-booking/src/main.jsx` renders App component with BookingForm.

**Booking Flow**: Multi-step wizard (Stepper component):
1. **Datos** (Data): Patient info, service selection, date/time selection
2. **Confirmar** (Confirm): Review appointment details
3. **Pago** (Payment): Upload payment proof, instructions
4. **Consentimiento** (Consent): Agree to terms and conditions
5. **Listo** (Complete): Confirmation message

**API Client**: Separate axios instance in `public-booking/src/api.js` for public endpoints (`/api/public/*`).

**Email Validation**: Strict email domain whitelist enforced on both frontend and backend (see `ALLOWED_EMAIL_DOMAINS` in BookingForm.jsx and validation.js). Only trusted providers allowed (Gmail, Outlook, Yahoo, etc.) plus educational/government domains.

**Slot Availability**: Dynamic time slot calculation based on doctor schedules, existing appointments, and blocked dates. Prevents double-booking and respects appointment duration.

## Key Technical Details

### Database Sync Strategy

The backend uses `sequelize.sync({ alter: false })` in production. During development, you may need to:
- Use `{ alter: true }` to auto-migrate schema changes (can cause data loss)
- Use `{ force: true }` to drop and recreate tables (WILL DELETE ALL DATA)
- Manually create migrations for production changes

### CORS Configuration

Backend CORS allows:
- Development: localhost:5173, localhost:3000, localhost:3001, localhost:5174
- Production: Configured via environment variables (Vercel/Railway URLs)

### Security Notes

- JWT secrets should be changed in production
- File uploads have size limits (5MB default)
- Password hashing uses bcrypt
- SQL injection protection via Sequelize parameterized queries
- Email domain whitelist prevents disposable email abuse

### Appointment System Logic

- AppointmentHold: Temporary reservations to prevent race conditions during booking
- BlockedDate: Admin-configured dates when appointments cannot be booked
- Schedule: Doctor availability windows (day of week, start/end time, service)
- Slot calculation considers: doctor schedules, existing appointments, holds, blocked dates, appointment duration

### Role-Based Dashboard Behavior

- Admin sees all appointments, can manage doctors/services/settings
- Receptionist sees all appointments, can confirm/cancel, verify payments
- Doctor sees only their own appointments, can add medical records/prescriptions

### Medical Records System

- MedicalCase: Container for patient's treatment case
- Prescription: Digital prescriptions linked to case and specific appointment
- Photo: Medical photos linked to case with timestamps
- MedicalRecord: Legacy appointment-based records (Phase 1 implementation)
