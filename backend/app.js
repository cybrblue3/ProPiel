const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection
const sequelize = require('./config/db');

// Import all models (this also sets up relationships)
const models = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const publicBookingRoutes = require('./routes/publicBookingRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const medicalCaseRoutes = require('./routes/medicalCaseRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const photoRoutes = require('./routes/photoRoutes');

// Initialize Express app
const app = express();

// ===================================
// MIDDLEWARE
// ===================================

// CORS configuration - Allow requests from frontend
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_DASHBOARD_URL,
      process.env.FRONTEND_BOOKING_URL
    ].filter(Boolean) // Remove undefined values
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===================================
// ROUTES
// ===================================

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ProPiel Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicBookingRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medical-cases', medicalCaseRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/photos', photoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===================================
// DATABASE SYNC & SERVER START
// ===================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync database (creates tables if they don't exist)
    // Use { alter: true } during development, { force: false } in production
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
