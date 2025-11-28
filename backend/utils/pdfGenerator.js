const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Logo path for PDFs
const LOGO_PATH = path.join(__dirname, '../assets/logo.png');

/**
 * Helper function to add logo header to PDFs
 * @param {PDFDocument} doc - The PDF document
 * @param {number} logoWidth - Width of the logo (default 180)
 */
function addLogoHeader(doc, logoWidth = 180) {
  try {
    if (fs.existsSync(LOGO_PATH)) {
      const pageWidth = doc.page.width;
      const logoX = (pageWidth - logoWidth) / 2;
      const startY = doc.y;
      doc.image(LOGO_PATH, logoX, startY, { width: logoWidth });
      // Move cursor below the logo (logo height is approximately width * 0.35)
      doc.y = startY + (logoWidth * 0.35) + 20;
    } else {
      // Fallback to text if logo not found
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#1976d2')
        .text('CLINICA PROPIEL', { align: 'center' })
        .moveDown(0.3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Especialistas en Dermatologia', { align: 'center' })
        .moveDown(0.5);
    }
  } catch (err) {
    console.error('Error adding logo:', err);
    // Fallback to text
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor('#1976d2')
      .text('CLINICA PROPIEL', { align: 'center' })
      .moveDown(0.5);
  }
}

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
      const doc = new PDFDocument({ size: 'letter', margin: 50, bufferPages: true });

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Header with logo
      addLogoHeader(doc);

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#333333')
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
        .text(`Telefono: ${appointmentData.patientPhone || 'No proporcionado'}`)
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
        'La naturaleza del procedimiento o tratamiento dermatologico que se me realizara',
        'Los beneficios esperados del tratamiento',
        'Los riesgos y posibles complicaciones asociados',
        'Las alternativas de tratamiento disponibles',
        'Los cuidados post-tratamiento necesarios',
        'El costo del procedimiento y las politicas de pago de la clinica'
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

      // Add signature image if provided, otherwise show text confirmation
      if (signatureImagePath && fs.existsSync(signatureImagePath)) {
        try {
          doc.image(signatureImagePath, {
            fit: [300, 100],
            align: 'left'
          });
          doc.moveDown(0.5);
        } catch (imgError) {
          console.error('Error adding signature image to PDF:', imgError);
          doc
            .fontSize(10)
            .font('Helvetica-Oblique')
            .text('Consentimiento registrado por personal de recepción', { align: 'left' });
          doc.moveDown(1);
        }
      } else {
        // No signature - admin created appointment
        doc
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text('Consentimiento registrado por personal de recepción al momento de agendar la cita.', { align: 'left' });
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
        .fillColor('#999999')
        .text(
          'Este documento ha sido generado electronicamente y contiene una firma digital valida. ' +
          'Clinica ProPiel - Sistema de Reservas en Linea',
          50,
          doc.page.height - 40,
          { align: 'center', width: 512 }
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
      const doc = new PDFDocument({ size: 'letter', margin: 50, bufferPages: true });
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Header with logo
      addLogoHeader(doc);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('RECETA MEDICA', { align: 'center' })
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
          .text(`ALERGIAS: ${prescriptionData.patientAllergies}`)
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
        .text(`Rx: ${prescriptionData.medicationName}`, { continued: false });

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
        doc.text(`Duracion: ${prescriptionData.duration}`);
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
        doc.text(`Cedula Profesional: ${prescriptionData.doctorLicense}`);
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
            'Este documento ha sido generado electronicamente por el sistema de Clinica ProPiel.',
            50,
            doc.page.height - 40,
            { align: 'center', width: 512 }
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

/**
 * Generate an appointment receipt PDF
 * @param {Object} appointmentData - Appointment, patient, and service information
 * @param {string} outputPdfPath - Path where the PDF will be saved
 * @returns {Promise<string>} - Returns the output PDF path
 */
async function generateAppointmentReceiptPDF(appointmentData, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'letter', margin: 50, bufferPages: true });
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Header with logo
      addLogoHeader(doc);

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
        .text('No. de Confirmacion', 150, confirmBoxY + 10, { width: 312, align: 'center' });

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
        .text('Duracion:', leftCol, doc.y);
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
          .text('Telefono:', leftCol, doc.y);
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
        .text('- Por favor llegue 10 minutos antes de su cita', 70)
        .text('- Traiga este comprobante impreso o en su celular', 70)
        .text('- En caso de no poder asistir, cancele con 24 horas de anticipacion', 70);

      doc.y += 40;

      // Footer on all pages
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#999999')
          .text(
            `Documento generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            50,
            doc.page.height - 55,
            { align: 'center', width: 512 }
          )
          .text(
            'Clinica ProPiel - Sistema de Reservas en Linea',
            50,
            doc.page.height - 40,
            { align: 'center', width: 512 }
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

/**
 * Generate a patient expediente summary PDF
 * @param {Object} patientData - Complete patient data including cases, prescriptions, appointments
 * @param {string} outputPdfPath - Path where the PDF will be saved
 * @returns {Promise<string>} - Returns the output PDF path
 */
async function generateExpedientePDF(patientData, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'letter', margin: 40 });
      const stream = fs.createWriteStream(outputPdfPath);
      doc.pipe(stream);

      // Track page count for footer
      let pageCount = 1;

      // Helper function to add footer to current page
      const addFooter = (currentPage, totalPages) => {
        const savedY = doc.y;
        const savedX = doc.x;
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#999999')
          .text(
            `Expediente generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} | Pagina ${currentPage} de ${totalPages}`,
            40,
            doc.page.height - 50,
            { align: 'center', width: 532, lineBreak: false }
          );
        doc.y = savedY;
        doc.x = savedX;
      };

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
      // Header with logo
      addLogoHeader(doc);

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
        .text('DATOS PERSONALES', 40)
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

      doc.font('Helvetica-Bold').text('Telefono:', col1, infoY + 18);
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
          .text('ALERGIAS: ', 50, allergyY + 10, { continued: true })
          .font('Helvetica')
          .text(patientData.patient.allergies);

        doc.y = allergyY + 40;
      }

      doc.moveDown(1);

      // ========== Medical Cases Section ==========
      if (patientData.medicalCases && patientData.medicalCases.length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1976d2')
          .text('CONDICIONES MEDICAS', 40)
          .moveDown(0.5);

        patientData.medicalCases.forEach((medCase, index) => {
          // Check if we need a new page (leave space for footer)
          if (doc.y > doc.page.height - 170) {
            addFooter(pageCount, pageCount); // Add footer before new page
            doc.addPage();
            pageCount++;
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
        // Check if we need a new page for prescriptions section
        if (doc.y > doc.page.height - 200) {
          addFooter(pageCount, pageCount);
          doc.addPage();
          pageCount++;
          doc.y = 50;
        }

        doc.moveDown(1);
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1976d2')
          .text('RECETAS RECIENTES', 40)
          .moveDown(0.5);

        // Show last 5 prescriptions
        const recentRx = patientData.prescriptions.slice(0, 5);
        recentRx.forEach((rx) => {
          // Leave room for footer
          if (doc.y > doc.page.height - 100) {
            addFooter(pageCount, pageCount);
            doc.addPage();
            pageCount++;
            doc.y = 50;
          }

          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#333333')
            .text(`Rx: ${rx.medicationName}`, 50)
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
            .text(`   ... y ${patientData.prescriptions.length - 5} recetas mas`);
        }
      }

      // Add footer to the last page
      addFooter(pageCount, pageCount);

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
 * Generate Payment Receipt PDF (for SAT/tax declarations)
 * @param {Object} paymentData - Payment and appointment data
 * @param {string} outputPath - Output file path
 * @returns {Promise} Resolves when PDF is created
 */
async function generatePaymentReceiptPDF(paymentData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header with clinic logo and info
      const logoPath = path.join(__dirname, '../assets/ProPiel-Logo-Large.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 120 });
      }

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('ProPiel - Clínica Dermatológica', 200, 50, { align: 'right' })
        .text('Av. Ejemplo #123, Col. Centro', 200, 65, { align: 'right' })
        .text('Guadalajara, Jalisco, México', 200, 80, { align: 'right' })
        .text('Tel: (33) 1234-5678', 200, 95, { align: 'right' });

      doc.moveDown(3);

      // Title
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#2196F3')
        .text('RECIBO DE PAGO', { align: 'center' });

      doc.moveDown(0.5);

      // Receipt number and date
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .text(`Recibo No: ${paymentData.receiptNumber || paymentData.paymentId}`, { align: 'center' })
        .text(`Fecha: ${paymentData.receiptDate || new Date().toLocaleDateString('es-MX')}`, { align: 'center' });

      doc.moveDown(2);

      // Patient Information Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#2196F3')
        .text('DATOS DEL PACIENTE');

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .moveDown(0.5);

      const patientY = doc.y;
      doc.text(`Nombre: ${paymentData.patientName}`, 50, patientY);
      doc.text(`Email: ${paymentData.patientEmail || 'N/A'}`, 50, patientY + 15);
      doc.text(`Teléfono: ${paymentData.patientPhone || 'N/A'}`, 50, patientY + 30);

      if (paymentData.patientRFC) {
        doc.text(`RFC: ${paymentData.patientRFC}`, 50, patientY + 45);
      }

      doc.moveDown(4);

      // Service Information Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#2196F3')
        .text('DETALLES DEL SERVICIO');

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .moveDown(0.5);

      const serviceY = doc.y;
      doc.text(`Servicio: ${paymentData.serviceName}`, 50, serviceY);
      doc.text(`Doctor: ${paymentData.doctorName}`, 50, serviceY + 15);
      doc.text(`Fecha de Cita: ${paymentData.appointmentDate}`, 50, serviceY + 30);
      doc.text(`Hora: ${paymentData.appointmentTime}`, 50, serviceY + 45);

      doc.moveDown(4);

      // Payment Breakdown Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#2196F3')
        .text('DESGLOSE DE PAGO');

      doc.moveDown(1);

      // Create payment breakdown table
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 400;

      // Table headers (background)
      doc
        .rect(col1X, tableTop, 512, 25)
        .fillAndStroke('#E3F2FD', '#2196F3');

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Concepto', col1X + 10, tableTop + 8)
        .text('Monto', col2X + 10, tableTop + 8);

      let currentY = tableTop + 30;

      // Row 1: Costo Total
      doc
        .font('Helvetica')
        .text('Costo Total del Servicio:', col1X + 10, currentY)
        .text(`$${parseFloat(paymentData.totalAmount).toFixed(2)} MXN`, col2X + 10, currentY);

      currentY += 20;

      // Row 2: Depósito
      if (paymentData.depositAmount && parseFloat(paymentData.depositAmount) > 0) {
        doc
          .text('Depósito Inicial:', col1X + 10, currentY)
          .text(`$${parseFloat(paymentData.depositAmount).toFixed(2)} MXN`, col2X + 10, currentY);
        currentY += 20;
      }

      // Row 3: Saldo Pagado
      if (paymentData.balancePaid && parseFloat(paymentData.balancePaid) > 0) {
        doc
          .text('Saldo Pagado:', col1X + 10, currentY)
          .text(`$${parseFloat(paymentData.balancePaid).toFixed(2)} MXN`, col2X + 10, currentY);
        currentY += 20;
      }

      // Total line
      doc
        .moveTo(col1X, currentY)
        .lineTo(562, currentY)
        .stroke('#2196F3');

      currentY += 10;

      // Row 4: Total Pagado
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('TOTAL PAGADO:', col1X + 10, currentY)
        .text(`$${parseFloat(paymentData.totalPaid).toFixed(2)} MXN`, col2X + 10, currentY);

      doc.moveDown(3);

      // Payment Method Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#2196F3')
        .text('MÉTODO DE PAGO');

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .moveDown(0.5);

      const methodY = doc.y;
      doc.text(`Método: ${paymentData.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Efectivo'}`, 50, methodY);

      if (paymentData.paymentReference) {
        doc.text(`Referencia: ${paymentData.paymentReference}`, 50, methodY + 15);
      }

      doc.moveDown(3);

      // SAT Notice
      doc
        .fontSize(9)
        .font('Helvetica-Italic')
        .fillColor('#666666')
        .text(
          'Este recibo puede ser utilizado para declaraciones fiscales ante el SAT. ' +
          'Para factura electrónica (CFDI), favor de solicitarla dentro de los 30 días siguientes a la fecha de pago.',
          {
            align: 'justify',
            width: 512
          }
        );

      doc.moveDown(2);

      // Footer with signature line
      const footerY = doc.y + 30;
      doc
        .moveTo(200, footerY)
        .lineTo(400, footerY)
        .stroke('#000000');

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#000000')
        .text('Recibido por ProPiel Clínica Dermatológica', 150, footerY + 10, { align: 'center', width: 300 });

      // Bottom footer
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `Generado el ${new Date().toLocaleString('es-MX')} | ProPiel - Sistema de Gestión Clínica`,
          50,
          doc.page.height - 40,
          { align: 'center', width: 512 }
        );

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateConsentPDF, generatePrescriptionPDF, generateAppointmentReceiptPDF, generateExpedientePDF, generatePaymentReceiptPDF };
