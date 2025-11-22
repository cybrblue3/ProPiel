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

module.exports = { generateConsentPDF, generatePrescriptionPDF, generateAppointmentReceiptPDF };
