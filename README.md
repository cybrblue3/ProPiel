# ProPiel - Dermatology Clinic Management System

Complete clinic management system built with React, Node.js, and MySQL for dermatology clinics.

## 🏗️ Project Structure

```
ProPiel/
├── backend/              # Node.js + Express API
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files (photos, payment proofs)
│   └── app.js           # Main application
├── dashboard/           # React admin dashboard (Material-UI v7)
│   └── src/
│       ├── pages/       # Dashboard pages
│       ├── context/     # Auth context
│       └── components/  # Reusable components
├── public-booking/      # React public appointment booking form
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

1. Create MySQL database:
```sql
CREATE DATABASE propiel_clinic_v2;
```

2. Configure `.env` file in `backend/` directory:
```env
# Database
DB_HOST=localhost
DB_NAME=propiel_clinic_v2
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

3. Start backend:
```bash
npm start        # Production
npm run dev      # Development with nodemon
```

Backend will run on: `http://localhost:5000`

**First Time Setup:**
- The database tables will be created automatically on first run
- You'll need to create an admin user manually or use seeder scripts

### Dashboard Setup

```bash
cd dashboard
npm install
```

Configure `.env` file in `dashboard/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start dashboard:
```bash
npm run dev
```

Dashboard will run on: `http://localhost:5173`

### Public Booking Setup

```bash
cd public-booking
npm install
npm run dev
```

Public booking will run on: `http://localhost:5174`

## ✨ Features

### ✅ Phase 1: Core System (COMPLETED)

#### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Doctor, Receptionist)
- Protected routes and API endpoints
- Password hashing with bcrypt

#### Patient Management
- Create, read, update patient profiles
- Patient search and filtering
- Full medical history access
- Patient contact information management

#### Doctor Management
- Doctor profiles with specialties
- License number tracking
- Bio and photo management
- Schedule management

#### Service Management
- Service catalog (consultations, treatments, procedures)
- Pricing management
- Duration tracking
- Service descriptions

#### Appointment System
- **Public Booking Form**: Patients can book appointments online
- **Admin Dashboard**: Full appointment management
- Appointment scheduling with time slots
- Status tracking (Pending, Confirmed, Completed, Cancelled)
- Doctor and service assignment
- Conflict prevention
- Appointment holds (temporary reservations)

#### Payment Management
- Payment proof upload
- Payment verification workflow
- Payment status tracking
- Amount and method recording
- Admin approval system

#### Settings & Configuration
- Clinic information management
- Business hours configuration
- Blocked dates (holidays, closures)
- Payment configuration (bank details)

### ✅ Phase 2: Advanced Features (COMPLETED)

#### Receptionist Dashboard
- Streamlined appointment booking interface
- Quick patient search
- Real-time appointment calendar
- Payment verification tools
- Optimized workflow for front desk operations

#### Doctor Dashboard
- Personal appointment view
- Patient list filtered by appointments
- Medical records access
- Today's schedule overview
- Appointment details and patient history

### ✅ Phase 3: Medical Records System (COMPLETED)

#### Medical Cases Management
- Create and manage medical cases for patients
- Track dermatological conditions
- Multiple cases per patient support
- Case status tracking (En Tratamiento, Curado, Crónico, Inactivo)
- Severity levels (Leve, Moderado, Severo)
- Specialty-based organization

#### Medical Case Details
- Patient information integration
- Condition name and specialty
- Affected area tracking
- Symptom documentation
- Onset date tracking
- Previous treatments history
- Treatment goals
- Start and end dates
- Additional notes
- Smart form controls (checkboxes for "no data" fields)

#### Prescription Management
- Add prescriptions to medical cases
- Medication name, dosage, and frequency
- Duration and special instructions
- Prescribed date tracking
- Edit and delete prescriptions
- Multiple prescriptions per case
- Optional appointment linkage

### ✅ Phase 4: Photo Management (COMPLETED)

#### Medical Photo Uploads
- Upload treatment progress photos
- Photo categorization (Before, During, After)
- Photo descriptions
- Upload date tracking
- Image validation (type and size)
- File size limit: 5MB
- Supported formats: JPG, PNG, GIF, WebP

#### Photo Gallery
- Grid view of all case photos
- Color-coded badges (Before=warning, During=primary, After=success)
- Click to view full-size images
- Delete photos
- Organized by upload date
- Multiple photos per case

## 🔐 User Roles & Permissions

### Admin
- **Full system access**
- Manage users, patients, doctors, services
- Approve/reject appointments and payments
- Access all medical records
- Configure system settings
- View analytics and reports

### Doctor
- View assigned appointments
- Access patient medical records
- Create and manage medical cases
- Add prescriptions
- Upload treatment photos
- Update appointment status
- Limited to own patients and cases

### Receptionist
- Manage appointments (create, confirm, cancel)
- Register patients
- Verify payment proofs
- View appointment calendar
- Check-in patients
- Cannot access medical records or prescriptions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8+ with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Uploads**: Multer
- **CORS**: cors middleware
- **Environment**: dotenv
- **PDF Generation**: pdfkit (for future reports)

### Frontend (Dashboard)
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI v7
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Form Handling**: Controlled components
- **File Upload**: FormData API

### Frontend (Public Booking)
- Same stack as dashboard
- Simplified UI for patient use
- No authentication required

## 📝 Complete API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication Endpoints

#### POST `/auth/register`
Create new user account
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin|doctor|receptionist",
  "fullName": "string",
  "phone": "string"
}
```

#### POST `/auth/login`
User login
```json
{
  "username": "string",
  "password": "string"
}
```
Returns: `{ token, user }`

#### GET `/auth/me`
Get current user (requires authentication)

### Patient Endpoints

#### GET `/patients`
List all patients (with filtering)

#### POST `/patients`
Create new patient
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "Masculino|Femenino|Otro",
  "address": "string",
  "emergencyContact": "string"
}
```

#### GET `/patients/:id`
Get patient details

#### PUT `/patients/:id`
Update patient

#### DELETE `/patients/:id`
Delete patient

### Doctor Endpoints

#### GET `/doctors`
List all doctors

#### POST `/doctors`
Create doctor profile

#### GET `/doctors/:id`
Get doctor details

#### PUT `/doctors/:id`
Update doctor

### Appointment Endpoints

#### GET `/appointments`
List appointments (filtered by role)

#### POST `/appointments`
Create appointment

#### GET `/appointments/:id`
Get appointment details

#### PUT `/appointments/:id`
Update appointment

#### PATCH `/appointments/:id/status`
Update appointment status

#### DELETE `/appointments/:id`
Cancel appointment

### Medical Cases Endpoints

#### GET `/medical-cases`
List all medical cases (filtered by doctor for doctors)

#### POST `/medical-cases`
Create new medical case
```json
{
  "patientId": number,
  "doctorId": number,
  "conditionName": "string",
  "specialty": "string",
  "severity": "Leve|Moderado|Severo",
  "symptoms": "string",
  "affectedArea": "string",
  "onsetDate": "YYYY-MM-DD",
  "previousTreatments": "string",
  "treatmentGoal": "string",
  "status": "En Tratamiento|Curado|Crónico|Inactivo",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "notes": "string"
}
```

#### GET `/medical-cases/:id`
Get medical case details (includes Patient, Doctor, Prescriptions, Photos)

#### PUT `/medical-cases/:id`
Update medical case

#### DELETE `/medical-cases/:id`
Delete medical case

### Prescription Endpoints

#### POST `/prescriptions`
Create prescription
```json
{
  "medicalCaseId": number,
  "appointmentId": number (optional),
  "medicationName": "string",
  "dosage": "string",
  "frequency": "string",
  "duration": "string",
  "instructions": "string",
  "prescribedDate": "YYYY-MM-DD"
}
```

#### PUT `/prescriptions/:id`
Update prescription

#### DELETE `/prescriptions/:id`
Delete prescription

#### GET `/prescriptions/case/:medicalCaseId`
Get all prescriptions for a medical case

### Photo Endpoints

#### POST `/photos`
Upload photo (multipart/form-data)
```
photo: file
medicalCaseId: number
photoType: "before|during|after"
uploadDate: "YYYY-MM-DD"
description: string (optional)
```

#### GET `/photos/case/:medicalCaseId`
Get all photos for a medical case

#### DELETE `/photos/:id`
Delete photo (also deletes physical file)

### Admin Endpoints

#### GET `/admin/dashboard-stats`
Get dashboard statistics

#### GET `/admin/users`
List all users

#### POST `/admin/users`
Create user

#### PUT `/admin/users/:id`
Update user

#### DELETE `/admin/users/:id`
Delete user

### Payment Endpoints

#### POST `/payments`
Create payment record

#### PUT `/payments/:id`
Update payment

#### PATCH `/payments/:id/approve`
Approve payment

#### PATCH `/payments/:id/reject`
Reject payment

## 🗄️ Database Schema

### Tables

#### users
- id (PK)
- username (unique)
- email (unique)
- password (hashed)
- role (admin, doctor, receptionist)
- fullName
- phone
- isActive
- lastLogin
- createdAt, updatedAt

#### patients
- id (PK)
- fullName
- email
- phone (unique)
- birthDate
- gender
- address
- emergencyContact
- emergencyPhone
- medicalHistory
- allergies
- currentMedications
- bloodType
- isActive
- createdAt, updatedAt

#### doctors
- id (PK)
- userId (FK → users)
- fullName
- specialty
- licenseNumber
- phone
- email
- bio
- photoUrl
- isActive
- createdAt, updatedAt

#### services
- id (PK)
- name
- description
- category
- price
- duration
- isActive
- createdAt, updatedAt

#### appointments
- id (PK)
- patientId (FK → patients)
- doctorId (FK → doctors)
- serviceId (FK → services)
- appointmentDate
- appointmentTime
- duration
- status (Pending, Confirmed, Completed, Cancelled)
- notes
- cancellationReason
- confirmedBy (FK → users)
- confirmedAt
- cancelledBy (FK → users)
- cancelledAt
- reminderSent
- createdAt, updatedAt

#### payments
- id (PK)
- appointmentId (FK → appointments)
- amount
- paymentMethod
- paymentStatus (Pending, Approved, Rejected)
- transactionId
- proofUrl
- approvedBy (FK → users)
- approvedAt
- notes
- createdAt, updatedAt

#### medical_cases
- id (PK)
- patientId (FK → patients)
- doctorId (FK → doctors)
- conditionName
- specialty
- severity (Leve, Moderado, Severo)
- symptoms
- affectedArea
- onsetDate
- previousTreatments
- treatmentGoal
- status (En Tratamiento, Curado, Crónico, Inactivo)
- startDate
- endDate
- notes
- isActive
- createdAt, updatedAt

#### prescriptions
- id (PK)
- medicalCaseId (FK → medical_cases)
- appointmentId (FK → appointments, nullable)
- medicationName
- dosage
- frequency
- duration
- instructions
- prescribedDate
- createdAt, updatedAt

#### photos
- id (PK)
- medicalCaseId (FK → medical_cases)
- photoUrl
- photoType (before, during, after)
- uploadDate
- description
- createdAt, updatedAt

#### schedules
- id (PK)
- doctorId (FK → doctors)
- serviceId (FK → services)
- dayOfWeek (0-6)
- startTime
- endTime
- maxAppointments
- isActive
- createdAt, updatedAt

#### consents
- id (PK)
- appointmentId (FK → appointments)
- patientId (FK → patients)
- consentType
- consentText
- agreedAt
- signatureUrl
- createdAt, updatedAt

#### appointment_holds
- id (PK)
- doctorId (FK → doctors)
- serviceId (FK → services)
- appointmentDate
- appointmentTime
- holdUntil
- status (Pending, Confirmed, Expired)
- sessionId
- createdAt, updatedAt

#### payment_proofs
- id (PK)
- appointmentId (FK → appointments)
- fileUrl
- uploadedAt
- createdAt, updatedAt

#### blocked_dates
- id (PK)
- blockedDate
- reason
- isRecurring
- createdAt, updatedAt

## 📱 Dashboard Pages

### Admin/Receptionist Access
1. **Dashboard (Home)** - Overview statistics and quick actions
2. **Appointments** - Full appointment management
3. **Patients** - Patient database
4. **Doctors** - Doctor management
5. **Services** - Service catalog
6. **Medical Records** - Medical cases (admin can view all)
7. **Settings** - System configuration

### Doctor Access
1. **Dashboard** - Personal appointments and schedule
2. **My Patients** - Patients with appointments
3. **Medical Records** - Medical cases (only own cases)
4. **My Profile** - Personal information

### Receptionist-Specific
- **Booking Interface** - Streamlined appointment creation for walk-ins

## 🎯 Common Workflows

### Creating a Medical Case
1. Navigate to Medical Records
2. Click "Nuevo Caso"
3. Select patient (searchable autocomplete)
4. Select doctor (auto-filled for doctors)
5. Enter condition details
6. Set severity and status
7. Add symptoms, affected area, treatment goals
8. Save case

### Adding Prescriptions
1. Open medical case details
2. Scroll to "Prescripciones" section
3. Click "Agregar"
4. Enter medication name (required)
5. Add dosage, frequency, duration
6. Add special instructions
7. Save prescription

### Uploading Treatment Photos
1. Open medical case details
2. Scroll to "Fotos del Tratamiento"
3. Select photo type (Before/During/After)
4. Add optional description
5. Click "Seleccionar y Subir Foto"
6. Choose image file (max 5MB)
7. Photo uploads and appears in gallery

### Booking an Appointment (Receptionist)
1. Go to Receptionist Dashboard
2. Search for existing patient or create new
3. Select doctor and service
4. Choose available date and time slot
5. Add notes if needed
6. Submit appointment
7. Appointment created as "Pending"

### Verifying Payment
1. Go to Appointments page
2. Find appointment with uploaded payment proof
3. Click on payment proof to view
4. Click "Approve" or "Reject"
5. Status updates automatically

## 🔧 Configuration

### Payment Methods
Configured in Settings → Payment Configuration:
- Bank transfer details
- Payment instructions for patients
- Displayed in public booking form

### Blocked Dates
Set clinic closures:
- Holidays
- Special events
- Doctor unavailability
- Prevents appointments on these dates

### Doctor Schedules
Configure availability:
- Days of week
- Time slots
- Services offered
- Maximum appointments per slot

## 📂 File Uploads

### Payment Proofs
- **Location**: `backend/uploads/payment-proofs/`
- **Accessible via**: `http://localhost:5000/uploads/payment-proofs/:filename`
- **Max size**: 5MB
- **Formats**: JPG, PNG, PDF

### Medical Photos
- **Location**: `backend/uploads/medical-photos/`
- **Accessible via**: `http://localhost:5000/uploads/medical-photos/:filename`
- **Max size**: 5MB
- **Formats**: JPG, PNG, GIF, WebP

### Doctor Photos
- **Location**: `backend/uploads/doctors/`
- **Max size**: 2MB
- **Formats**: JPG, PNG

## 🚨 Important Notes

### Security
- All sensitive endpoints require JWT authentication
- Role-based access control enforced on backend
- Passwords hashed with bcrypt (10 rounds)
- SQL injection protected by Sequelize ORM
- File upload validation and sanitization

### Database Sync
- Currently set to `{ alter: false }` in production
- Set to `{ alter: true }` only when adding new fields
- **Warning**: `alter: true` can cause issues with existing constraints
- Manual SQL migrations recommended for schema changes

### CORS Configuration
Update `backend/app.js` with your frontend URLs:
```javascript
origin: process.env.NODE_ENV === 'production'
  ? ['https://your-frontend.vercel.app']
  : ['http://localhost:5173', 'http://localhost:5174']
```

## 🐛 Common Issues & Solutions

### "Too many keys specified" error
When running `sequelize.sync({ alter: true })`, MySQL may hit key limit.
**Solution**: Use manual SQL migrations instead.

### Photos not displaying
Check that:
1. `backend/uploads` directory exists
2. Static file middleware is configured
3. Photo URLs are correct in database
4. Backend server is running

### 401 Unauthorized errors
- Verify JWT token is being sent in headers
- Check token hasn't expired
- Ensure `auth` middleware is imported correctly

### Prescription creation fails with "appointmentId cannot be null"
- Ensure Prescription model has `appointmentId: { allowNull: true }`
- Run manual SQL: `ALTER TABLE prescriptions MODIFY COLUMN appointmentId INT NULL;`

## 📦 Deployment

### Backend Deployment (Railway/Heroku)
1. Set environment variables
2. Ensure MySQL database is provisioned
3. Run database migrations if needed
4. Deploy from main branch

### Frontend Deployment (Vercel)
1. Set `VITE_API_URL` to production backend URL
2. Deploy from main branch
3. Update CORS settings in backend

## 👨‍💻 Development Team

Created by ProPiel Team

## 📄 License

Private - All Rights Reserved

## 🔮 Future Enhancements

Potential features for future development:
- Email notifications for appointments
- SMS reminders
- Patient portal (separate login)
- Analytics dashboard
- Report generation (PDF)
- Inventory management
- Billing and invoicing
- Multi-language support
- Dark mode
- Mobile app

## 📞 Support

For questions or issues, please contact the development team.

---

**Last Updated**: January 2025
**Version**: 2.0.0
**Status**: All core features implemented and tested
