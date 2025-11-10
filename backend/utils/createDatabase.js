const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  try {
    console.log('🔄 Conectando a MySQL...');

    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Conectado a MySQL');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME;
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Base de datos "${dbName}" creada (o ya existe)`);

    // Close connection
    await connection.end();
    console.log('✅ Todo listo! Ahora puedes ejecutar: npm run seed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  PROBLEMA: Usuario o contraseña incorrectos');
      console.error('👉 Revisa tu archivo .env:');
      console.error('   - DB_USER (actualmente: ' + process.env.DB_USER + ')');
      console.error('   - DB_PASSWORD (verifica que sea correcta)\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  PROBLEMA: No se puede conectar a MySQL');
      console.error('👉 Asegúrate que MySQL esté corriendo en services.msc\n');
    }

    process.exit(1);
  }
};

createDatabase();
