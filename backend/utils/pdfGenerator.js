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

module.exports = { generateConsentPDF };
