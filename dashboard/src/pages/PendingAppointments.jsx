import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  AttachFile as AttachIcon,
  Refresh as RefreshIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGenderLabel = (gender) => {
    if (gender === 'male') return 'Masculino';
    if (gender === 'female') return 'Femenino';
    if (gender === 'other') return 'Otro';
    return 'No especificado';
  };

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getPendingAppointments();
      setAppointments(response.data.data);
    } catch (err) {
      console.error('Error loading pending appointments:', err);
      setError('Error al cargar las citas pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const handleConfirmClick = (appointment) => {
    setSelectedAppointment(appointment);
    setConfirmDialogOpen(true);
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
    setCancellationReason('');
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await adminAPI.confirmAppointment(selectedAppointment.id);

      console.log('Confirm response:', response.data);

      // Store WhatsApp URL for opening
      if (response.data.whatsapp && response.data.whatsapp.success) {
        console.log('WhatsApp available:', response.data.whatsapp.url);
        setWhatsappUrl(response.data.whatsapp.url);
        setSuccessMessage(`Cita confirmada exitosamente. ¡Notifica al paciente por WhatsApp!`);

        // Try to open immediately using anchor tag to preserve emojis
        const link = document.createElement('a');
        link.href = response.data.whatsapp.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log('WhatsApp notification not available:', response.data.whatsapp);
        setSuccessMessage('Cita confirmada exitosamente');
      }

      // Remove from pending list
      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id));

      setConfirmDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError('Error al confirmar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await adminAPI.cancelAppointment(selectedAppointment.id, cancellationReason);

      console.log('Cancel response:', response.data);

      // Store WhatsApp URL for opening
      if (response.data.whatsapp && response.data.whatsapp.success) {
        console.log('WhatsApp available:', response.data.whatsapp.url);
        setWhatsappUrl(response.data.whatsapp.url);
        setSuccessMessage(`Cita cancelada exitosamente. Notifica al paciente por WhatsApp.`);

        // Try to open immediately using anchor tag to preserve emojis
        const link = document.createElement('a');
        link.href = response.data.whatsapp.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log('WhatsApp notification not available:', response.data.whatsapp);
        setSuccessMessage('Cita cancelada exitosamente');
      }

      // Remove from pending list
      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id));

      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      setCancellationReason('');
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError('Error al cancelar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Parse date as local time to avoid timezone shift
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // "HH:MM:SS" -> "HH:MM"
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Citas Pendientes de Aprobación
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadPendingAppointments}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => {
            setSuccessMessage('');
            setWhatsappUrl(null);
          }}
          action={
            whatsappUrl && (
              <Button
                color="inherit"
                size="small"
                startIcon={<WhatsAppIcon />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = whatsappUrl;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Abrir WhatsApp
              </Button>
            )
          }
        >
          {successMessage}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Alert severity="info">
          No hay citas pendientes de aprobación.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Paciente</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Comprobante</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {appointment.Patient?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.Patient?.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {appointment.Service?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${appointment.Service?.price ? (appointment.Service.price * (appointment.Service.depositPercentage || 50) / 100).toFixed(2) : 0} MXN anticipo
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatDate(appointment.appointmentDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(appointment.appointmentTime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {appointment.Doctor?.fullName}
                  </TableCell>
                  <TableCell>
                    {appointment.PaymentProof ? (
                      <Chip
                        icon={<AttachIcon />}
                        label="Ver comprobante"
                        size="small"
                        color="success"
                        variant="outlined"
                        onClick={() => handleViewDetails(appointment)}
                      />
                    ) : (
                      <Chip label="Sin comprobante" size="small" color="error" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(appointment)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleConfirmClick(appointment)}
                      title="Aprobar"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleCancelClick(appointment)}
                      title="Rechazar"
                    >
                      <CancelIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Detalles de la Cita
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedAppointment && (
            <Box>
              {/* Patient Info Card */}
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Información del Paciente
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {selectedAppointment.Patient?.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Edad:</strong> {calculateAge(selectedAppointment.Patient?.birthDate)} años
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sexo:</strong> {getGenderLabel(selectedAppointment.Patient?.gender)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Teléfono:</strong> {selectedAppointment.Patient?.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedAppointment.Patient?.email || 'No proporcionado'}
                  </Typography>
                </Box>
              </Paper>

              {/* Appointment Info Card */}
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Información de la Cita
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Servicio:</strong> {selectedAppointment.Service?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Precio:</strong> ${selectedAppointment.Service?.price} MXN
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Anticipo (50%):</strong> ${selectedAppointment.Service?.price ? (selectedAppointment.Service.price * selectedAppointment.Service.depositPercentage / 100).toFixed(2) : 0} MXN
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Fecha:</strong> {formatDate(selectedAppointment.appointmentDate)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Hora:</strong> {formatTime(selectedAppointment.appointmentTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Doctor:</strong> {selectedAppointment.Doctor?.fullName}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Payment Proof Card */}
              {selectedAppointment.PaymentProof && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    Comprobante de Pago
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.300'
                    }}
                  >
                    <Box
                      component="img"
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${selectedAppointment.PaymentProof.filepath.split('uploads\\').pop().split('uploads/').pop().replace(/\\/g, '/')}`}
                      alt="Comprobante de pago"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 400,
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('Error loading image:', e.target.src);
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Error al cargar imagen</text></svg>';
                      }}
                    />
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setDetailsOpen(false)} variant="outlined">
            Cerrar
          </Button>
          {selectedAppointment && (
            <>
              <Button
                startIcon={<CancelIcon />}
                color="error"
                variant="outlined"
                onClick={() => {
                  setDetailsOpen(false);
                  handleCancelClick(selectedAppointment);
                }}
              >
                Rechazar
              </Button>
              <Button
                startIcon={<CheckIcon />}
                variant="contained"
                color="success"
                onClick={() => {
                  setDetailsOpen(false);
                  handleConfirmClick(selectedAppointment);
                }}
              >
                Aprobar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Cita</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas aprobar esta cita?
          </Typography>
          {selectedAppointment && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Paciente:</strong> {selectedAppointment.Patient?.fullName}
              </Typography>
              <Typography variant="body2">
                <strong>Servicio:</strong> {selectedAppointment.Service?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha:</strong> {formatDate(selectedAppointment.appointmentDate)} - {formatTime(selectedAppointment.appointmentTime)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmAppointment}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Rechazar Cita</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que deseas rechazar esta cita?
          </Typography>
          {selectedAppointment && (
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Paciente:</strong> {selectedAppointment.Patient?.fullName}
              </Typography>
              <Typography variant="body2">
                <strong>Servicio:</strong> {selectedAppointment.Service?.name}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo (opcional)"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelAppointment}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Rechazar Cita'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingAppointments;
