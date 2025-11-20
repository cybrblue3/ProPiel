import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  WhatsApp as WhatsAppIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tab filter state
  const [activeTab, setActiveTab] = useState(0); // 0=Todas, 1=Pendientes, 2=Hoy, 3=Confirmadas

  // Counts for badges
  const [pendingCount, setPendingCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: page + 1,
        limit: rowsPerPage
      };

      // Apply tab filter
      if (activeTab === 1) {
        params.status = 'pending';
      } else if (activeTab === 2) {
        params.date = getTodayDate();
      } else if (activeTab === 3) {
        params.status = 'confirmed';
      }

      // Apply additional filters
      if (dateFilter && activeTab !== 2) {
        params.date = dateFilter;
      } else if ((startDate || endDate) && activeTab !== 2) {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const response = await adminAPI.getAllAppointments(params);
      setAppointments(response.data.data.appointments);
      setTotalCount(response.data.data.pagination.total);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  // Load counts for badges
  const loadCounts = async () => {
    try {
      // Get pending count
      const pendingResponse = await adminAPI.getAllAppointments({ status: 'pending', limit: 1 });
      setPendingCount(pendingResponse.data.data.pagination.total);

      // Get today count
      const todayResponse = await adminAPI.getAllAppointments({ date: getTodayDate(), limit: 1 });
      setTodayCount(todayResponse.data.data.pagination.total);
    } catch (err) {
      console.error('Error loading counts:', err);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadCounts();
  }, [page, rowsPerPage, activeTab, dateFilter, startDate, endDate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    // Clear date filters when switching to "Hoy" tab
    if (newValue === 2) {
      setDateFilter('');
      setStartDate('');
      setEndDate('');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      const response = await adminAPI.getAppointment(appointmentId);
      setSelectedAppointment(response.data.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error loading appointment details:', err);
      setError('Error al cargar los detalles de la cita');
    }
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

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await adminAPI.cancelAppointment(selectedAppointment.id, cancellationReason);

      // Store WhatsApp URL for opening
      if (response.data.whatsapp && response.data.whatsapp.success) {
        setWhatsappUrl(response.data.whatsapp.url);
        setSuccessMessage(`Cita cancelada exitosamente. Notifica al paciente por WhatsApp.`);

        // Open WhatsApp
        const link = document.createElement('a');
        link.href = response.data.whatsapp.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setSuccessMessage('Cita cancelada exitosamente');
      }

      // Reload appointments and counts
      await loadAppointments();
      await loadCounts();

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

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await adminAPI.confirmAppointment(selectedAppointment.id);

      // Store WhatsApp URL for opening
      if (response.data.whatsapp && response.data.whatsapp.success) {
        setWhatsappUrl(response.data.whatsapp.url);
        setSuccessMessage(`Cita confirmada exitosamente. ¡Notifica al paciente por WhatsApp!`);

        // Open WhatsApp
        const link = document.createElement('a');
        link.href = response.data.whatsapp.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setSuccessMessage('Cita confirmada exitosamente');
      }

      // Reload appointments and counts
      await loadAppointments();
      await loadCounts();

      setConfirmDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError('Error al confirmar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'warning' },
      confirmed: { label: 'Confirmada', color: 'success' },
      cancelled: { label: 'Cancelada', color: 'error' },
      completed: { label: 'Completada', color: 'info' },
      'no-show': { label: 'No asistió', color: 'default' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  // Check if appointment is today
  const isToday = (dateString) => {
    return dateString === getTodayDate();
  };

  // Get row background color based on status
  const getRowStyle = (appointment) => {
    if (appointment.status === 'pending') {
      return { bgcolor: 'warning.lighter' };
    }
    if (isToday(appointment.appointmentDate) && appointment.status !== 'cancelled') {
      return { bgcolor: 'info.lighter' };
    }
    return {};
  };

  // Filter appointments by search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      appointment.Patient?.fullName?.toLowerCase().includes(search) ||
      appointment.Patient?.phone?.includes(search) ||
      appointment.Service?.name?.toLowerCase().includes(search) ||
      appointment.Doctor?.fullName?.toLowerCase().includes(search)
    );
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Gestión de Citas
          </Typography>
          {pendingCount > 0 && (
            <Chip
              label={`${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`}
              color="warning"
              size="small"
            />
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            loadAppointments();
            loadCounts();
          }}
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

      {/* Quick Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Todas" />
          <Tab
            label={
              <Badge badgeContent={pendingCount} color="warning" max={99}>
                <Box sx={{ pr: pendingCount > 0 ? 2 : 0 }}>Pendientes</Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={todayCount} color="info" max={99}>
                <Box sx={{ pr: todayCount > 0 ? 2 : 0 }}>Hoy</Box>
              </Badge>
            }
          />
          <Tab label="Confirmadas" />
        </Tabs>
      </Paper>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">Filtros</Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por paciente, teléfono, servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Single Date Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Fecha específica"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setStartDate('');
                  setEndDate('');
                }}
                InputLabelProps={{ shrink: true }}
                disabled={activeTab === 2}
              />
            </Grid>

            {/* Date Range Start */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Desde"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter('');
                }}
                InputLabelProps={{ shrink: true }}
                disabled={!!dateFilter || activeTab === 2}
              />
            </Grid>

            {/* Date Range End */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Hasta"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter('');
                }}
                InputLabelProps={{ shrink: true }}
                disabled={!!dateFilter || activeTab === 2}
              />
            </Grid>
          </Grid>

          {/* Clear Filters */}
          {(searchTerm || dateFilter || startDate || endDate) && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Limpiar filtros
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Appointments Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Comprobante</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No se encontraron citas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      hover
                      sx={getRowStyle(appointment)}
                    >
                      <TableCell>#{appointment.id}</TableCell>
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
                            ${appointment.Service?.price ? (appointment.Service.price * (appointment.Service.depositPercentage || 50) / 100).toFixed(0) : 0} anticipo
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
                      <TableCell>{appointment.Doctor?.fullName}</TableCell>
                      <TableCell>
                        {appointment.PaymentProof ? (
                          <Chip
                            icon={<AttachIcon />}
                            label="Ver"
                            size="small"
                            color="success"
                            variant="outlined"
                            onClick={() => handleViewDetails(appointment.id)}
                          />
                        ) : (
                          <Chip label="Sin" size="small" color="default" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>{getStatusChip(appointment.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(appointment.id)}
                          title="Ver detalles"
                        >
                          <ViewIcon />
                        </IconButton>

                        {appointment.status === 'pending' && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleConfirmClick(appointment)}
                            title="Confirmar"
                            disabled={actionLoading}
                          >
                            <CheckIcon />
                          </IconButton>
                        )}

                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelClick(appointment)}
                            title="Cancelar"
                            disabled={actionLoading}
                          >
                            <CancelIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
          />
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Detalles de la Cita #{selectedAppointment?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedAppointment && (
            <Box>
              {/* Patient Info */}
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

              {/* Appointment Info */}
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
                      <strong>Anticipo:</strong> ${selectedAppointment.Service?.depositAmount || (selectedAppointment.Service?.price * 0.5).toFixed(0)} MXN
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Estado:</strong> {getStatusChip(selectedAppointment.status)}
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

              {/* Payment Proof */}
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
                        e.target.onerror = null;
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
          {selectedAppointment && selectedAppointment.status === 'pending' && (
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
        <DialogTitle>Cancelar Cita</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que deseas cancelar esta cita?
          </Typography>
          {selectedAppointment && (
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
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
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motivo de cancelación (opcional)"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelAppointment}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Cancelar Cita'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
