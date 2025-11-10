const { Schedule, Appointment, AppointmentHold, Doctor, Service, BlockedDate } = require('../models');
const { Op } = require('sequelize');

/**
 * Check if a date is blocked (holiday or exception)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>}
 */
const isBlockedDate = async (date) => {
  const blocked = await BlockedDate.findOne({
    where: {
      date: date,
      isActive: true
    }
  });

  return blocked !== null;
};

/**
 * Get available time slots for a specific service and date
 * @param {number} serviceId - Service ID
 * @param {string} appointmentDate - Date in YYYY-MM-DD format
 * @returns {Array} Array of time slot objects with status
 */
const getAvailableSlots = async (serviceId, appointmentDate) => {
  try {
    // Check if date is blocked (holiday or exception)
    if (await isBlockedDate(appointmentDate)) {
      return {
        success: false,
        message: 'La fecha seleccionada no está disponible (día festivo o excepción).',
        slots: []
      };
    }

    // Get day of week (1=Monday, 6=Saturday, 0=Sunday)
    // Parse date properly to avoid timezone issues
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // Check if Sunday
    if (dayOfWeek === 0) {
      return {
        success: false,
        message: 'La clínica está cerrada los domingos.',
        slots: []
      };
    }

    // Find service and associated doctor
    const service = await Service.findByPk(serviceId, {
      include: [{
        model: Schedule,
        where: { dayOfWeek, isActive: true },
        required: false,
        include: [{
          model: Doctor,
          required: true
        }]
      }]
    });

    if (!service || !service.Schedules || service.Schedules.length === 0) {
      return {
        success: false,
        message: 'No hay horarios disponibles para este servicio en el día seleccionado.',
        slots: []
      };
    }

    // Get all schedule templates for this day
    const allSlots = [];

    for (const schedule of service.Schedules) {
      const doctorId = schedule.Doctor.id;
      const slots = generateSlotsFromSchedule(schedule);

      // Get booked appointments for this doctor/date
      const bookedAppointments = await Appointment.findAll({
        where: {
          doctorId,
          appointmentDate,
          status: {
            [Op.in]: ['pending', 'confirmed']
          }
        },
        attributes: ['appointmentTime']
      });

      const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);

      // Get active holds for this doctor/date
      const activeHolds = await AppointmentHold.findAll({
        where: {
          doctorId,
          appointmentDate,
          expiresAt: {
            [Op.gt]: new Date() // Not expired
          }
        },
        attributes: ['appointmentTime']
      });

      const heldTimes = activeHolds.map(hold => hold.appointmentTime);

      // Mark slots as available/booked/held
      slots.forEach(slot => {
        const timeStr = slot.time;

        if (bookedTimes.includes(timeStr)) {
          slot.status = 'booked';
        } else if (heldTimes.includes(timeStr)) {
          slot.status = 'held';
        } else if (isPastTime(appointmentDate, timeStr)) {
          slot.status = 'past';
        } else {
          slot.status = 'available';
        }

        slot.doctorId = doctorId;
        slot.doctorName = schedule.Doctor.fullName;
      });

      allSlots.push(...slots);
    }

    // Filter out past, booked, and held slots for the response
    const availableSlots = allSlots.filter(slot => slot.status === 'available');

    // Count slots by status
    const statusCounts = allSlots.reduce((acc, slot) => {
      acc[slot.status] = (acc[slot.status] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      slots: availableSlots,
      allSlots // Include all for admin view if needed
    };

  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
};

/**
 * Generate time slots from a schedule template
 */
const generateSlotsFromSchedule = (schedule) => {
  const slots = [];
  const { startTime, endTime, slotDuration } = schedule;

  // Parse times (format: "09:00:00")
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}:00`;

    slots.push({
      time: timeStr,
      displayTime: `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
      status: 'unknown' // Will be determined later
    });

    // Add slot duration (in minutes)
    currentMinute += slotDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

/**
 * Check if a time slot is in the past
 */
const isPastTime = (appointmentDate, appointmentTime) => {
  const now = new Date();
  const [hours, minutes] = appointmentTime.split(':').map(Number);

  // Parse date properly to avoid timezone issues
  // appointmentDate format: "2025-11-09"
  const [year, month, day] = appointmentDate.split('-').map(Number);

  // Create date in local timezone (not UTC)
  const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  return slotDateTime < now;
};

/**
 * Check if a slot is available (not booked, not held, not past)
 * @param {string} excludeHoldToken - Optional hold token to exclude from check (for the current user's hold)
 */
const isSlotAvailable = async (serviceId, doctorId, appointmentDate, appointmentTime, excludeHoldToken = null) => {
  try {
    // Check if time is in the past
    if (isPastTime(appointmentDate, appointmentTime)) {
      return false;
    }

    // Check for existing appointments
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      }
    });

    if (existingAppointment) {
      return false;
    }

    // Check for active holds (excluding the current user's hold if provided)
    const holdWhere = {
      doctorId,
      appointmentDate,
      appointmentTime,
      expiresAt: {
        [Op.gt]: new Date()
      }
    };

    // Exclude the current user's hold token
    if (excludeHoldToken) {
      holdWhere.holdToken = {
        [Op.ne]: excludeHoldToken
      };
    }

    const activeHold = await AppointmentHold.findOne({
      where: holdWhere
    });

    if (activeHold) {
      return false;
    }

    return true;

  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
};

module.exports = {
  getAvailableSlots,
  isSlotAvailable,
  isBlockedDate,
  isPastTime
};
