import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const services = [
  {
    title: 'Dermatología',
    description: 'Diagnóstico y tratamiento integral de enfermedades de la piel, cabello y uñas.',
    image: '/images/derma.jpg',
    treatments: [
      'Diagnóstico de cáncer de piel',
      'Tratamiento de acné',
      'Psoriasis y eccema',
      'Dermatitis atópica',
      'Alopecia y caída de cabello',
      'Enfermedades de las uñas'
    ]
  },
  {
    title: 'Tamiz',
    description: 'Exámenes preventivos para detección temprana de problemas dermatológicos.',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
    treatments: [
      'Dermatoscopia digital',
      'Mapeo de lunares',
      'Biopsias cutáneas',
      'Test de alergias',
      'Análisis capilar',
      'Evaluación de uñas'
    ]
  },
  {
    title: 'Podología',
    description: 'Cuidado especializado de los pies, tratamiento de uñas encarnadas, callos y más.',
    image: '/images/podo.jpg',
    treatments: [
      'Tratamiento de hongos en uñas',
      'Eliminación de callos y juanetes',
      'Uñas encarnadas',
      'Pie diabético',
      'Ortesis plantares',
      'Cirugía podológica menor'
    ]
  }
];

const ServiceCard = ({ service }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={service.image}
        alt={service.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
          {service.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {service.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="primary" fontWeight={600}>
            {expanded ? 'Ocultar detalles' : 'Ver detalles'}
          </Typography>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Tratamientos disponibles:
            </Typography>
            <List dense>
              {service.treatments.map((treatment, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={treatment}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const Services = () => {
  return (
    <Box id="servicios" sx={{ py: 8, bgcolor: 'white', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          fontWeight={700}
          sx={{ mb: 6 }}
        >
          Nuestros Servicios
        </Typography>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={4} key={index}>
              <ServiceCard service={service} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Services;
