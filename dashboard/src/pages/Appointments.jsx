import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Badge,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Select,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  WhatsApp as WhatsAppIcon,
  AttachFile as AttachIcon,
  FolderShared as HistoryIcon,
  Schedule as ScheduleIcon,
  HourglassEmpty as WaitingIcon,
  PlayArrow as StartIcon,
  Check as CompleteIcon,
  PersonOff as NoShowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Payment as PaymentIcon,
  ArrowForward as ArrowIcon,
  PictureAsPdf as PdfIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { adminAPI, appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reminders state
  const [reminders, setReminders] = useState(null);
  const [remindersExpanded, setRemindersExpanded] = useState(true);

  // Tab filter state - Initialize from navigation state if provided
  const [activeTab, setActiveTab] = useState(location.state?.initialTab || 0); // 0=Todas, 1=Pendientes, 2=Hoy, 3=Confirmadas

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

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

  // State change dialog
  const [stateChangeDialogOpen, setStateChangeDialogOpen] = useState(false);
  const [newState, setNewState] = useState('');
  const [stateChangeReason, setStateChangeReason] = useState('');

  // State history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [stateHistory, setStateHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Completion verification dialog
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [balancePaymentMethod, setBalancePaymentMethod] = useState('cash'); // cash or transfer
  const [balancePaymentProof, setBalancePaymentProof] = useState(null); // File for transfer proof

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const loadReminders = async () => {
    try {
      const response = await appointmentsAPI.getReminders();
      setReminders(response.data.data);
    } catch (err) {
      console.error('Error loading reminders:', err);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: page + 1,
        limit: rowsPerPage
      };

      // Apply search term
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      // Apply tab filter
      if (activeTab === 1) {
        params.status = 'pending';
      } else if (activeTab === 2) {
        params.date = getTodayDate();
        params.status = 'confirmed,en_consulta';
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

      // Apply specialty filter
      if (specialtyFilter) {
        params.specialty = specialtyFilter;
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

      // Get today count (confirmed and en_consulta)
      const todayResponse = await adminAPI.getAllAppointments({ date: getTodayDate(), status: 'confirmed,en_consulta', limit: 1 });
      setTodayCount(todayResponse.data.data.pagination.total);
    } catch (err) {
      console.error('Error loading counts:', err);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page when searching
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadAppointments();
    loadCounts();
    loadReminders();
  }, [page, rowsPerPage, activeTab, dateFilter, startDate, endDate, debouncedSearchTerm, specialtyFilter]);

  // Poll reminders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadReminders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

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

  const handleViewHistory = async (appointment) => {
    try {
      setHistoryLoading(true);
      setSelectedAppointment(appointment);
      const response = await appointmentsAPI.getHistory(appointment.id);
      setStateHistory(response.data.data.history);
      setHistoryDialogOpen(true);
    } catch (err) {
      console.error('Error loading state history:', err);
      setError('Error al cargar el historial');
    } finally {
      setHistoryLoading(false);
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

  const handleStateChangeClick = (appointment, targetState) => {
    setSelectedAppointment(appointment);
    setNewState(targetState);
    setStateChangeReason('');
    setStateChangeDialogOpen(true);
  };

  const handleCompleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setBalancePaymentMethod('cash'); // Reset to default
    setBalancePaymentProof(null); // Reset file upload
    setCompletionDialogOpen(true);
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    // Validate file upload for transferencia
    if (selectedAppointment.Payment &&
        parseFloat(selectedAppointment.Payment.remainingBalance) > 0 &&
        balancePaymentMethod === 'transfer' &&
        !balancePaymentProof) {
      setError('Por favor carga el comprobante de transferencia');
      return;
    }

    try {
      setActionLoading(true);

      // Mark appointment as completed
      await appointmentsAPI.changeState(selectedAppointment.id, {
        newState: 'completed',
        reason: 'Consulta finalizada, pago completo verificado'
      });

      // If there's a remaining balance, record it as paid
      if (selectedAppointment.Payment && parseFloat(selectedAppointment.Payment.remainingBalance) > 0) {
        // Use FormData if file is uploaded, otherwise use JSON
        if (balancePaymentMethod === 'transfer' && balancePaymentProof) {
          const formData = new FormData();
          formData.append('amountPaid', selectedAppointment.Payment.remainingBalance);
          formData.append('paymentMethod', balancePaymentMethod);
          formData.append('notes', `Saldo pagado al finalizar la consulta (Transferencia)`);
          formData.append('paymentProof', balancePaymentProof);

          await appointmentsAPI.recordBalancePayment(selectedAppointment.id, formData);
        } else {
          await appointmentsAPI.recordBalancePayment(selectedAppointment.id, {
            amountPaid: selectedAppointment.Payment.remainingBalance,
            paymentMethod: balancePaymentMethod,
            notes: `Saldo pagado al finalizar la consulta (${balancePaymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'})`
          });
        }
      }

      setSuccessMessage('Cita completada exitosamente. Pago verificado.');

      // Reload data
      await loadAppointments();
      await loadCounts();
      await loadReminders();

      setCompletionDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError(err.response?.data?.message || 'Error al completar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStateChange = async () => {
    if (!selectedAppointment || !newState) return;

    try {
      setActionLoading(true);
      await appointmentsAPI.changeState(selectedAppointment.id, {
        newState,
        reason: stateChangeReason || undefined
      });

      setSuccessMessage(`Estado cambiado a "${getStateLabel(newState)}" exitosamente`);

      // Reload data
      await loadAppointments();
      await loadCounts();
      await loadReminders();

      setStateChangeDialogOpen(false);
      setSelectedAppointment(null);
      setNewState('');
      setStateChangeReason('');
    } catch (err) {
      console.error('Error changing state:', err);
      setError(err.response?.data?.message || 'Error al cambiar el estado');
    } finally {
      setActionLoading(false);
    }
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
      await loadReminders();

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
      await loadReminders();

      setConfirmDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError('Error al confirmar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  // PDF Download Handlers
  const handleDownloadConsentPDF = async (appointmentId) => {
    try {
      setActionLoading(true);
      const response = await appointmentsAPI.downloadConsentPDF(appointmentId);

      // Create blob and open in new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      setSuccessMessage('PDF de consentimiento abierto en nueva pestaña');
    } catch (err) {
      console.error('Error opening consent PDF:', err);
      setError(err.response?.data?.message || 'Error al abrir el PDF de consentimiento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPaymentReceiptPDF = async (appointmentId) => {
    try {
      setActionLoading(true);
      const response = await appointmentsAPI.downloadPaymentReceiptPDF(appointmentId);

      // Create blob and open in new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      setSuccessMessage('Recibo de pago abierto en nueva pestaña');
    } catch (err) {
      console.error('Error opening payment receipt PDF:', err);
      setError(err.response?.data?.message || 'Error al abrir el recibo de pago');
    } finally {
      setActionLoading(false);
    }
  };

  const getStateLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      'in_progress': 'En consulta',
      completed: 'Completada',
      cancelled: 'Cancelada',
      'no-show': 'No asistió'
    };
    return labels[status] || status;
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'warning' },
      confirmed: { label: 'Confirmada', color: 'success' },
      'in_progress': { label: 'En consulta', color: 'info' },
      cancelled: { label: 'Cancelada', color: 'error' },
      completed: { label: 'Completada', color: 'primary' },
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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    if (appointment.status === 'in_progress') {
      return { bgcolor: 'info.lighter' };
    }
    if (isToday(appointment.appointmentDate) && appointment.status !== 'cancelled') {
      return { bgcolor: 'grey.50' };
    }
    return {};
  };

  // Get quick actions based on current state
  const getQuickActions = (appointment) => {
    const actions = [];

    if (appointment.status === 'pending') {
      actions.push(
        <Tooltip key="confirm" title="Confirmar">
          <IconButton
            size="small"
            color="success"
            onClick={() => handleConfirmClick(appointment)}
            disabled={actionLoading}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (appointment.status === 'confirmed') {
      actions.push(
        <Tooltip key="start" title="Iniciar consulta">
          <IconButton
            size="small"
            color="info"
            onClick={() => handleStateChangeClick(appointment, 'in_progress')}
            disabled={actionLoading}
          >
            <StartIcon />
          </IconButton>
        </Tooltip>
      );
      actions.push(
        <Tooltip key="no-show" title="No asistió">
          <IconButton
            size="small"
            color="default"
            onClick={() => handleStateChangeClick(appointment, 'no-show')}
            disabled={actionLoading}
          >
            <NoShowIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (appointment.status === 'in_progress') {
      actions.push(
        <Tooltip key="complete" title="Completar">
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleCompleteClick(appointment)}
            disabled={actionLoading}
          >
            <CompleteIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (appointment.status === 'pending') {
      actions.push(
        <Tooltip key="cancel" title="Cancelar">
          <IconButton
            size="small"
            color="error"
            onClick={() => handleCancelClick(appointment)}
            disabled={actionLoading}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return actions;
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'upcoming':
        return <ScheduleIcon color="info" />;
      case 'at_time':
        return <WaitingIcon color="warning" />;
      case 'late':
        return <WaitingIcon color="error" />;
      case 'in_progress':
        return <StartIcon color="info" />;
      case 'needs_payment':
        return <PaymentIcon color="primary" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getReminderColor = (type) => {
    switch (type) {
      case 'upcoming':
        return 'info.lighter';
      case 'at_time':
        return 'warning.lighter';
      case 'late':
        return 'error.lighter';
      case 'in_progress':
        return 'info.lighter';
      case 'needs_payment':
        return 'success.lighter';
      default:
        return 'grey.50';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
            loadReminders();
          }}
          disabled={loading}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
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

      {/* Reminders Panel */}
      {reminders && reminders.summary.totalReminders > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'warning.lighter', border: '2px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setRemindersExpanded(!remindersExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Recordatorios ({reminders.summary.totalReminders})
                </Typography>
                <Chip
                  label={`${reminders.summary.late} atrasado${reminders.summary.late !== 1 ? 's' : ''}`}
                  color="error"
                  size="small"
                  sx={{ display: reminders.summary.late > 0 ? 'inline-flex' : 'none' }}
                />
                <Chip
                  label={`${reminders.summary.inProgress} en consulta`}
                  color="info"
                  size="small"
                  sx={{ display: reminders.summary.inProgress > 0 ? 'inline-flex' : 'none' }}
                />
              </Box>
              <IconButton size="small">
                {remindersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={remindersExpanded}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {/* Late appointments */}
                {reminders.late.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="error" fontWeight={600} gutterBottom>
                      Atrasados
                    </Typography>
                    <List dense>
                      {reminders.late.map((apt) => (
                        <ListItem
                          key={apt.id}
                          sx={{ bgcolor: getReminderColor('late'), borderRadius: 1, mb: 0.5 }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              {getQuickActions(apt)}
                            </Stack>
                          }
                        >
                          <ListItemIcon>{getReminderIcon('late')}</ListItemIcon>
                          <ListItemText
                            primary={`${apt.Patient.fullName} - ${formatTime(apt.appointmentTime)}`}
                            secondary={apt.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* At time appointments */}
                {reminders.atTime.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="warning.dark" fontWeight={600} gutterBottom>
                      Ahora
                    </Typography>
                    <List dense>
                      {reminders.atTime.map((apt) => (
                        <ListItem
                          key={apt.id}
                          sx={{ bgcolor: getReminderColor('at_time'), borderRadius: 1, mb: 0.5 }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              {getQuickActions(apt)}
                            </Stack>
                          }
                        >
                          <ListItemIcon>{getReminderIcon('at_time')}</ListItemIcon>
                          <ListItemText
                            primary={`${apt.Patient.fullName} - ${formatTime(apt.appointmentTime)}`}
                            secondary={apt.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* In progress appointments */}
                {reminders.inProgress.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="info.dark" fontWeight={600} gutterBottom>
                      En Consulta
                    </Typography>
                    <List dense>
                      {reminders.inProgress.map((apt) => (
                        <ListItem
                          key={apt.id}
                          sx={{ bgcolor: getReminderColor('in_progress'), borderRadius: 1, mb: 0.5 }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              {getQuickActions(apt)}
                            </Stack>
                          }
                        >
                          <ListItemIcon>{getReminderIcon('in_progress')}</ListItemIcon>
                          <ListItemText
                            primary={`${apt.Patient.fullName} - ${formatTime(apt.appointmentTime)}`}
                            secondary={apt.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* Upcoming appointments */}
                {reminders.upcoming.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="info.dark" fontWeight={600} gutterBottom>
                      Próximos
                    </Typography>
                    <List dense>
                      {reminders.upcoming.map((apt) => (
                        <ListItem
                          key={apt.id}
                          sx={{ bgcolor: getReminderColor('upcoming'), borderRadius: 1, mb: 0.5 }}
                        >
                          <ListItemIcon>{getReminderIcon('upcoming')}</ListItemIcon>
                          <ListItemText
                            primary={`${apt.Patient.fullName} - ${formatTime(apt.appointmentTime)}`}
                            secondary={apt.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* Needs payment */}
                {reminders.needsPayment.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary.dark" fontWeight={600} gutterBottom>
                      Pendientes de Pago
                    </Typography>
                    <List dense>
                      {reminders.needsPayment.map((apt) => (
                        <ListItem
                          key={apt.id}
                          sx={{ bgcolor: getReminderColor('needs_payment'), borderRadius: 1, mb: 0.5 }}
                        >
                          <ListItemIcon>{getReminderIcon('needs_payment')}</ListItemIcon>
                          <ListItemText
                            primary={apt.Patient.fullName}
                            secondary={apt.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Quick Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
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
            <Grid item xs={12} sm={12} md={6} lg={4}>
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
            <Grid item xs={12} sm={6} md={3} lg={2}>
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
            <Grid item xs={12} sm={6} md={3} lg={2}>
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
            <Grid item xs={12} sm={6} md={3} lg={2}>
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

            {/* Specialty Filter */}
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl fullWidth>
                <InputLabel shrink>Especialidad</InputLabel>
                <Select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  label="Especialidad"
                  displayEmpty
                  notched
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="Dermatología">Dermatología</MenuItem>
                  <MenuItem value="Podología">Podología</MenuItem>
                  <MenuItem value="Tamíz">Tamíz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Clear Filters */}
          {(searchTerm || dateFilter || startDate || endDate || specialtyFilter) && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setStartDate('');
                  setEndDate('');
                  setSpecialtyFilter('');
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
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No se encontraron citas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
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
                      <TableCell>{getStatusChip(appointment.status)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(appointment.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver historial">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleViewHistory(appointment)}
                            >
                              <TimelineIcon />
                            </IconButton>
                          </Tooltip>
                          {(user?.role === 'superadmin' || user?.role === 'doctor') && (
                            <Tooltip title="Expediente médico">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/patients/${appointment.patientId}/medical-history`)}
                              >
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {getQuickActions(appointment)}
                        </Stack>
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
              {selectedAppointment.PaymentProof && (() => {
                const fileUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${selectedAppointment.PaymentProof.filepath.split('uploads\\').pop().split('uploads/').pop().replace(/\\/g, '/')}`;
                const isPDF = selectedAppointment.PaymentProof.filepath.toLowerCase().endsWith('.pdf');

                return (
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
                      {isPDF ? (
                        <Box
                          component="embed"
                          src={fileUrl}
                          type="application/pdf"
                          sx={{
                            width: '100%',
                            height: 700,
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={fileUrl}
                          alt="Comprobante de pago"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 700,
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            console.error('Error loading image:', e.target.src);
                            e.target.onerror = null;
                          }}
                        />
                      )}
                    </Box>
                  </Paper>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* PDF Visualization Buttons */}
            {selectedAppointment && selectedAppointment.Consent && (
              <Button
                startIcon={<PdfIcon />}
                variant="outlined"
                size="small"
                onClick={() => handleDownloadConsentPDF(selectedAppointment.id)}
                disabled={actionLoading}
              >
                Ver Consentimiento
              </Button>
            )}
            {selectedAppointment && selectedAppointment.status === 'completada' && selectedAppointment.Payment && (
              <Button
                startIcon={<ReceiptIcon />}
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => handleDownloadPaymentReceiptPDF(selectedAppointment.id)}
                disabled={actionLoading}
              >
                Ver Recibo
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
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
          </Box>
        </DialogActions>
      </Dialog>

      {/* State Change Dialog */}
      <Dialog open={stateChangeDialogOpen} onClose={() => setStateChangeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Estado de Cita</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Paciente:</strong> {selectedAppointment.Patient?.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha:</strong> {formatDate(selectedAppointment.appointmentDate)} - {formatTime(selectedAppointment.appointmentTime)}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2"><strong>Estado:</strong></Typography>
                  {getStatusChip(selectedAppointment.status)}
                  <ArrowIcon fontSize="small" />
                  {getStatusChip(newState)}
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Motivo del cambio (opcional)"
                value={stateChangeReason}
                onChange={(e) => setStateChangeReason(e.target.value)}
                placeholder="Ej: Paciente llegó tarde, Reagendado, etc."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStateChangeDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleStateChange}
            disabled={actionLoading || !newState}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* State History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Historial de Estados - Cita #{selectedAppointment?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : stateHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay cambios de estado registrados
            </Typography>
          ) : (
            <List>
              {stateHistory.map((history, index) => (
                <Box key={history.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon sx={{ mt: 1 }}>
                      <TimelineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {history.previousState && getStatusChip(history.previousState)}
                          {history.previousState && <ArrowIcon fontSize="small" />}
                          {getStatusChip(history.newState)}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Por: <strong>{history.changer?.fullName || 'Usuario desconocido'}</strong> ({history.changer?.role})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Fecha: {formatDateTime(history.timestamp)}
                          </Typography>
                          {history.reason && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Motivo: <em>{history.reason}</em>
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < stateHistory.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)} variant="outlined">
            Cerrar
          </Button>
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

      {/* Completion Verification Dialog */}
      <Dialog open={completionDialogOpen} onClose={() => setCompletionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          Confirmar Finalización de Cita
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedAppointment && (
            <>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Paciente: {selectedAppointment.Patient?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Servicio: {selectedAppointment.Service?.name}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* Payment Summary */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                  💰 RESUMEN DE PAGO
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${selectedAppointment.Payment?.totalAmount || selectedAppointment.Service?.price || '0'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Depósito pagado:</Typography>
                    <Typography variant="body2" color="success.main">
                      ${selectedAppointment.Payment?.depositAmount || '0'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={600}>Saldo pendiente:</Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={parseFloat(selectedAppointment.Payment?.remainingBalance || 0) > 0 ? 'warning.main' : 'success.main'}
                    >
                      ${selectedAppointment.Payment?.remainingBalance || '0'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {parseFloat(selectedAppointment.Payment?.remainingBalance || 0) > 0 ? (
                <>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      ⚠️ ¿El paciente pagó el saldo restante de ${selectedAppointment.Payment?.remainingBalance}?
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Al confirmar, se registrará el pago del saldo y la cita se marcará como completada.
                    </Typography>
                  </Alert>

                  {/* Payment Method Selector */}
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Método de Pago del Saldo</InputLabel>
                    <Select
                      value={balancePaymentMethod}
                      onChange={(e) => {
                        setBalancePaymentMethod(e.target.value);
                        if (e.target.value === 'cash') {
                          setBalancePaymentProof(null); // Clear file when switching to cash
                        }
                      }}
                      label="Método de Pago del Saldo"
                    >
                      <MenuItem value="cash">💵 Efectivo</MenuItem>
                      <MenuItem value="transfer">🏦 Transferencia</MenuItem>
                    </Select>
                  </FormControl>

                  {/* File Upload for Transferencia */}
                  {balancePaymentMethod === 'transfer' && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                      >
                        {balancePaymentProof ? '✅ Comprobante cargado' : '📎 Cargar Comprobante de Transferencia'}
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) => setBalancePaymentProof(e.target.files[0])}
                        />
                      </Button>
                      {balancePaymentProof && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                          Archivo: {balancePaymentProof.name}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ✅ El pago está completo. La cita se marcará como completada.
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setCompletionDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCompleteAppointment}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {actionLoading ? 'Procesando...' : 'Sí, Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
