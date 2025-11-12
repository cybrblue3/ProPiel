const express = require('express');
const router = express.Router();
const { User, Doctor, Service, Schedule, PaymentConfig, BlockedDate } = require('../models');

/**
 * ONE-TIME SETUP ENDPOINT
 * Call this ONCE after deployment to seed the database
 *
 * DELETE THIS FILE after running in production for security!
 */
router.post('/initialize-database', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });

    if (existingAdmin) {
      return res.json({
        success: false,
        message: 'Database already initialized. Admin user exists.'
      });
    }

    console.log('🌱 Initializing production database...');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@propiel.com',
      password: 'admin123', // Will be hashed automatically by model hooks
      role: 'admin',
      fullName: 'Administrator',
      phone: '+527551940425',
      isActive: true
    });

    // Create receptionist user
    await User.create({
      username: 'receptionist',
      email: 'receptionist@propiel.com',
      password: 'receptionist123',
      role: 'receptionist',
      fullName: 'Receptionist User',
      phone: '+527551940426',
      isActive: true
    });

    // Create doctor users
    const dermaUser = await User.create({
      username: 'derma',
      email: 'hugo.alarcon@propiel.com',
      password: 'derma123',
      role: 'doctor',
      fullName: 'Dr. Hugo Alarcón Hernández',
      isActive: true
    });

    // Create doctor profile for dermatology
    await Doctor.create({
      userId: dermaUser.id,
      fullName: 'Dr. Hugo Alarcón Hernández',
      specialty: 'Dermatología',
      licenseNumber: '0018576',
      phone: '+527442802539',
      email: 'hugo.alarcon@propiel.com',
      bio: 'Especialista en dermatología con más de 10 años de experiencia.',
      isActive: true
    });

    // Create services
    const dermaService = await Service.create({
      name: 'Dermatología',
      description: 'Consulta general de dermatología',
      price: 700.00,
      depositPercentage: 50,
      depositAmount: 350.00,
      duration: 60,
      isActive: true
    });

    // Create basic schedule (Monday-Saturday, 9 AM - 5 PM)
    const dermaDoctor = await Doctor.findOne({ where: { specialty: 'Dermatología' } });

    if (dermaDoctor) {
      // Monday to Friday
      for (let day = 1; day <= 5; day++) {
        await Schedule.create({
          doctorId: dermaDoctor.id,
          serviceId: dermaService.id,
          dayOfWeek: day,
          startTime: '09:00:00',
          endTime: '17:00:00',
          slotDuration: 60,
          isActive: true
        });
      }

      // Saturday (shorter hours)
      await Schedule.create({
        doctorId: dermaDoctor.id,
        serviceId: dermaService.id,
        dayOfWeek: 6,
        startTime: '09:00:00',
        endTime: '14:00:00',
        slotDuration: 60,
        isActive: true
      });
    }

    // Create payment config
    await PaymentConfig.create({
      bankName: 'BBVA',
      accountHolder: 'ProPiel Clínica',
      accountNumber: '0123456789',
      clabe: '012345678901234567',
      referencePrefix: 'PROPIEL',
      instructions: 'Realizar transferencia bancaria y subir comprobante',
      isActive: true
    });

    res.json({
      success: true,
      message: '✅ Database initialized successfully!',
      credentials: {
        admin: { username: 'admin', password: 'admin123' },
        receptionist: { username: 'receptionist', password: 'receptionist123' },
        doctor: { username: 'derma', password: 'derma123' }
      },
      warning: 'DELETE /api/setup route after initialization for security!'
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing database: ' + error.message
    });
  }
});

module.exports = router;
