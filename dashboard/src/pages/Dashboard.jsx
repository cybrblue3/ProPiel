import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    confirmed: 0,
    total: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await adminAPI.getAllAppointments({
        date: today,
        limit: 5,
        page: 1
      });

      // Sort by time
      const sorted = response.data.data.appointments.sort((a, b) => {
        return a.appointmentTime.localeCompare(b.appointmentTime);
      });

      // Only show upcoming appointments (from current time onwards)
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

      const upcoming = sorted.filter(apt => {
        // Show all non-cancelled appointments ordered by time
        return apt.status !== 'cancelled';
      });

      setTodayAppointments(upcoming.slice(0, 5));
    } catch (err) {
      console.error('Error fetching today appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchTodayAppointments();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchStats();
      fetchTodayAppointments();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const handleStatCardClick = (type) => {
    // Navigate to appointments page with specific tab
    const tabMap = {
      pending: 1,    // Pendientes tab
      today: 2,      // Hoy tab
      confirmed: 3,  // Confirmadas tab
      total: 0       // Todas tab
    };

    navigate('/appointments', { state: { initialTab: tabMap[type] } });
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h3" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
              borderRadius: 2,
              p: 1.5
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <Typography variant="caption">
            Ver todas
          </Typography>
          <ArrowIcon fontSize="small" />
        </Box>
      </CardContent>
    </Card>
  );

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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
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
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          ¡Bienvenido, {user?.fullName}!
        </Typography>
        <Typography variant="body1">
          {user?.role === 'admin' && 'Panel de recepción - Gestión de citas'}
          {user?.role === 'superadmin' && 'Panel de administración del sistema'}
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards - Now Clickable! */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Pendientes"
            value={stats.pending}
            icon={<PendingIcon fontSize="large" />}
            color="warning"
            onClick={() => handleStatCardClick('pending')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas de Hoy"
            value={stats.today}
            icon={<EventIcon fontSize="large" />}
            color="info"
            onClick={() => handleStatCardClick('today')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Confirmadas"
            value={stats.confirmed}
            icon={<CheckIcon fontSize="large" />}
            color="success"
            onClick={() => handleStatCardClick('confirmed')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Citas"
            value={stats.total}
            icon={<EventIcon fontSize="large" />}
            color="primary"
            onClick={() => handleStatCardClick('total')}
          />
        </Grid>
      </Grid>

      {/* Today's Next 5 Appointments */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Acceso Rápido - Próximas Citas de Hoy
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowIcon />}
              onClick={() => navigate('/appointments', { state: { initialTab: 2 } })}
            >
              Ver todas
            </Button>
          </Box>

          {appointmentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : todayAppointments.length === 0 ? (
            <Alert severity="info">
              No hay citas programadas para hoy.
            </Alert>
          ) : (
            <List>
              {todayAppointments.map((apt, index) => (
                <Box key={apt.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => navigate('/appointments', { state: { initialTab: 2 } })}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 60,
                        mr: 2
                      }}
                    >
                      <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                      <Typography variant="body2" fontWeight={600}>
                        {formatTime(apt.appointmentTime)}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {apt.Patient?.fullName}
                          </Typography>
                          {getStatusChip(apt.status)}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {apt.Service?.name} • Dr. {apt.Doctor?.fullName?.split(' ')[0]}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < todayAppointments.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}

          {/* Summary Alert */}
          {stats.pending > 0 && (
            <Alert
              severity="warning"
              sx={{ mt: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => navigate('/appointments', { state: { initialTab: 1 } })}
                >
                  Ver
                </Button>
              }
            >
              Tienes {stats.pending} cita{stats.pending > 1 ? 's' : ''} pendiente{stats.pending > 1 ? 's' : ''} de aprobar.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
