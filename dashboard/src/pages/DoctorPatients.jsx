import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
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
  InputAdornment,
  Chip,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FolderShared as ExpedienteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadMyPatients = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all appointments for this doctor and extract unique patients
      const response = await axios.get(`${API_URL}/appointments/doctor/all`, {
        headers: getAuthHeader()
      });

      const appointments = response.data.data || [];

      // Extract unique patients from appointments
      const patientMap = new Map();
      appointments.forEach(apt => {
        if (apt.Patient && !patientMap.has(apt.Patient.id)) {
          patientMap.set(apt.Patient.id, {
            ...apt.Patient,
            lastAppointment: apt.appointmentDate,
            totalAppointments: 1
          });
        } else if (apt.Patient) {
          const existing = patientMap.get(apt.Patient.id);
          existing.totalAppointments += 1;
          // Keep the most recent appointment date
          if (new Date(apt.appointmentDate) > new Date(existing.lastAppointment)) {
            existing.lastAppointment = apt.appointmentDate;
          }
        }
      });

      // Convert map to array and sort by last appointment (most recent first)
      const uniquePatients = Array.from(patientMap.values())
        .sort((a, b) => new Date(b.lastAppointment) - new Date(a.lastAppointment));

      setPatients(uniquePatients);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPatients();
  }, []);

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
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Mis Pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pacientes que has atendido
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadMyPatients}
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

      {/* Stats Card */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {patients.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pacientes totales
            </Typography>
          </Box>
        </CardContent>
      </Card>

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
                  <TableCell>Paciente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Última Cita</TableCell>
                  <TableCell>Total Citas</TableCell>
                  <TableCell align="center">Expediente</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        {searchTerm ? 'No se encontraron pacientes' : 'Aún no tienes pacientes'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.fullName}
                        </Typography>
                        {patient.email && (
                          <Typography variant="caption" color="text.secondary">
                            {patient.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{patient.phone || '-'}</TableCell>
                      <TableCell>{calculateAge(patient.birthDate)} años</TableCell>
                      <TableCell>{formatDate(patient.lastAppointment)}</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.totalAppointments}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ExpedienteIcon />}
                          onClick={() => navigate(`/patients/${patient.id}/medical-history`)}
                        >
                          Ver Expediente
                        </Button>
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
    </Box>
  );
};

export default DoctorPatients;
