const sequelize = require('../config/db');
const { User, Doctor, Service, Schedule, PaymentConfig } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (will create tables)
    await sequelize.sync({ force: true }); // WARNING: This drops all tables!
    console.log('✅ Database tables created');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@propiel.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin',
      fullName: 'Administrator',
      phone: '+527551940425'
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create receptionist user
    const receptionistUser = await User.create({
      username: 'receptionist',
      email: 'receptionist@propiel.com',
      password: 'receptionist123',
      role: 'receptionist',
      fullName: 'Receptionist User',
      phone: '+527551940426'
    });
    console.log('✅ Receptionist user created (username: receptionist, password: receptionist123)');

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
    await Service.create({
      name: 'Dermatología',
      description: 'Consulta general de dermatología, diagnóstico y tratamiento de enfermedades de la piel.',
      price: 700.00,
      depositPercentage: 50,
      duration: 60
    });

    await Service.create({
      name: 'Podología',
      description: 'Consulta y tratamiento de problemas en los pies.',
      price: 400.00,
      depositPercentage: 50,
      duration: 45
    });

    await Service.create({
      name: 'Tamiz',
      description: 'Prueba de tamiz neonatal para detectar enfermedades congénitas.',
      price: 350.00,
      depositPercentage: 50,
      duration: 30
    });

    console.log('✅ Services created');

    // Create schedules for all doctors
    // All doctors work Monday-Saturday, 9am-3pm (break at 3pm-4pm), then 4pm-6pm
    // Slot duration: 1 hour
    const podoService = await Service.findOne({ where: { name: 'Podología' } });
    const tamizService = await Service.findOne({ where: { name: 'Tamiz' } });
    const dermaService = await Service.findOne({ where: { name: 'Dermatología' } });

    const doctors = [
      { doctor: dermaDoctor, service: dermaService, name: 'Dr. Hugo (Dermatología)' },
      { doctor: podoDoctor, service: podoService, name: 'Dra. Mayra (Podología)' },
      { doctor: tamizDoctor, service: tamizService, name: 'Dr. José (Tamiz)' }
    ];

    for (const { doctor, service, name } of doctors) {
      for (let day = 1; day <= 6; day++) { // Monday=1 to Saturday=6
        // Morning shift: 9:00 AM - 3:00 PM (6 hours, 6 slots of 1 hour each)
        await Schedule.create({
          doctorId: doctor.id,
          serviceId: service.id,
          dayOfWeek: day,
          startTime: '09:00:00',
          endTime: '15:00:00',
          slotDuration: 60 // 1 hour slots
        });

        // Afternoon shift: 4:00 PM - 6:00 PM (2 hours, 2 slots of 1 hour each)
        await Schedule.create({
          doctorId: doctor.id,
          serviceId: service.id,
          dayOfWeek: day,
          startTime: '16:00:00',
          endTime: '18:00:00',
          slotDuration: 60 // 1 hour slots
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
    console.log('✅ Payment config created (update with real bank details later)');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:         username: admin       | password: admin123');
    console.log('Receptionist:  username: receptionist| password: receptionist123');
    console.log('Doctor (Derma):username: derma       | password: derma123');
    console.log('Doctor (Podo): username: podo        | password: podo123');
    console.log('Doctor (Tamiz):username: tamiz       | password: tamiz123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
