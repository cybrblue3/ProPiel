/**
 * WhatsApp Notification Helper
 * Uses web.whatsapp.com for sending messages (free, no API key needed)
 */

/**
 * Format phone number to international format
 * @param {string} phone - 10-digit phone number
 * @param {string} countryCode - Country code (default: '52' for Mexico)
 * @returns {string} - Full international phone number
 */
const formatPhoneNumber = (phone, countryCode = '52') => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // If already has country code, return as is
  if (cleanPhone.length > 10) {
    return cleanPhone;
  }

  // Add country code
  return `${countryCode}${cleanPhone}`;
};

/**
 * Format date for display (DD/MM/YYYY)
 * Parses date string directly to avoid timezone conversion issues
 */
const formatDate = (date) => {
  // If date is already a string in YYYY-MM-DD format, parse it directly
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  // Fallback to Date object parsing
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time for display (HH:MM AM/PM)
 */
const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Generate WhatsApp confirmation message
 */
const generateConfirmationMessage = (appointmentData) => {
  const {
    patientName,
    serviceName,
    appointmentDate,
    appointmentTime,
    bookerName
  } = appointmentData;

  const formattedDate = formatDate(appointmentDate);
  const formattedTime = formatTime(appointmentTime);

  // If someone else booked, address the booker but mention patient
  const greeting = bookerName
    ? `Hola *${bookerName}* 👋`
    : `Hola *${patientName}* 👋`;

  const patientInfo = bookerName && bookerName !== patientName
    ? `para *${patientName}* `
    : '';

  return `${greeting}

✅ La cita ${patientInfo}en *Clínica ProPiel* para *${serviceName}* ha sido *confirmada*.

📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${formattedTime}

📍 Por favor ${bookerName ? 'lleguen' : 'llega'} 10 minutos antes.

Si necesitas reprogramar, responde a este mensaje.

¡Gracias por confiar en nosotros! 💙`;
};

/**
 * Generate WhatsApp cancellation message
 */
const generateCancellationMessage = (appointmentData) => {
  const {
    patientName,
    serviceName,
    appointmentDate,
    appointmentTime,
    cancellationReason,
    bookerName
  } = appointmentData;

  const formattedDate = formatDate(appointmentDate);
  const formattedTime = formatTime(appointmentTime);

  const greeting = bookerName
    ? `Hola *${bookerName}* 👋`
    : `Hola *${patientName}* 👋`;

  const patientInfo = bookerName && bookerName !== patientName
    ? `de *${patientName}* `
    : '';

  const reasonText = cancellationReason
    ? `\n📝 *Motivo:* ${cancellationReason}`
    : '';

  return `${greeting}

⚠️ Lamentamos informarte que la cita ${patientInfo}en *Clínica ProPiel* para *${serviceName}* ha sido *cancelada*.

📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${formattedTime}${reasonText}

Por favor contáctanos para reprogramar o resolver cualquier duda.

Disculpa las molestias ocasionadas 🙏`;
};

/**
 * Generate WhatsApp reminder message (for future use)
 */
const generateReminderMessage = (appointmentData) => {
  const {
    patientName,
    serviceName,
    appointmentDate,
    appointmentTime,
    bookerName
  } = appointmentData;

  const formattedDate = formatDate(appointmentDate);
  const formattedTime = formatTime(appointmentTime);

  const greeting = bookerName
    ? `Hola *${bookerName}* 👋`
    : `Hola *${patientName}* 👋`;

  const patientInfo = bookerName && bookerName !== patientName
    ? `de *${patientName}* `
    : '';

  return `${greeting}

🔔 *Recordatorio de cita*

Tu cita ${patientInfo}en *Clínica ProPiel* es mañana:

📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${formattedTime}
🏥 *Servicio:* ${serviceName}

📍 Recuerda llegar 10 minutos antes.

¡Nos vemos pronto! 💙`;
};

/**
 * Custom encoding for WhatsApp that preserves emojis as raw Unicode
 * Only encodes URL-breaking characters, leaves emojis untouched
 */
const encodeWhatsAppMessage = (message) => {
  // Split message into array of characters to handle emojis properly
  return Array.from(message).map(char => {
    const code = char.charCodeAt(0);

    // If it's an emoji or high Unicode (> 127), leave it as is
    if (code > 127) {
      return char;
    }

    // Encode specific URL-breaking characters
    switch (char) {
      case ' ': return '%20';
      case '\n': return '%0A';
      case '\r': return '%0D';
      case '%': return '%25';
      case '#': return '%23';
      case '&': return '%26';
      case '+': return '%2B';
      case '=': return '%3D';
      case '?': return '%3F';
      default: return char;
    }
  }).join('');
};

/**
 * Create WhatsApp web URL for sending message
 * @param {string} phone - Phone number (will be formatted to international)
 * @param {string} message - Message text
 * @returns {string} - WhatsApp web URL
 */
const createWhatsAppURL = (phone, message) => {
  const formattedPhone = formatPhoneNumber(phone);
  // Use encodeURIComponent for api.whatsapp.com endpoint (it handles emojis better)
  const encodedMessage = encodeURIComponent(message);

  // Use api.whatsapp.com/send directly instead of wa.me to preserve emojis
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
};

/**
 * Get notification phone number (booker or patient)
 */
const getNotificationPhone = (appointment) => {
  // If someone else booked, notify them
  if (appointment.bookedByPhone) {
    return appointment.bookedByPhone;
  }

  // Otherwise notify patient
  if (appointment.Patient && appointment.Patient.phone) {
    return formatPhoneNumber(
      appointment.Patient.phone,
      appointment.Patient.phoneCountryCode || '52'
    );
  }

  return null;
};

/**
 * Send WhatsApp notification (returns URL to open)
 * Note: Actual sending requires manual action (clicking the URL)
 * For automated sending, you would need WhatsApp Business API
 */
const sendWhatsAppNotification = (appointment, type = 'confirmation') => {
  try {
    const phone = getNotificationPhone(appointment);

    if (!phone) {
      console.warn('No phone number available for WhatsApp notification');
      return null;
    }

    const appointmentData = {
      patientName: appointment.Patient.fullName,
      serviceName: appointment.Service.name,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      bookerName: appointment.bookedByName,
      cancellationReason: appointment.cancellationReason
    };

    let message;
    switch (type) {
      case 'confirmation':
        message = generateConfirmationMessage(appointmentData);
        break;
      case 'cancellation':
        message = generateCancellationMessage(appointmentData);
        break;
      case 'reminder':
        message = generateReminderMessage(appointmentData);
        break;
      default:
        message = generateConfirmationMessage(appointmentData);
    }

    const whatsappURL = createWhatsAppURL(phone, message);

    return {
      success: true,
      phone,
      message,
      url: whatsappURL
    };

  } catch (error) {
    console.error('Error generating WhatsApp notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendWhatsAppNotification,
  createWhatsAppURL,
  formatPhoneNumber,
  formatDate,
  formatTime,
  generateConfirmationMessage,
  generateCancellationMessage,
  generateReminderMessage
};
