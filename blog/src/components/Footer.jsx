import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Logo from './Logo';

const Footer = () => {
  const handleNavClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        py: 6,
        mt: 'auto',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Logo width={180} theme="light" />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              Clínica especializada en dermatología, podología y tamiz dermatológico.
              Tu salud cutánea es nuestra prioridad.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                aria-label="facebook"
                component="a"
                href="https://www.facebook.com/share/16Tjkk7Pb1/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="instagram"
                component="a"
                href="https://www.instagram.com/dermatologiaixtapazihuatanejo?igsh=MWNoMzB6b3dzdTN4bQ=="
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                aria-label="whatsapp"
                component="a"
                href="https://wa.me/527555573262?text=Hola,%20me%20gustaría%20agendar%20una%20cita%20en%20ProPiel"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <WhatsAppIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Enlaces
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component="button"
                onClick={() => handleNavClick('#inicio')}
                sx={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  textAlign: 'left',
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Inicio
              </Link>
              <Link
                component="button"
                onClick={() => handleNavClick('#servicios')}
                sx={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  textAlign: 'left',
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Servicios
              </Link>
              <Link
                component="button"
                onClick={() => handleNavClick('#nosotros')}
                sx={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  textAlign: 'left',
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Nosotros
              </Link>
              <Link
                component="button"
                onClick={() => handleNavClick('#contacto')}
                sx={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  textAlign: 'left',
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Contacto
              </Link>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Servicios
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Dermatología General
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tamiz Dermatológico
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Podología Especializada
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tratamientos Médicos
              </Typography>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                📞 +52 755 557 3262
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                ✉️ propiel@hotmail.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                📍 Topacio 19
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Zihuatanejo, Gro.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} ProPiel Dermatología. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
