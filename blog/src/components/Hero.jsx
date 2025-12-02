import { Box, Container, Typography, Button, Grid } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const Hero = () => {
  return (
    <Box
      id="inicio"
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3
            }}
          >
            Tu piel en las mejores manos
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 300,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              opacity: 0.95
            }}
          >
            Cuidado dermatológico especializado con los más altos estándares médicos
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<CalendarMonthIcon />}
            href={import.meta.env.VITE_BOOKING_URL || 'http://localhost:3001'}
            target="_blank"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 25,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(0,0,0,0.25)'
              },
              transition: 'all 0.3s ease',
              mb: 6
            }}
          >
            Agenda tu cita
          </Button>

          {/* Trust Badges */}
          <Grid container spacing={3} sx={{ maxWidth: 700, mx: 'auto', justifyContent: 'center' }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <VerifiedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  10+ Años
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  de experiencia
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <GroupsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  10,000+
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  pacientes satisfechos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalHospitalIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Certificados
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  dermatólogos profesionales
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
