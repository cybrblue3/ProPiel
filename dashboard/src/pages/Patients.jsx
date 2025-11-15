import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
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
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { patientsAPI, adminAPI } from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    address: '',
    allergies: '',
    notes: ''
  });

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientsAPI.getAll();
      setPatients(response.data.data || response.data);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatientAppointments = async (patientId) => {
    try {
      setAppointmentsLoading(true);
      // Get all appointments and filter by patient
      const response = await adminAPI.getAllAppointments({ limit: 100 });
      const allAppointments = response.data.data.appointments;
      const filtered = allAppointments.filter(apt => apt.patientId === patientId);
      setPatientAppointments(filtered);
    } catch (err) {
      console.error('Error loading patient appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
    setTabValue(0);
    await loadPatientAppointments(patient.id);
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setEditForm({
      fullName: patient.fullName || '',
      phone: patient.phone || '',
      email: patient.email || '',
      birthDate: patient.birthDate || '',
      gender: patient.gender || '',
      address: patient.address || '',
      allergies: patient.allergies || '',
      notes: patient.notes || ''
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await patientsAPI.update(selectedPatient.id, editForm);
      await loadPatients();
      setEditOpen(false);
      setSelectedPatient(null);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Error al actualizar el paciente');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    return timeString.substring(0, 5);
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

  // Filter patients by search term
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      patient.fullName?.toLowerCase().includes(search) ||
      patient.phone?.includes(search) ||
      patient.email?.toLowerCase().includes(search)
    );
  });

  // Paginate filtered results
  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Pacientes
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadPatients}
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

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, teléfono o email..."
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
        </CardContent>
      </Card>

      {/* Patients Table */}
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
                  <TableCell>Nombre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Sexo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No se encontraron pacientes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>#{patient.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.fullName}
                        </Typography>
                      </TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.email || '-'}</TableCell>
                      <TableCell>{calculateAge(patient.birthDate)} años</TableCell>
                      <TableCell>
                        {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(patient)}
                          title="Ver detalles"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(patient)}
                          title="Editar"
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

          <TablePagination
            component="div"
            count={filteredPatients.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
          />
        </Card>
      )}

      {/* Details Dialog with Tabs */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Detalles del Paciente #{selectedPatient?.id}
        </DialogTitle>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Información Personal" />
          <Tab label="Historial de Citas" />
        </Tabs>

        <DialogContent sx={{ mt: 2 }}>
          {selectedPatient && (
            <Box>
              {/* Tab 0: Personal Information */}
              {tabValue === 0 && (
                <Box>
                  <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                      Datos Personales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Nombre:</strong> {selectedPatient.fullName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Teléfono:</strong> {selectedPatient.phone}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Email:</strong> {selectedPatient.email || 'No proporcionado'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CakeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Fecha de nacimiento:</strong> {formatDate(selectedPatient.birthDate)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Edad:</strong> {calculateAge(selectedPatient.birthDate)} años
                        </Typography>
                        <Typography variant="body2">
                          <strong>Sexo:</strong> {selectedPatient.gender === 'male' ? 'Masculino' : 'Femenino'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {selectedPatient.address && (
                    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                        Dirección
                      </Typography>
                      <Typography variant="body2">{selectedPatient.address}</Typography>
                    </Paper>
                  )}

                  {selectedPatient.allergies && (
                    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                        Alergias
                      </Typography>
                      <Typography variant="body2">{selectedPatient.allergies}</Typography>
                    </Paper>
                  )}

                  {selectedPatient.notes && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                        Notas
                      </Typography>
                      <Typography variant="body2">{selectedPatient.notes}</Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {/* Tab 1: Appointment History */}
              {tabValue === 1 && (
                <Box>
                  {appointmentsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : patientAppointments.length === 0 ? (
                    <Alert severity="info">
                      Este paciente no tiene citas registradas.
                    </Alert>
                  ) : (
                    <List>
                      {patientAppointments.map((apt, index) => (
                        <Box key={apt.id}>
                          <ListItem alignItems="flex-start">
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {apt.Service?.name}
                                  </Typography>
                                  {getStatusChip(apt.status)}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    📅 {formatDate(apt.appointmentDate)} - {formatTime(apt.appointmentTime)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    👨‍⚕️ Dr. {apt.Doctor?.fullName}
                                  </Typography>
                                  {apt.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      📝 {apt.notes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < patientAppointments.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setDetailsOpen(false)} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Paciente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de nacimiento"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Sexo"
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                multiline
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alergias"
                multiline
                rows={2}
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients;
