import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const contactInfo = [
  {
    icon: <PhoneIcon sx={{ fontSize: 32 }} />,
    title: 'WhatsApp',
    details: ['+52 755 557 3262', 'Disponible para consultas']
  },
  {
    icon: <EmailIcon sx={{ fontSize: 32 }} />,
    title: 'Email',
    details: ['propiel@hotmail.com', 'Respuesta en 24 horas']
  },
  {
    icon: <LocationOnIcon sx={{ fontSize: 32 }} />,
    title: 'Ubicación',
    details: ['Topacio 19', 'Zihuatanejo, 40890 Centro, Gro.']
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
    title: 'Horario',
    details: ['Lunes a Viernes: 9:00 - 18:00', 'Sábados: 9:00 - 14:00']
  }
];

const Contact = () => {
  return (
    <Box id="contacto" sx={{ py: 8, bgcolor: 'white', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          Contáctanos
        </Typography>

        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Estamos aquí para ayudarte. Agenda tu cita o contáctanos para más información
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6, justifyContent: 'center' }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ py: 4 }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {info.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {info.title}
                  </Typography>
                  {info.details.map((detail, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {detail}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Google Maps */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={600} align="center" gutterBottom sx={{ mb: 3 }}>
            Encuéntranos
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: { xs: 300, md: 400 },
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.0373912547976!2d-101.55436612381558!3d17.64166199793556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8429f3d5e8b3c5ab%3A0x8b7c4e5e8b3c5ab!2sTopacio%2019%2C%20Centro%2C%2040890%20Zihuatanejo%20de%20Azueta%2C%20Gro.!5e0!3m2!1ses!2smx!4v1234567890123!5m2!1ses!2smx"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de ProPiel"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            📍 Topacio 19, Zihuatanejo, 40890 Centro, Gro.
          </Typography>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            py: 6,
            px: 4
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            ¿Listo para cuidar tu piel?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.95 }}>
            Agenda tu cita ahora y recibe atención profesional de nuestros especialistas
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
              transition: 'all 0.3s ease'
            }}
          >
            Agendar Cita Ahora
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
