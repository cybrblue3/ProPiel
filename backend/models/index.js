// Import all models
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Service = require('./Service');
const Appointment = require('./Appointment');
const AppointmentStateHistory = require('./AppointmentStateHistory');
const Payment = require('./Payment');
const PaymentApprovalLog = require('./PaymentApprovalLog');
const Consent = require('./Consent');
const Schedule = require('./Schedule');
const MedicalRecord = require('./MedicalRecord');
const AppointmentHold = require('./AppointmentHold');
const PaymentProof = require('./PaymentProof');
const PaymentConfig = require('./PaymentConfig');
const BlockedDate = require('./BlockedDate');
const MedicalCase = require('./MedicalCase');
const Prescription = require('./Prescription');
const Photo = require('./Photo');

// ===================================
// DEFINE RELATIONSHIPS
// ===================================

// User <-> Doctor (One-to-One)
User.hasOne(Doctor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

// Doctor <-> Schedule (One-to-Many)
Doctor.hasMany(Schedule, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Service <-> Schedule (One-to-Many)
Service.hasMany(Schedule, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
Schedule.belongsTo(Service, { foreignKey: 'serviceId' });

// Patient <-> Appointment (One-to-Many)
Patient.hasMany(Appointment, { foreignKey: 'patientId', onDelete: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

// Doctor <-> Appointment (One-to-Many)
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Service <-> Appointment (One-to-Many)
Service.hasMany(Appointment, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

// User <-> Appointment (confirmedBy - One-to-Many)
User.hasMany(Appointment, { foreignKey: 'confirmedBy', as: 'confirmedAppointments' });
Appointment.belongsTo(User, { foreignKey: 'confirmedBy', as: 'confirmer' });

// Appointment <-> Payment (One-to-One)
Appointment.hasOne(Payment, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
Payment.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// User <-> Payment (approvedBy - One-to-Many)
User.hasMany(Payment, { foreignKey: 'approvedBy', as: 'approvedPayments' });
Payment.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// User <-> Payment (rejectedBy - One-to-Many)
User.hasMany(Payment, { foreignKey: 'rejectedBy', as: 'rejectedPayments' });
Payment.belongsTo(User, { foreignKey: 'rejectedBy', as: 'rejecter' });

// Payment <-> PaymentApprovalLog (One-to-Many)
Payment.hasMany(PaymentApprovalLog, { foreignKey: 'paymentId', onDelete: 'CASCADE' });
PaymentApprovalLog.belongsTo(Payment, { foreignKey: 'paymentId' });

// User <-> PaymentApprovalLog (One-to-Many)
User.hasMany(PaymentApprovalLog, { foreignKey: 'userId', as: 'paymentActions' });
PaymentApprovalLog.belongsTo(User, { foreignKey: 'userId' });

// User <-> PaymentProof (verifiedBy - One-to-Many)
User.hasMany(PaymentProof, { foreignKey: 'verifiedBy', as: 'verifiedProofs' });
PaymentProof.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// Appointment <-> Consent (One-to-One)
Appointment.hasOne(Consent, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
Consent.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// Patient <-> Consent (One-to-Many)
Patient.hasMany(Consent, { foreignKey: 'patientId', onDelete: 'CASCADE' });
Consent.belongsTo(Patient, { foreignKey: 'patientId' });

// Appointment <-> MedicalRecord (One-to-One)
Appointment.hasOne(MedicalRecord, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// Patient <-> MedicalRecord (One-to-Many)
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId', onDelete: 'CASCADE' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

// Doctor <-> MedicalRecord (One-to-Many)
Doctor.hasMany(MedicalRecord, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId' });

// AppointmentHold <-> Doctor (Many-to-One)
Doctor.hasMany(AppointmentHold, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
AppointmentHold.belongsTo(Doctor, { foreignKey: 'doctorId' });

// AppointmentHold <-> Service (Many-to-One)
Service.hasMany(AppointmentHold, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
AppointmentHold.belongsTo(Service, { foreignKey: 'serviceId' });

// PaymentProof <-> Appointment (One-to-One)
Appointment.hasOne(PaymentProof, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
PaymentProof.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// User <-> Appointment (cancelledBy - One-to-Many)
User.hasMany(Appointment, { foreignKey: 'cancelledBy', as: 'cancelledAppointments' });
Appointment.belongsTo(User, { foreignKey: 'cancelledBy', as: 'canceller' });

// Appointment <-> AppointmentStateHistory (One-to-Many)
Appointment.hasMany(AppointmentStateHistory, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
AppointmentStateHistory.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// User <-> AppointmentStateHistory (One-to-Many)
User.hasMany(AppointmentStateHistory, { foreignKey: 'changedBy', as: 'appointmentStateChanges' });
AppointmentStateHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changer' });

// Patient <-> MedicalCase (One-to-Many)
Patient.hasMany(MedicalCase, { foreignKey: 'patientId', onDelete: 'CASCADE' });
MedicalCase.belongsTo(Patient, { foreignKey: 'patientId' });

// Doctor <-> MedicalCase (One-to-Many)
Doctor.hasMany(MedicalCase, { foreignKey: 'doctorId', onDelete: 'RESTRICT' });
MedicalCase.belongsTo(Doctor, { foreignKey: 'doctorId' });

// MedicalCase <-> Prescription (One-to-Many)
MedicalCase.hasMany(Prescription, { foreignKey: 'medicalCaseId', onDelete: 'CASCADE' });
Prescription.belongsTo(MedicalCase, { foreignKey: 'medicalCaseId' });

// Appointment <-> Prescription (One-to-Many)
Appointment.hasMany(Prescription, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// MedicalCase <-> Photo (One-to-Many)
MedicalCase.hasMany(Photo, { foreignKey: 'medicalCaseId', onDelete: 'CASCADE' });
Photo.belongsTo(MedicalCase, { foreignKey: 'medicalCaseId' });

// ===================================
// EXPORT ALL MODELS
// ===================================

module.exports = {
  User,
  Patient,
  Doctor,
  Service,
  Appointment,
  AppointmentStateHistory,
  Payment,
  PaymentApprovalLog,
  Consent,
  Schedule,
  MedicalRecord,
  AppointmentHold,
  PaymentProof,
  PaymentConfig,
  BlockedDate,
  MedicalCase,
  Prescription,
  Photo
};
