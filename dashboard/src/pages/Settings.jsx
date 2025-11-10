import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  MedicalServices as ServicesIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Blocked Dates
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedDateDialog, setBlockedDateDialog] = useState(false);
  const [blockedDateForm, setBlockedDateForm] = useState({ date: '', reason: '' });

  // Services
  const [services, setServices] = useState([]);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    depositPercentage: 50,
    duration: 60
  });

  // Get auth token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // Load Blocked Dates
  const loadBlockedDates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/blocked-dates`, {
        headers: getAuthHeader()
      });
      setBlockedDates(response.data.data);
    } catch (err) {
      console.error('Error loading blocked dates:', err);
      setError('Error al cargar fechas bloqueadas');
    } finally {
      setLoading(false);
    }
  };

  // Load Services
  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/services`, {
        headers: getAuthHeader()
      });
      setServices(response.data.data);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      loadBlockedDates();
    } else if (tabValue === 1) {
      loadServices();
    }
  }, [tabValue]);

  // Blocked Dates Functions
  const handleAddBlockedDate = async () => {
    try {
      await axios.post(`${API_URL}/admin/blocked-dates`, blockedDateForm, {
        headers: getAuthHeader()
      });
      setSuccess('Fecha bloqueada agregada exitosamente');
      setBlockedDateDialog(false);
      setBlockedDateForm({ date: '', reason: '' });
      loadBlockedDates();
    } catch (err) {
      setError('Error al agregar fecha bloqueada');
    }
  };

  const handleDeleteBlockedDate = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta fecha bloqueada?')) return;

    try {
      await axios.delete(`${API_URL}/admin/blocked-dates/${id}`, {
        headers: getAuthHeader()
      });
      setSuccess('Fecha bloqueada eliminada exitosamente');
      loadBlockedDates();
    } catch (err) {
      setError('Error al eliminar fecha bloqueada');
    }
  };

  // Services Functions
  const handleOpenServiceDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        price: service.price,
        depositPercentage: service.depositPercentage,
        duration: service.duration
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '',
        description: '',
        price: '',
        depositPercentage: 50,
        duration: 60
      });
    }
    setServiceDialog(true);
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        // Update
        await axios.put(`${API_URL}/admin/services/${editingService.id}`, serviceForm, {
          headers: getAuthHeader()
        });
        setSuccess('Servicio actualizado exitosamente');
      } else {
        // Create
        await axios.post(`${API_URL}/admin/services`, serviceForm, {
          headers: getAuthHeader()
        });
        setSuccess('Servicio creado exitosamente');
      }
      setServiceDialog(false);
      loadServices();
    } catch (err) {
      setError('Error al guardar servicio');
    }
  };

  const handleToggleServiceStatus = async (service) => {
    try {
      await axios.put(
        `${API_URL}/admin/services/${service.id}`,
        { isActive: !service.isActive },
        { headers: getAuthHeader() }
      );
      setSuccess(`Servicio ${service.isActive ? 'desactivado' : 'activado'} exitosamente`);
      loadServices();
    } catch (err) {
      setError('Error al cambiar estado del servicio');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Configuración del Sistema</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => tabValue === 0 ? loadBlockedDates() : loadServices()}
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

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<EventIcon />} label="Fechas Bloqueadas" />
          <Tab icon={<ServicesIcon />} label="Servicios" />
        </Tabs>

        <CardContent>
          {/* Tab 0: Blocked Dates */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Gestión de Fechas Bloqueadas</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setBlockedDateDialog(true)}
                >
                  Agregar Fecha
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {blockedDates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              No hay fechas bloqueadas
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        blockedDates.map((blocked) => (
                          <TableRow key={blocked.id}>
                            <TableCell>{formatDate(blocked.date)}</TableCell>
                            <TableCell>{blocked.reason || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={blocked.isActive ? 'Activo' : 'Inactivo'}
                                color={blocked.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteBlockedDate(blocked.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Tab 1: Services */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Gestión de Servicios</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenServiceDialog()}
                >
                  Agregar Servicio
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Anticipo</TableCell>
                        <TableCell>Duración</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {services.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              No hay servicios registrados
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {service.name}
                              </Typography>
                              {service.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {service.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>${service.price} MXN</TableCell>
                            <TableCell>
                              ${service.depositAmount} ({service.depositPercentage}%)
                            </TableCell>
                            <TableCell>{service.duration} min</TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={service.isActive}
                                    onChange={() => handleToggleServiceStatus(service)}
                                    size="small"
                                  />
                                }
                                label={service.isActive ? 'Activo' : 'Inactivo'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenServiceDialog(service)}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Blocked Date Dialog */}
      <Dialog open={blockedDateDialog} onClose={() => setBlockedDateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Fecha Bloqueada</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="date"
            label="Fecha"
            value={blockedDateForm.date}
            onChange={(e) => setBlockedDateForm({ ...blockedDateForm, date: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Motivo (opcional)"
            value={blockedDateForm.reason}
            onChange={(e) => setBlockedDateForm({ ...blockedDateForm, reason: e.target.value })}
            placeholder="Ej: Día festivo, vacaciones, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockedDateDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAddBlockedDate}
            disabled={!blockedDateForm.date}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Service Dialog */}
      <Dialog open={serviceDialog} onClose={() => setServiceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Editar Servicio' : 'Agregar Servicio'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del servicio"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Precio (MXN)"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="% Anticipo"
                value={serviceForm.depositPercentage}
                onChange={(e) => setServiceForm({ ...serviceForm, depositPercentage: e.target.value })}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Duración (minutos)"
                value={serviceForm.duration}
                onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveService}
            disabled={!serviceForm.name || !serviceForm.price || !serviceForm.duration}
          >
            {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
