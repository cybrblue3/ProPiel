const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate an informed consent PDF with patient data and digital signature
 * @param {Object} appointmentData - Appointment and patient information
 * @param {string} signatureImagePath - Path to the signature image file
 * @param {string} outputPdfPath - Path where the PDF will be saved
 * @returns {Promise<string>} - Returns the output PDF path
 */
async function generateConsentPDF(appointmentData, signatureImagePath, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ size: 'letter', margin: 50 });

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CLÍNICA PROPIEL', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('CONSENTIMIENTO INFORMADO', { align: 'center' })
        .moveDown(1);

      // Patient Information Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DATOS DEL PACIENTE', { underline: true })
        .moveDown(0.5);

      doc
        .font('Helvetica')
        .fontSize(11)
        .text(`Nombre completo: ${appointmentData.patientName}`, { continued: false })
        .moveDown(0.3)
        .text(`Fecha de nacimiento: ${appointmentData.patientBirthDate}`)
        .moveDown(0.3)
        .text(`Sexo: ${appointmentData.patientGender === 'male' ? 'Masculino' : 'Femenino'}`)
        .moveDown(0.3)
        .text(`Teléfono: ${appointmentData.patientPhone || 'No proporcionado'}`)
        .moveDown(1);

      // Appointment Information Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DATOS DE LA CITA', { underline: true })
        .moveDown(0.5);

      doc
        .font('Helvetica')
        .fontSize(11)
        .text(`Servicio: ${appointmentData.serviceName}`)
        .moveDown(0.3)
        .text(`Fecha: ${appointmentData.appointmentDate}`)
        .moveDown(0.3)
        .text(`Hora: ${appointmentData.appointmentTime}`)
        .moveDown(0.3)
        .text(`Doctor: ${appointmentData.doctorName}`)
        .moveDown(1.5);

      // Consent Text Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DECLARACIÓN DE CONSENTIMIENTO', { underline: true })
        .moveDown(0.5);

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          'Por medio del presente documento, yo, el/la paciente arriba mencionado(a), ' +
          'declaro que he sido informado(a) de manera clara y completa sobre:',
          { align: 'justify' }
        )
        .moveDown(0.5);

      // Consent bullet points
      const consentPoints = [
        'La naturaleza del procedimiento o tratamiento dermatológico que se me realizará',
        'Los beneficios esperados del tratamiento',
        'Los riesgos y posibles complicaciones asociados',
        'Las alternativas de tratamiento disponibles',
        'Los cuidados post-tratamiento necesarios',
        'El costo del procedimiento y las políticas de pago de la clínica'
      ];

      consentPoints.forEach((point, index) => {
        doc.text(`${index + 1}. ${point}`, { indent: 20, align: 'justify' });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .text(
          'He tenido la oportunidad de hacer preguntas y todas mis dudas han sido respondidas ' +
          'de manera satisfactoria. Entiendo que puedo retirar este consentimiento en cualquier momento ' +
          'antes de que se realice el procedimiento.',
          { align: 'justify' }
        )
        .moveDown(0.5);

      doc
        .text(
          'Por lo anterior, otorgo mi consentimiento libre y voluntario para que se me realice ' +
          'el procedimiento arriba mencionado.',
          { align: 'justify' }
        )
        .moveDown(1.5);

      // Signature Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('FIRMA DEL PACIENTE', { underline: true })
        .moveDown(0.5);

      // Add signature image if provided
      if (signatureImagePath && fs.existsSync(signatureImagePath)) {
        try {
          doc.image(signatureImagePath, {
            fit: [300, 100],
            align: 'left'
          });
          doc.moveDown(0.5);
        } catch (imgError) {
          console.error('Error adding signature image to PDF:', imgError);
          doc.text('[Firma digital no disponible]');
          doc.moveDown(1);
        }
      } else {
        doc.text('[Firma digital]');
        doc.moveDown(1);
      }

      // Signature line
      doc
        .moveTo(50, doc.y)
        .lineTo(300, doc.y)
        .stroke();

      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Nombre: ${appointmentData.patientName}`)
        .moveDown(0.3)
        .text(`Fecha: ${new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`)
        .moveDown(1.5);

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Este documento ha sido generado electrónicamente y contiene una firma digital válida. ' +
          'Clínica ProPiel - Sistema de Reservas en Línea',
          { align: 'center', color: 'gray' }
        );

      // Finalize the PDF
      doc.end();

      // Wait for the stream to finish
      stream.on('finish', () => {
        resolve(outputPdfPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a medical prescription PDF
 * @param {Object} prescriptionData - Prescription, patient, and doctor information
 * @param {string} outputPdfPath - Path where the PDF will be saved
 * @returns {Promise<string>} - Returns the output PDF path
 */
async function generatePrescriptionPDF(prescriptionData, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'letter', margin: 50 });
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Header with clinic info
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('CLÍNICA PROPIEL', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Especialistas en Dermatología', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('RECETA MÉDICA', { align: 'center' })
        .moveDown(1);

      // Prescription number and date
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`No. Receta: ${prescriptionData.prescriptionId || 'N/A'}`, { align: 'right' })
        .text(`Fecha: ${prescriptionData.prescribedDate}`, { align: 'right' })
        .moveDown(1);

      // Horizontal line
      doc
        .strokeColor('#1976d2')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .stroke()
        .moveDown(1);

      // Patient Information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('DATOS DEL PACIENTE')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text(`Nombre: ${prescriptionData.patientName}`)
        .moveDown(0.3);

      if (prescriptionData.patientAge) {
        doc.text(`Edad: ${prescriptionData.patientAge}`).moveDown(0.3);
      }

      if (prescriptionData.patientAllergies) {
        doc
          .font('Helvetica-Bold')
          .fillColor('#d32f2f')
          .text(`⚠ Alergias: ${prescriptionData.patientAllergies}`)
          .font('Helvetica')
          .fillColor('#333333')
          .moveDown(0.3);
      }

      doc.moveDown(1);

      // Prescription Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('MEDICAMENTO PRESCRITO')
        .moveDown(0.5);

      // Medication box
      const boxY = doc.y;
      doc
        .rect(50, boxY, 512, 120)
        .fillAndStroke('#f5f5f5', '#e0e0e0');

      doc.y = boxY + 15;
      doc.x = 70;

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(`💊 ${prescriptionData.medicationName}`, { continued: false });

      doc.moveDown(0.5);

      if (prescriptionData.dosage) {
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(`Dosis: ${prescriptionData.dosage}`);
      }

      if (prescriptionData.frequency) {
        doc.text(`Frecuencia: ${prescriptionData.frequency}`);
      }

      if (prescriptionData.duration) {
        doc.text(`Duración: ${prescriptionData.duration}`);
      }

      doc.x = 50;
      doc.y = boxY + 135;
      doc.moveDown(1);

      // Instructions
      if (prescriptionData.instructions) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#1976d2')
          .text('INSTRUCCIONES')
          .moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#333333')
          .text(prescriptionData.instructions, { align: 'justify' })
          .moveDown(1);
      }

      // Condition/Diagnosis
      if (prescriptionData.conditionName) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#1976d2')
          .text('DIAGNÓSTICO')
          .moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#333333')
          .text(prescriptionData.conditionName)
          .moveDown(1.5);
      }

      // Doctor signature section
      doc.moveDown(2);

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('MÉDICO TRATANTE')
        .moveDown(1);

      // Signature line
      doc
        .strokeColor('#333333')
        .lineWidth(1)
        .moveTo(50, doc.y + 30)
        .lineTo(250, doc.y + 30)
        .stroke();

      doc.y += 35;

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(`Dr. ${prescriptionData.doctorName}`)
        .moveDown(0.3);

      if (prescriptionData.doctorSpecialty) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#666666')
          .text(prescriptionData.doctorSpecialty);
      }

      if (prescriptionData.doctorLicense) {
        doc.text(`Cédula Profesional: ${prescriptionData.doctorLicense}`);
      }

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          'Este documento ha sido generado electrónicamente por el sistema de Clínica ProPiel.',
          50,
          doc.page.height - 50,
          { align: 'center', width: 512 }
        );

      doc.end();

      stream.on('finish', () => {
        resolve(outputPdfPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate an appointment receipt PDF
 * @param {Object} appointmentData - Appointment, patient, and service information
 * @param {string} outputPdfPath - Path where the PDF will be saved
 * @returns {Promise<string>} - Returns the output PDF path
 */
async function generateAppointmentReceiptPDF(appointmentData, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'letter', margin: 50 });
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Header with clinic info
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('CLÍNICA PROPIEL', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Especialistas en Dermatología', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('COMPROBANTE DE CITA', { align: 'center' })
        .moveDown(1);

      // Confirmation number box
      const confirmBoxY = doc.y;
      doc
        .rect(150, confirmBoxY, 312, 50)
        .fillAndStroke('#e3f2fd', '#1976d2');

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#1976d2')
        .text('No. de Confirmación', 150, confirmBoxY + 10, { width: 312, align: 'center' });

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(`#${appointmentData.appointmentId}`, 150, confirmBoxY + 28, { width: 312, align: 'center' });

      doc.y = confirmBoxY + 70;
      doc.moveDown(1);

      // Status badge
      const statusColors = {
        pending: { bg: '#fff3e0', text: '#e65100', label: 'PENDIENTE' },
        confirmed: { bg: '#e8f5e9', text: '#2e7d32', label: 'CONFIRMADA' },
        completed: { bg: '#e3f2fd', text: '#1565c0', label: 'COMPLETADA' },
        cancelled: { bg: '#ffebee', text: '#c62828', label: 'CANCELADA' }
      };

      const status = statusColors[appointmentData.status] || statusColors.pending;

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(status.text)
        .text(`Estado: ${status.label}`, { align: 'center' })
        .moveDown(1.5);

      // Horizontal line
      doc
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .stroke()
        .moveDown(1);

      // Appointment Details Section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('DETALLES DE LA CITA')
        .moveDown(0.5);

      // Two-column layout for details
      const detailsY = doc.y;
      const leftCol = 50;
      const rightCol = 300;

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Fecha:', leftCol, detailsY);
      doc
        .font('Helvetica')
        .text(appointmentData.appointmentDate, leftCol + 80, detailsY);

      doc
        .font('Helvetica-Bold')
        .text('Hora:', rightCol, detailsY);
      doc
        .font('Helvetica')
        .text(appointmentData.appointmentTime, rightCol + 80, detailsY);

      doc.y = detailsY + 25;

      doc
        .font('Helvetica-Bold')
        .text('Servicio:', leftCol, doc.y);
      doc
        .font('Helvetica')
        .text(appointmentData.serviceName, leftCol + 80, doc.y);

      doc.y += 25;

      doc
        .font('Helvetica-Bold')
        .text('Duración:', leftCol, doc.y);
      doc
        .font('Helvetica')
        .text(`${appointmentData.serviceDuration || 30} minutos`, leftCol + 80, doc.y);

      doc.y += 25;

      doc
        .font('Helvetica-Bold')
        .text('Doctor:', leftCol, doc.y);
      doc
        .font('Helvetica')
        .text(`Dr. ${appointmentData.doctorName}`, leftCol + 80, doc.y);

      if (appointmentData.doctorSpecialty) {
        doc.y += 15;
        doc
          .fontSize(10)
          .fillColor('#666666')
          .text(appointmentData.doctorSpecialty, leftCol + 80, doc.y);
      }

      doc.y += 35;

      // Horizontal line
      doc
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .stroke()
        .moveDown(1);

      // Patient Information Section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('DATOS DEL PACIENTE')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Nombre:', leftCol, doc.y);
      doc
        .font('Helvetica')
        .text(appointmentData.patientName, leftCol + 80, doc.y);

      doc.y += 20;

      if (appointmentData.patientPhone) {
        doc
          .font('Helvetica-Bold')
          .text('Teléfono:', leftCol, doc.y);
        doc
          .font('Helvetica')
          .text(appointmentData.patientPhone, leftCol + 80, doc.y);
        doc.y += 20;
      }

      if (appointmentData.patientEmail) {
        doc
          .font('Helvetica-Bold')
          .text('Email:', leftCol, doc.y);
        doc
          .font('Helvetica')
          .text(appointmentData.patientEmail, leftCol + 80, doc.y);
        doc.y += 20;
      }

      doc.y += 20;

      // Important notes box
      doc
        .rect(50, doc.y, 512, 80)
        .fillAndStroke('#fff8e1', '#ffc107');

      doc.y += 15;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#f57c00')
        .text('RECORDATORIO IMPORTANTE', 70, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text('• Por favor llegue 10 minutos antes de su cita', 70)
        .text('• Traiga este comprobante impreso o en su celular', 70)
        .text('• En caso de no poder asistir, cancele con 24 horas de anticipación', 70);

      doc.y += 40;

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          `Documento generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          50,
          doc.page.height - 70,
          { align: 'center', width: 512 }
        )
        .text(
          'Clínica ProPiel - Sistema de Reservas en Línea',
          50,
          doc.page.height - 50,
          { align: 'center', width: 512 }
        );

      doc.end();

      stream.on('finish', () => {
        resolve(outputPdfPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a patient expediente summary PDF
 * @param {Object} patientData - Complete patient data including cases, prescriptions, appointments
 * @param {string} outputPdfPath - Path where the PDF will be saved
 * @returns {Promise<string>} - Returns the output PDF path
 */
async function generateExpedientePDF(patientData, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'letter', margin: 40, bufferPages: true });
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Helper function to format dates
      const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // ========== PAGE 1: Patient Info & Summary ==========
      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('CLÍNICA PROPIEL', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Especialistas en Dermatología', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('EXPEDIENTE DEL PACIENTE', { align: 'center' })
        .moveDown(1);

      // Patient ID Badge
      const badgeY = doc.y;
      doc
        .rect(200, badgeY, 212, 40)
        .fillAndStroke('#e3f2fd', '#1976d2');

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#1976d2')
        .text('No. Expediente', 200, badgeY + 8, { width: 212, align: 'center' });

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`#${patientData.patient.id}`, 200, badgeY + 22, { width: 212, align: 'center' });

      doc.y = badgeY + 55;
      doc.moveDown(1);

      // Patient Personal Information Section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('DATOS PERSONALES')
        .moveDown(0.5);

      const infoY = doc.y;
      const col1 = 40;
      const col2 = 300;

      // Left column
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Nombre:', col1, infoY);
      doc.font('Helvetica').text(patientData.patient.fullName, col1 + 70, infoY);

      doc.font('Helvetica-Bold').text('Teléfono:', col1, infoY + 18);
      doc.font('Helvetica').text(patientData.patient.phone || 'No registrado', col1 + 70, infoY + 18);

      doc.font('Helvetica-Bold').text('Email:', col1, infoY + 36);
      doc.font('Helvetica').text(patientData.patient.email || 'No registrado', col1 + 70, infoY + 36);

      // Right column
      doc.font('Helvetica-Bold').text('Fecha Nac.:', col2, infoY);
      doc.font('Helvetica').text(formatDate(patientData.patient.birthDate), col2 + 70, infoY);

      doc.font('Helvetica-Bold').text('Edad:', col2, infoY + 18);
      doc.font('Helvetica').text(patientData.patient.age || 'N/A', col2 + 70, infoY + 18);

      doc.font('Helvetica-Bold').text('Sexo:', col2, infoY + 36);
      const gender = patientData.patient.gender === 'male' ? 'Masculino' : patientData.patient.gender === 'female' ? 'Femenino' : 'No especificado';
      doc.font('Helvetica').text(gender, col2 + 70, infoY + 36);

      doc.y = infoY + 60;

      // Allergies warning if present
      if (patientData.patient.allergies) {
        doc.moveDown(0.5);
        const allergyY = doc.y;
        doc
          .rect(40, allergyY, 532, 30)
          .fillAndStroke('#ffebee', '#d32f2f');

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#d32f2f')
          .text('⚠ ALERGIAS: ', 50, allergyY + 10, { continued: true })
          .font('Helvetica')
          .text(patientData.patient.allergies);

        doc.y = allergyY + 40;
      }

      doc.moveDown(1);

      // Summary Statistics
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('RESUMEN')
        .moveDown(0.5);

      // Stats boxes
      const statsY = doc.y;
      const boxWidth = 120;
      const boxSpacing = 15;

      // Appointments box
      doc.rect(40, statsY, boxWidth, 50).fillAndStroke('#e3f2fd', '#1976d2');
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1976d2').text(String(patientData.stats.appointments), 40, statsY + 10, { width: boxWidth, align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Citas', 40, statsY + 35, { width: boxWidth, align: 'center' });

      // Cases box
      doc.rect(40 + boxWidth + boxSpacing, statsY, boxWidth, 50).fillAndStroke('#e8f5e9', '#4caf50');
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4caf50').text(String(patientData.stats.cases), 40 + boxWidth + boxSpacing, statsY + 10, { width: boxWidth, align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Condiciones', 40 + boxWidth + boxSpacing, statsY + 35, { width: boxWidth, align: 'center' });

      // Prescriptions box
      doc.rect(40 + (boxWidth + boxSpacing) * 2, statsY, boxWidth, 50).fillAndStroke('#fff3e0', '#ff9800');
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#ff9800').text(String(patientData.stats.prescriptions), 40 + (boxWidth + boxSpacing) * 2, statsY + 10, { width: boxWidth, align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Recetas', 40 + (boxWidth + boxSpacing) * 2, statsY + 35, { width: boxWidth, align: 'center' });

      // Photos box
      doc.rect(40 + (boxWidth + boxSpacing) * 3, statsY, boxWidth, 50).fillAndStroke('#f3e5f5', '#9c27b0');
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#9c27b0').text(String(patientData.stats.photos || 0), 40 + (boxWidth + boxSpacing) * 3, statsY + 10, { width: boxWidth, align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Fotos', 40 + (boxWidth + boxSpacing) * 3, statsY + 35, { width: boxWidth, align: 'center' });

      doc.y = statsY + 70;
      doc.moveDown(1);

      // ========== Medical Cases Section ==========
      if (patientData.medicalCases && patientData.medicalCases.length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1976d2')
          .text('CONDICIONES MÉDICAS')
          .moveDown(0.5);

        patientData.medicalCases.forEach((medCase, index) => {
          // Check if we need a new page
          if (doc.y > 650) {
            doc.addPage();
            doc.y = 50;
          }

          const caseY = doc.y;
          doc
            .rect(40, caseY, 532, 60)
            .fillAndStroke('#fafafa', '#e0e0e0');

          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#333333')
            .text(`${index + 1}. ${medCase.conditionName}`, 50, caseY + 10);

          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#666666')
            .text(`Dr. ${medCase.doctorName} | ${medCase.specialty}`, 50, caseY + 25);

          doc.text(`Inicio: ${formatDate(medCase.startDate)}${medCase.endDate ? ' | Fin: ' + formatDate(medCase.endDate) : ''}`, 50, caseY + 38);

          // Status and severity badges
          const statusColors = {
            'En Tratamiento': '#2196f3',
            'Curado': '#4caf50',
            'Crónico': '#ff9800',
            'Inactivo': '#9e9e9e'
          };
          doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(statusColors[medCase.status] || '#666666')
            .text(`${medCase.status} | ${medCase.severity}`, 400, caseY + 10);

          doc.y = caseY + 70;
        });
      }

      // ========== Recent Prescriptions Section ==========
      if (patientData.prescriptions && patientData.prescriptions.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
          doc.y = 50;
        }

        doc.moveDown(1);
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1976d2')
          .text('RECETAS RECIENTES')
          .moveDown(0.5);

        // Show last 5 prescriptions
        const recentRx = patientData.prescriptions.slice(0, 5);
        recentRx.forEach((rx) => {
          if (doc.y > 680) {
            doc.addPage();
            doc.y = 50;
          }

          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#333333')
            .text(`💊 ${rx.medicationName}`, 50)
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#666666')
            .text(`   ${rx.dosage || ''} ${rx.frequency ? '- ' + rx.frequency : ''} | ${formatDate(rx.prescribedDate)}`)
            .moveDown(0.3);
        });

        if (patientData.prescriptions.length > 5) {
          doc
            .fontSize(9)
            .fillColor('#999999')
            .text(`   ... y ${patientData.prescriptions.length - 5} recetas más`);
        }
      }

      // Footer on all pages
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#999999')
          .text(
            `Expediente generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} | Página ${i + 1} de ${pages.count}`,
            40,
            doc.page.height - 40,
            { align: 'center', width: 532 }
          );
      }

      doc.end();

      stream.on('finish', () => {
        resolve(outputPdfPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateConsentPDF, generatePrescriptionPDF, generateAppointmentReceiptPDF, generateExpedientePDF };
