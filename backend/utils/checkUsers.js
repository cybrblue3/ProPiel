const sequelize = require('../config/db');
const { User } = require('../models');

const checkUsers = async () => {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');

    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'fullName', 'isActive']
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos!');
      console.log('👉 Ejecuta: npm run seed\n');
      process.exit(1);
    }

    console.log(`✅ Encontrados ${users.length} usuarios:\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    users.forEach(user => {
      console.log(`ID: ${user.id} | Usuario: ${user.username.padEnd(15)} | Rol: ${user.role.padEnd(12)} | Nombre: ${user.fullName}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 Credenciales para login:');
    console.log('  • admin         / admin123');
    console.log('  • derma         / derma123');
    console.log('  • podo          / podo123');
    console.log('  • tamiz         / tamiz123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
