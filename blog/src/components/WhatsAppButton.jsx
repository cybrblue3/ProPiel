import { Fab, Tooltip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsAppButton = () => {
  // WhatsApp number: +52 755 557 3262
  const phoneNumber = '527555573262';
  const message = encodeURIComponent('Hola, me gustaría agendar una cita en ProPiel');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <Tooltip title="Chatea con nosotros" placement="left" arrow>
      <Fab
        color="success"
        aria-label="whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: { xs: 20, md: 30 },
          right: { xs: 20, md: 30 },
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          bgcolor: '#25D366',
          color: 'white',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          '&:hover': {
            bgcolor: '#128C7E',
            transform: 'scale(1.1)',
            boxShadow: '0 6px 25px rgba(37, 211, 102, 0.6)',
          },
          transition: 'all 0.3s ease',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            },
            '50%': {
              boxShadow: '0 4px 20px rgba(37, 211, 102, 0.8)',
            },
            '100%': {
              boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            },
          },
        }}
      >
        <WhatsAppIcon sx={{ fontSize: { xs: 32, md: 36 } }} />
      </Fab>
    </Tooltip>
  );
};

export default WhatsAppButton;
