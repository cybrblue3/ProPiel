import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    confirmed: 0,
    total: 0
  });

  useEffect(() => {
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

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
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
      </CardContent>
    </Card>
  );

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
          {user?.role === 'admin' && 'Panel de administración del sistema'}
          {user?.role === 'doctor' && 'Panel de consultas y pacientes'}
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Pendientes"
            value={stats.pending}
            icon={<PendingIcon fontSize="large" />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas de Hoy"
            value={stats.today}
            icon={<EventIcon fontSize="large" />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas Confirmadas"
            value={stats.confirmed}
            icon={<CheckIcon fontSize="large" />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Citas"
            value={stats.total}
            icon={<EventIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Recent Activity or Appointments Today */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Acceso Rápido
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            {stats.pending > 0 ? (
              `Tienes ${stats.pending} cita${stats.pending > 1 ? 's' : ''} pendiente${stats.pending > 1 ? 's' : ''} de aprobar.`
            ) : (
              'No hay citas pendientes de aprobar.'
            )}
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
