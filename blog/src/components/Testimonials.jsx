import { Box, Container, Typography, Card, CardContent, Avatar, Rating, Grid } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const testimonials = [
  {
    name: 'María González',
    service: 'Dermatología',
    rating: 5,
    comment: 'Excelente atención y resultados. El tratamiento para mi acné fue muy efectivo y el seguimiento impecable.',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    name: 'Carlos Ramírez',
    service: 'Podología',
    rating: 5,
    comment: 'Profesionales muy capacitados. Resolvieron mi problema de uñas encarnadas de forma rápida y sin dolor.',
    avatar: 'https://i.pravatar.cc/150?img=13'
  },
  {
    name: 'Ana Martínez',
    service: 'Tamiz',
    rating: 5,
    comment: 'La detección temprana me salvó. Gracias al tamiz dermatológico detectaron un lunar sospechoso a tiempo.',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'Roberto Silva',
    service: 'Dermatología',
    rating: 5,
    comment: 'Instalaciones modernas y personal muy amable. Me sentí en confianza desde la primera consulta.',
    avatar: 'https://i.pravatar.cc/150?img=12'
  }
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'primary.main',
          opacity: 0.2
        }}
      >
        <FormatQuoteIcon sx={{ fontSize: 48 }} />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Avatar
            src={testimonial.avatar}
            alt={testimonial.name}
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {testimonial.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {testimonial.service}
            </Typography>
          </Box>
        </Box>

        <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />

        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          "{testimonial.comment}"
        </Typography>
      </CardContent>
    </Card>
  );
};

const Testimonials = () => {
  return (
    <Box id="testimonios" sx={{ py: 8, bgcolor: 'grey.50', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          Lo que dicen nuestros pacientes
        </Typography>

        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          La satisfacción de nuestros pacientes es nuestra mejor carta de presentación
        </Typography>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <TestimonialCard testimonial={testimonial} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
