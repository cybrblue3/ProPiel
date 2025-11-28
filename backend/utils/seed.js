const sequelize = require('../config/db');
const {
  User,
  Doctor,
  Service,
  Schedule,
  PaymentConfig,
  Patient,
  Appointment,
  Payment,
  AppointmentStateHistory
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (will create tables)
    await sequelize.sync({ force: true }); // WARNING: This drops all tables!
    console.log('✅ Database tables created');

    // Create superadmin user
    const superadminUser = await User.create({
      username: 'superadmin',
      email: 'superadmin@propiel.com',
      password: 'superadmin123', // Will be hashed automatically
      role: 'superadmin',
      fullName: 'Super Administrator',
      phone: '+527551940425'
    });
    console.log('✅ Superadmin user created (username: superadmin, password: superadmin123)');

    // Create admin/receptionist user
    const adminUser = await User.create({
      username: 'recepcion',
      email: 'recepcion@propiel.com',
      password: 'recepcion123',
      role: 'admin',
      fullName: 'Recepcionista',
      phone: '+527551940425'
    });
    console.log('✅ Admin user created (username: recepcion, password: recepcion123)');

    // Create doctor users
    const dermaUser = await User.create({
      username: 'derma',
      email: 'hugo.alarcon@propiel.com',
      password: 'derma123',
      role: 'doctor',
      fullName: 'Dr. Hugo Alarcón Hernández'
    });

    const podoUser = await User.create({
      username: 'podo',
      email: 'mayra.cardenas@propiel.com',
      password: 'podo123',
      role: 'doctor',
      fullName: 'Dra. Mayra Cárdenas Castillo'
    });

    const tamizUser = await User.create({
      username: 'tamiz',
      email: 'jose.soza@propiel.com',
      password: 'tamiz123',
      role: 'doctor',
      fullName: 'Dr. José Romulo Soza Ortíz'
    });

    console.log('✅ Doctor users created');

    // Create doctor profiles
    const dermaDoctor = await Doctor.create({
      userId: dermaUser.id,
      fullName: 'Dr. Hugo Alarcón Hernández',
      specialty: 'Dermatología',
      licenseNumber: '0018576',
      phone: '+527442802539',
      email: 'hugo.alarcon@propiel.com',
      bio: 'Especialista en dermatología con más de 10 años de experiencia.'
    });

    const podoDoctor = await Doctor.create({
      userId: podoUser.id,
      fullName: 'Dra. Mayra Cárdenas Castillo',
      specialty: 'Podología',
      licenseNumber: '7654321',
      phone: '+527442802539',
      email: 'mayra.cardenas@propiel.com',
      bio: 'Especialista en podología y cuidado de los pies.'
    });

    const tamizDoctor = await Doctor.create({
      userId: tamizUser.id,
      fullName: 'Dr. José Romulo Soza Ortíz',
      specialty: 'Tamiz',
      licenseNumber: '1234567',
      phone: '+527442802539',
      email: 'jose.soza@propiel.com',
      bio: 'Especialista en tamiz neonatal.'
    });

    console.log('✅ Doctor profiles created');

    // Create services
    const dermaService = await Service.create({
      name: 'Dermatología',
      description: 'Consulta general de dermatología, diagnóstico y tratamiento de enfermedades de la piel.',
      price: 700.00,
      depositPercentage: 50,
      duration: 60
    });

    const podoService = await Service.create({
      name: 'Podología',
      description: 'Consulta y tratamiento de problemas en los pies.',
      price: 400.00,
      depositPercentage: 50,
      duration: 45
    });

    const tamizService = await Service.create({
      name: 'Tamiz',
      description: 'Prueba de tamiz neonatal para detectar enfermedades congénitas.',
      price: 350.00,
      depositPercentage: 50,
      duration: 30
    });

    console.log('✅ Services created');

    // Create schedules for all doctors
    const doctors = [
      { doctor: dermaDoctor, service: dermaService, name: 'Dr. Hugo (Dermatología)' },
      { doctor: podoDoctor, service: podoService, name: 'Dra. Mayra (Podología)' },
      { doctor: tamizDoctor, service: tamizService, name: 'Dr. José (Tamiz)' }
    ];

    for (const { doctor, service, name } of doctors) {
      for (let day = 1; day <= 6; day++) { // Monday=1 to Saturday=6
        // Morning shift: 9:00 AM - 3:00 PM
        await Schedule.create({
          doctorId: doctor.id,
          serviceId: service.id,
          dayOfWeek: day,
          startTime: '09:00:00',
          endTime: '15:00:00',
          slotDuration: 60
        });

        // Afternoon shift: 4:00 PM - 6:00 PM
        await Schedule.create({
          doctorId: doctor.id,
          serviceId: service.id,
          dayOfWeek: day,
          startTime: '16:00:00',
          endTime: '18:00:00',
          slotDuration: 60
        });
      }
      console.log(`✅ Schedules created for ${name}`);
    }

    // Create payment configuration
    await PaymentConfig.create({
      bankName: 'Banco Example',
      accountHolder: 'Clínica ProPiel S.A. de C.V.',
      accountNumber: '1234567890',
      clabe: '012345678901234567',
      referencePrefix: 'PROPIEL',
      isActive: true
    });
    console.log('✅ Payment config created');

    // ============================================
    // CREATE SAMPLE PATIENTS AND APPOINTMENTS
    // ============================================

    // Create sample patients
    const patient1 = await Patient.create({
      fullName: 'María García López',
      birthDate: '1990-05-15',
      gender: 'female',
      phone: '5551234567',
      phoneCountryCode: '+52',
      email: 'maria.garcia@gmail.com',
      address: 'Av. Reforma 123, CDMX'
    });

    const patient2 = await Patient.create({
      fullName: 'Juan Pérez Martínez',
      birthDate: '1985-08-20',
      gender: 'male',
      phone: '5559876543',
      phoneCountryCode: '+52',
      email: 'juan.perez@gmail.com',
      address: 'Calle Juárez 456, CDMX'
    });

    const patient3 = await Patient.create({
      fullName: 'Ana Rodríguez Sánchez',
      birthDate: '1995-03-10',
      gender: 'female',
      phone: '5555555555',
      phoneCountryCode: '+52',
      email: 'ana.rodriguez@gmail.com',
      address: 'Calle Hidalgo 789, CDMX'
    });

    const patient4 = await Patient.create({
      fullName: 'Carlos Hernández Torres',
      birthDate: '1988-11-25',
      gender: 'male',
      phone: '5554443333',
      phoneCountryCode: '+52',
      email: 'carlos.hernandez@gmail.com',
      address: 'Av. Insurgentes 321, CDMX'
    });

    const patient5 = await Patient.create({
      fullName: 'Laura Méndez Flores',
      birthDate: '1992-07-08',
      gender: 'female',
      phone: '5556667777',
      phoneCountryCode: '+52',
      email: 'laura.mendez@gmail.com',
      address: 'Calle Madero 654, CDMX'
    });

    console.log('✅ Sample patients created');

    // ============================================
    // TIMEZONE FIX: Get today's date in Mexico City timezone
    // ============================================

    // Get today's date in Mexico City timezone (America/Mexico_City)
    const getMexicoDate = () => {
      const now = new Date();
      // en-CA format gives YYYY-MM-DD which is what we need
      return now.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    };

    const todayStr = getMexicoDate();

    // Get current time in Mexico City timezone
    const getMexicoTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/Mexico_City',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      const [hour, minute] = timeStr.split(':').map(Number);
      return { hour, minute, now };
    };

    const { hour: currentHour, minute: currentMinute, now } = getMexicoTime();

    console.log(`📅 Creating appointments for: ${todayStr}`);
    console.log(`🕐 Current Mexico City time: ${currentHour}:${String(currentMinute).padStart(2, '0')}`);

    // Create appointments for TODAY at different times to test reminders

    // Helper function to get time string in Mexico City timezone
    const getMexicoTimeStr = (offsetMinutes = 0) => {
      const targetTime = new Date(now.getTime() + (offsetMinutes * 60000));
      const timeStr = targetTime.toLocaleTimeString('en-US', {
        timeZone: 'America/Mexico_City',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return timeStr;
    };

    // 1. LATE appointment (30 mins ago) - CONFIRMED
    const lateTimeStr = getMexicoTimeStr(-30);

    const apt1 = await Appointment.create({
      patientId: patient1.id,
      doctorId: dermaDoctor.id,
      serviceId: dermaService.id,
      appointmentDate: todayStr,
      appointmentTime: lateTimeStr,
      status: 'confirmed',
      confirmedBy: adminUser.id,
      confirmedAt: new Date(now.getTime() - 2 * 60 * 60000), // Confirmed 2 hours ago
      paymentReference: 'PROPIEL-TEST001'
    });

    await Payment.create({
      appointmentId: apt1.id,
      totalAmount: 700,
      depositAmount: 350,
      amount: 350,
      remainingBalance: 350,
      paymentMethod: 'transfer',
      status: 'approved',
      paymentReference: 'PROPIEL-TEST001',
      approvedBy: adminUser.id,
      approvedAt: new Date(now.getTime() - 2 * 60 * 60000)
    });

    // 2. AT TIME appointment (right now) - CONFIRMED
    const nowTimeStr = getMexicoTimeStr(0);

    const apt2 = await Appointment.create({
      patientId: patient2.id,
      doctorId: podoDoctor.id,
      serviceId: podoService.id,
      appointmentDate: todayStr,
      appointmentTime: nowTimeStr,
      status: 'confirmed',
      confirmedBy: adminUser.id,
      confirmedAt: new Date(now.getTime() - 1 * 60 * 60000),
      paymentReference: 'PROPIEL-TEST002'
    });

    await Payment.create({
      appointmentId: apt2.id,
      totalAmount: 400,
      depositAmount: 200,
      amount: 200,
      remainingBalance: 200,
      paymentMethod: 'cash',
      status: 'approved',
      paymentReference: 'PROPIEL-TEST002',
      approvedBy: adminUser.id,
      approvedAt: new Date(now.getTime() - 1 * 60 * 60000)
    });

    // 3. UPCOMING appointment (in 10 mins) - CONFIRMED
    const upcomingTimeStr = getMexicoTimeStr(10);

    const apt3 = await Appointment.create({
      patientId: patient3.id,
      doctorId: dermaDoctor.id,
      serviceId: dermaService.id,
      appointmentDate: todayStr,
      appointmentTime: upcomingTimeStr,
      status: 'confirmed',
      confirmedBy: adminUser.id,
      confirmedAt: new Date(now.getTime() - 30 * 60000),
      paymentReference: 'PROPIEL-TEST003'
    });

    await Payment.create({
      appointmentId: apt3.id,
      totalAmount: 700,
      depositAmount: 350,
      amount: 350,
      remainingBalance: 350,
      paymentMethod: 'transfer',
      status: 'approved',
      paymentReference: 'PROPIEL-TEST003',
      approvedBy: adminUser.id,
      approvedAt: new Date(now.getTime() - 30 * 60000)
    });

    // 4. IN PROGRESS appointment - IN_PROGRESS
    const inProgressTimeStr = getMexicoTimeStr(-15);

    const apt4 = await Appointment.create({
      patientId: patient4.id,
      doctorId: tamizDoctor.id,
      serviceId: tamizService.id,
      appointmentDate: todayStr,
      appointmentTime: inProgressTimeStr,
      status: 'in_progress',
      confirmedBy: adminUser.id,
      confirmedAt: new Date(now.getTime() - 2 * 60 * 60000),
      arrivedAt: new Date(now.getTime() - 20 * 60000),
      arrivedMarkedBy: adminUser.id,
      enteredConsultationAt: new Date(now.getTime() - 15 * 60000),
      enteredConsultationBy: adminUser.id,
      stateChangedAt: new Date(now.getTime() - 15 * 60000),
      stateChangedBy: adminUser.id,
      paymentReference: 'PROPIEL-TEST004'
    });

    await Payment.create({
      appointmentId: apt4.id,
      totalAmount: 350,
      depositAmount: 175,
      amount: 175,
      remainingBalance: 175,
      paymentMethod: 'cash',
      status: 'approved',
      paymentReference: 'PROPIEL-TEST004',
      approvedBy: adminUser.id,
      approvedAt: new Date(now.getTime() - 2 * 60 * 60000)
    });

    // Create state history for in-progress appointment
    await AppointmentStateHistory.create({
      appointmentId: apt4.id,
      previousState: null,
      newState: 'pending',
      changedBy: adminUser.id,
      timestamp: new Date(now.getTime() - 3 * 60 * 60000)
    });

    await AppointmentStateHistory.create({
      appointmentId: apt4.id,
      previousState: 'pending',
      newState: 'confirmed',
      changedBy: adminUser.id,
      reason: 'Pago verificado',
      timestamp: new Date(now.getTime() - 2 * 60 * 60000)
    });

    await AppointmentStateHistory.create({
      appointmentId: apt4.id,
      previousState: 'confirmed',
      newState: 'in_progress',
      changedBy: adminUser.id,
      reason: 'Paciente entró a consulta',
      timestamp: new Date(now.getTime() - 15 * 60000)
    });

    // 5. COMPLETED appointment (needs payment) - COMPLETED
    const completedTimeStr = getMexicoTimeStr(-120); // 2 hours ago (120 minutes)

    const apt5 = await Appointment.create({
      patientId: patient5.id,
      doctorId: podoDoctor.id,
      serviceId: podoService.id,
      appointmentDate: todayStr,
      appointmentTime: completedTimeStr,
      status: 'completed',
      confirmedBy: adminUser.id,
      confirmedAt: new Date(now.getTime() - 4 * 60 * 60000),
      arrivedAt: new Date(now.getTime() - 2.5 * 60 * 60000),
      arrivedMarkedBy: adminUser.id,
      enteredConsultationAt: new Date(now.getTime() - 2 * 60 * 60000),
      enteredConsultationBy: adminUser.id,
      completedAt: new Date(now.getTime() - 1 * 60 * 60000),
      completedBy: adminUser.id,
      stateChangedAt: new Date(now.getTime() - 1 * 60 * 60000),
      stateChangedBy: adminUser.id,
      paymentReference: 'PROPIEL-TEST005'
    });

    await Payment.create({
      appointmentId: apt5.id,
      totalAmount: 400,
      depositAmount: 200,
      amount: 200,
      remainingBalance: 200, // Still owes balance!
      paymentMethod: 'transfer',
      status: 'approved',
      paymentReference: 'PROPIEL-TEST005',
      approvedBy: adminUser.id,
      approvedAt: new Date(now.getTime() - 4 * 60 * 60000)
    });

    // 6. PENDING appointment (for testing approval flow)
    const apt6 = await Appointment.create({
      patientId: patient1.id,
      doctorId: dermaDoctor.id,
      serviceId: dermaService.id,
      appointmentDate: todayStr,
      appointmentTime: '14:00:00',
      status: 'pending',
      paymentReference: 'PROPIEL-TEST006'
    });

    await Payment.create({
      appointmentId: apt6.id,
      totalAmount: 700,
      depositAmount: 350,
      amount: 350,
      remainingBalance: 350,
      paymentMethod: 'transfer',
      status: 'pending',
      paymentReference: 'PROPIEL-TEST006'
    });

    console.log('✅ Sample appointments created for TODAY');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Superadmin:    username: superadmin  | password: superadmin123');
    console.log('Admin/Recep:   username: recepcion   | password: recepcion123');
    console.log('Doctor (Derma):username: derma       | password: derma123');
    console.log('Doctor (Podo): username: podo        | password: podo123');
    console.log('Doctor (Tamiz):username: tamiz       | password: tamiz123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📅 Sample Appointments Created for TODAY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. María García    - LATE (30 min ago)    - CONFIRMED');
    console.log('2. Juan Pérez      - AT TIME (now)        - CONFIRMED');
    console.log('3. Ana Rodríguez   - UPCOMING (10 min)    - CONFIRMED');
    console.log('4. Carlos Hernández- IN PROGRESS          - IN_PROGRESS');
    console.log('5. Laura Méndez    - COMPLETED (owes $200)- COMPLETED');
    console.log('6. María García    - 2:00 PM              - PENDING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
