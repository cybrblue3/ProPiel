const express = require('express');
const router = express.Router();
const { Prescription, MedicalCase, Appointment, Patient, Doctor } = require('../models');
const auth = require('../middleware/auth');

// POST /api/prescriptions - Create new prescription
router.post('/', auth, async (req, res) => {
  try {
    const {
      medicalCaseId,
      appointmentId,
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedDate
    } = req.body;

    // Validation
    if (!medicalCaseId || !medicationName) {
      return res.status(400).json({
        success: false,
        message: 'Caso médico y nombre del medicamento son requeridos'
      });
    }

    // Verify medical case exists
    const medicalCase = await MedicalCase.findByPk(medicalCaseId);
    if (!medicalCase) {
      return res.status(404).json({ success: false, message: 'Caso médico no encontrado' });
    }

    // Check permissions (doctors can only add prescriptions to their own cases)
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && medicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para agregar prescripciones a este caso'
        });
      }
    }

    // If appointmentId provided, verify it exists
    if (appointmentId) {
      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Cita no encontrada' });
      }
    }

    // Create prescription
    const prescription = await Prescription.create({
      medicalCaseId,
      appointmentId: appointmentId || null,
      medicationName,
      dosage: dosage || null,
      frequency: frequency || null,
      duration: duration || null,
      instructions: instructions || null,
      prescribedDate: prescribedDate || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Prescripción creada exitosamente',
      data: prescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ success: false, message: 'Error al crear prescripción' });
  }
});

// PUT /api/prescriptions/:id - Update prescription
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedDate
    } = req.body;

    // Find prescription
    const prescription = await Prescription.findByPk(id, {
      include: [{ model: MedicalCase }]
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescripción no encontrada' });
    }

    // Check permissions (doctors can only edit prescriptions from their own cases)
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && prescription.MedicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta prescripción'
        });
      }
    }

    // Update prescription
    await prescription.update({
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedDate
    });

    res.json({
      success: true,
      message: 'Prescripción actualizada exitosamente',
      data: prescription
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar prescripción' });
  }
});

// DELETE /api/prescriptions/:id - Delete prescription
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find prescription
    const prescription = await Prescription.findByPk(id, {
      include: [{ model: MedicalCase }]
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescripción no encontrada' });
    }

    // Check permissions (doctors can only delete prescriptions from their own cases)
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && prescription.MedicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta prescripción'
        });
      }
    }

    // Delete prescription
    await prescription.destroy();

    res.json({
      success: true,
      message: 'Prescripción eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar prescripción' });
  }
});

// GET /api/prescriptions/case/:medicalCaseId - Get all prescriptions for a medical case
router.get('/case/:medicalCaseId', auth, async (req, res) => {
  try {
    const { medicalCaseId } = req.params;

    // Verify medical case exists
    const medicalCase = await MedicalCase.findByPk(medicalCaseId);
    if (!medicalCase) {
      return res.status(404).json({ success: false, message: 'Caso médico no encontrado' });
    }

    // Check permissions
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && medicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver estas prescripciones'
        });
      }
    }

    // Get prescriptions
    const prescriptions = await Prescription.findAll({
      where: { medicalCaseId },
      include: [
        {
          model: Appointment,
          attributes: ['id', 'appointmentDate', 'appointmentTime']
        }
      ],
      order: [['prescribedDate', 'DESC']]
    });

    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Error al obtener prescripciones' });
  }
});

module.exports = router;
