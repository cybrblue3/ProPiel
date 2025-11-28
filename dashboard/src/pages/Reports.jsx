import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenueData, setRevenueData] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [bestMonths, setBestMonths] = useState([]);
  const [trendsPeriod, setTrendsPeriod] = useState('month');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [trendsPeriod]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [revenueRes, serviceRes, trendsRes, monthsRes] = await Promise.all([
        adminAPI.getRevenue(),
        adminAPI.getRevenueByService(),
        adminAPI.getRevenueTrends({ period: trendsPeriod }),
        adminAPI.getBestMonths({ limit: 10 })
      ]);

      setRevenueData(revenueRes.data.data);
      setServiceData(serviceRes.data.data);
      setTrendsData(trendsRes.data.data);
      setBestMonths(monthsRes.data.data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError('Error al cargar los reportes financieros');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await adminAPI.getRevenueTrends({ period: trendsPeriod });
      setTrendsData(res.data.data);
    } catch (err) {
      console.error('Error fetching trends:', err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon fontSize="large" color="primary" />
          Reportes Financieros
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Análisis de ingresos y rendimiento de la clínica
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {revenueData && (
        <>
          {/* Revenue Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Today */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <CalendarIcon fontSize="large" />
                    <Typography variant="caption">HOY</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(revenueData.daily.revenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {revenueData.daily.count} citas completadas
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Promedio: {formatCurrency(revenueData.daily.average)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Week */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <TrendingUpIcon fontSize="large" />
                    <Typography variant="caption">ESTA SEMANA</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(revenueData.weekly.revenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {revenueData.weekly.count} citas completadas
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Promedio: {formatCurrency(revenueData.weekly.average)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Month */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'warning.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <MoneyIcon fontSize="large" />
                    <Typography variant="caption">ESTE MES</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(revenueData.monthly.revenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {revenueData.monthly.count} citas completadas
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Promedio: {formatCurrency(revenueData.monthly.average)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <PaymentIcon fontSize="large" />
                    <Typography variant="caption">TOTAL</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(revenueData.total.revenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {revenueData.total.count} citas completadas
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Promedio: {formatCurrency(revenueData.total.average)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Outstanding Balance Alert */}
          {revenueData.outstandingBalance > 0 && (
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="body2">
                <strong>Saldo pendiente por cobrar:</strong> {formatCurrency(revenueData.outstandingBalance)}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Este monto representa el saldo restante de citas confirmadas que aún no ha sido pagado por los pacientes.
              </Typography>
            </Alert>
          )}

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Revenue Trends */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Tendencias de Ingresos
                    </Typography>
                    <ToggleButtonGroup
                      value={trendsPeriod}
                      exclusive
                      onChange={(e, newPeriod) => newPeriod && setTrendsPeriod(newPeriod)}
                      size="small"
                    >
                      <ToggleButton value="week">7 días</ToggleButton>
                      <ToggleButton value="month">30 días</ToggleButton>
                      <ToggleButton value="year">12 meses</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#2196F3" strokeWidth={2} name="Ingresos" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Service */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Ingresos por Servicio
                  </Typography>
                  {serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={serviceData}
                          dataKey="revenue"
                          nameKey="serviceName"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.serviceName}`}
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
                      No hay datos de ingresos por servicio
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Service Revenue Breakdown Table */}
          {serviceData.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Desglose por Servicio
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Servicio</strong></TableCell>
                        <TableCell align="right"><strong>Citas</strong></TableCell>
                        <TableCell align="right"><strong>Ingresos</strong></TableCell>
                        <TableCell align="right"><strong>Promedio</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceData.map((service, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: COLORS[index % COLORS.length]
                                }}
                              />
                              {service.serviceName}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{service.count}</TableCell>
                          <TableCell align="right">{formatCurrency(service.revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(service.averagePerAppointment)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Best Performing Months */}
          {bestMonths.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Mejores Meses
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Los meses con mayores ingresos en la historia de la clínica
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Mes</strong></TableCell>
                        <TableCell align="right"><strong>Citas</strong></TableCell>
                        <TableCell align="right"><strong>Ingresos</strong></TableCell>
                        <TableCell align="right"><strong>Promedio por Cita</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bestMonths.map((month, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: index < 3 ? 'primary.main' : 'grey.200',
                                color: index < 3 ? 'white' : 'text.primary',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              {index + 1}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={index < 3 ? 600 : 400}>
                              {month.yearMonth}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{month.count}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={index < 3 ? 600 : 400}>
                              {formatCurrency(month.revenue)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(month.average)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default Reports;
