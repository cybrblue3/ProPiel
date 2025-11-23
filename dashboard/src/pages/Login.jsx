import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Logo5 from '../components/Logo5';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    const result = await login(formData.username, formData.password);

    setLoading(false);

    if (result.success) {
      // Navigate to index which uses smart redirect based on role
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 450 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Logo5 width={200} variant="full" />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Help Text */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Credenciales de prueba:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Admin: admin / admin123
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Doctor: derma / derma123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
