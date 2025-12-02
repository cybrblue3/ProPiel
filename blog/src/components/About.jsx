import { Box, Container, Typography, Grid } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupsIcon from '@mui/icons-material/Groups';

const features = [
  {
    icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
    title: 'Dermatólogos Certificados',
    description: 'Equipo médico con certificación y años de experiencia'
  },
  {
    icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
    title: 'Tecnología Avanzada',
    description: 'Equipamiento de última generación para diagnóstico preciso'
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 40 }} />,
    title: 'Atención Personalizada',
    description: 'Planes de tratamiento adaptados a cada paciente'
  }
];

const About = () => {
  return (
    <Box id="nosotros" sx={{ py: 8, bgcolor: 'grey.50', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Text Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight={700}
              sx={{ mb: 3 }}
            >
              Expertos en Salud Dermatológica
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              En ProPiel contamos con un equipo de dermatólogos certificados con más de 15 años
              de experiencia en el diagnóstico y tratamiento de enfermedades de la piel.
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
              Nuestra clínica está equipada con tecnología de última generación para ofrecerte
              los mejores resultados en cada tratamiento.
            </Typography>

            {/* Features */}
            <Box sx={{ mb: 4 }}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    mb: 3,
                    gap: 2
                  }}
                >
                  <Box sx={{ color: 'primary.main', flexShrink: 0 }}>
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                component="img"
                src="/images/health.jpg"
                alt="Clínica ProPiel"
                sx={{
                  width: { xs: '100%', md: '85%' },
                  maxHeight: { xs: 300, md: 400 },
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
