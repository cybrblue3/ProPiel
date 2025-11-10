const express = require('express');
const router = express.Router();
const { MedicalCase, Prescription, Patient, Doctor, Appointment, Photo } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// GET /api/medical-cases - List all medical cases (filtered by doctor's specialty for doctors)
router.get('/', auth, async (req, res) => {
  try {
    const { specialty, status, patientId } = req.query;

    // Build where clause
    const whereClause = {};

    // If doctor role, filter by their specialty
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      whereClause.specialty = doctor.specialty;
      whereClause.doctorId = doctor.id;
    }

    // Apply additional filters
    if (specialty) whereClause.specialty = specialty;
    if (status) whereClause.status = status;
    if (patientId) whereClause.patientId = patientId;

    const cases = await MedicalCase.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'birthDate']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: cases });
  } catch (error) {
    console.error('Error fetching medical cases:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos médicos' });
  }
});

// GET /api/medical-cases/:id - Get single medical case with full details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const medicalCase = await MedicalCase.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'email', 'birthDate', 'gender', 'address']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty', 'phone', 'email']
        },
        {
          model: Prescription,
          include: [
            {
              model: Appointment,
              attributes: ['id', 'appointmentDate', 'appointmentTime']
            }
          ],
          order: [['prescribedDate', 'DESC']]
        },
        {
          model: Photo,
          order: [['uploadDate', 'DESC'], ['createdAt', 'DESC']]
        }
      ]
    });

    if (!medicalCase) {
      return res.status(404).json({ success: false, message: 'Caso médico no encontrado' });
    }

    // Check access permissions
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && medicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este caso'
        });
      }
    }

    res.json({ success: true, data: medicalCase });
  } catch (error) {
    console.error('Error fetching medical case:', error);
    res.status(500).json({ success: false, message: 'Error al obtener caso médico' });
  }
});

// GET /api/medical-cases/patient/:patientId - Get all medical cases for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    const whereClause = { patientId };

    // If doctor role, filter by their cases only
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      whereClause.doctorId = doctor.id;
    }

    const cases = await MedicalCase.findAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty']
        },
        {
          model: Prescription,
          attributes: ['id', 'medicationName', 'prescribedDate'],
          separate: true,
          limit: 3,
          order: [['prescribedDate', 'DESC']]
        }
      ],
      order: [
        ['isActive', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: {
        patient,
        cases
      }
    });
  } catch (error) {
    console.error('Error fetching patient medical cases:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos del paciente' });
  }
});

// POST /api/medical-cases - Create new medical case
router.post('/', auth, async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      conditionName,
      specialty,
      severity,
      symptoms,
      affectedArea,
      onsetDate,
      previousTreatments,
      treatmentGoal,
      status,
      startDate,
      endDate,
      notes,
      isActive
    } = req.body;

    // Validation
    if (!patientId || !doctorId || !conditionName || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'Paciente, doctor, condición y especialidad son requeridos'
      });
    }

    // Validate end date based on status
    if ((status === 'Curado' || status === 'Inactivo') && !endDate) {
      return res.status(400).json({
        success: false,
        message: `Fecha de finalización es requerida para casos con estado "${status}"`
      });
    }

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor no encontrado' });
    }

    // Clear end date if status is En Tratamiento or Crónico
    const finalStatus = status || 'En Tratamiento';
    const finalEndDate = (finalStatus === 'En Tratamiento' || finalStatus === 'Crónico') ? null : (endDate || null);

    // Convert empty strings to null for date fields
    const finalOnsetDate = onsetDate && onsetDate.trim() !== '' && onsetDate !== 'Invalid date' ? onsetDate : null;

    // Create medical case
    const medicalCase = await MedicalCase.create({
      patientId,
      doctorId,
      conditionName,
      specialty,
      severity: severity || 'Moderado',
      symptoms,
      affectedArea,
      onsetDate: finalOnsetDate,
      previousTreatments,
      treatmentGoal,
      status: finalStatus,
      startDate,
      endDate: finalEndDate,
      notes,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Caso médico creado exitosamente',
      data: medicalCase
    });
  } catch (error) {
    console.error('Error creating medical case:', error);
    res.status(500).json({ success: false, message: 'Error al crear caso médico' });
  }
});

// PUT /api/medical-cases/:id - Update medical case
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientId,
      doctorId,
      conditionName,
      specialty,
      severity,
      symptoms,
      affectedArea,
      onsetDate,
      previousTreatments,
      treatmentGoal,
      status,
      startDate,
      endDate,
      notes,
      isActive
    } = req.body;

    // Find medical case
    const medicalCase = await MedicalCase.findByPk(id);
    if (!medicalCase) {
      return res.status(404).json({ success: false, message: 'Caso médico no encontrado' });
    }

    // Check permissions (doctors can only edit their own cases)
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && medicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar este caso'
        });
      }
    }

    // Validate end date based on status
    if ((status === 'Curado' || status === 'Inactivo') && !endDate) {
      return res.status(400).json({
        success: false,
        message: `Fecha de finalización es requerida para casos con estado "${status}"`
      });
    }

    // Clear end date if status is En Tratamiento or Crónico
    const finalEndDate = (status === 'En Tratamiento' || status === 'Crónico') ? null : (endDate || null);

    // Convert empty strings to null for date fields
    const finalOnsetDate = onsetDate && onsetDate.trim() !== '' && onsetDate !== 'Invalid date' ? onsetDate : null;

    // Update medical case
    await medicalCase.update({
      patientId,
      doctorId,
      conditionName,
      specialty,
      severity,
      symptoms,
      affectedArea,
      onsetDate: finalOnsetDate,
      previousTreatments,
      treatmentGoal,
      status,
      startDate,
      endDate: finalEndDate,
      notes,
      isActive
    });

    res.json({
      success: true,
      message: 'Caso médico actualizado exitosamente',
      data: medicalCase
    });
  } catch (error) {
    console.error('Error updating medical case:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar caso médico' });
  }
});

module.exports = router;
