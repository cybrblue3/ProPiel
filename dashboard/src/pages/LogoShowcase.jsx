import { Box, Container, Typography, Paper, Grid, Divider, Chip } from '@mui/material';
import Logo1 from '../components/Logo1';
import Logo2 from '../components/Logo2';
import Logo3 from '../components/Logo3';
import Logo5 from '../components/Logo5';
import Logo6 from '../components/Logo6';

const LogoShowcase = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        ProPiel Logo Concepts
      </Typography>

      {/* TOP PICKS */}
      <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
        🔥 Top Picks (Fixed Versions)
      </Typography>

      {/* Logo 5 */}
      <Paper sx={{ p: 4, mb: 4, border: '3px solid #1976d2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 0 }}>
            ⭐ Logo 5: Layered Hexagons (No Circles!)
          </Typography>
          <Chip label="FIXED" color="success" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Three stacked hexagons representing skin layers. Abstract, geometric, professional. NO NIPPLES! 😂
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Full Logo
              </Typography>
              <Logo5 width={280} variant="full" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Icon Only
              </Typography>
              <Logo5 width={100} variant="icon" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'primary.main', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                On Dark Background
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo5 width={200} variant="full" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#1565c0', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                Icon on Sidebar
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo5 width={60} variant="icon" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Logo 6 */}
      <Paper sx={{ p: 4, mb: 4, border: '2px solid #42a5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 0 }}>
            ⭐ Logo 6: Minimal Lines + Cross
          </Typography>
          <Chip label="CLEAN" color="info" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ultra-minimal. Two hexagons + medical cross symbol. Super clean, versatile, timeless.
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Full Logo
              </Typography>
              <Logo6 width={280} variant="full" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Icon Only
              </Typography>
              <Logo6 width={100} variant="icon" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'primary.main', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                On Dark Background
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo6 width={200} variant="full" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#1565c0', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                Icon on Sidebar
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo6 width={60} variant="icon" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
        Original Concepts (for reference)
      </Typography>

      {/* Concept 1 */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Concept 1: Geometric Skin Layers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Layered hexagons representing the three layers of skin (epidermis, dermis, hypodermis).
          Modern, geometric, professional.
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Full Logo
              </Typography>
              <Logo1 width={280} variant="full" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Icon Only
              </Typography>
              <Logo1 width={100} variant="icon" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Dark background preview */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'primary.main', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                On Dark Background
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo1 width={200} variant="full" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#1565c0', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                Icon on Sidebar
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo1 width={60} variant="icon" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Concept 2 */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Concept 2: Protection Shield
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Shield design representing skin protection and care. Medical, trustworthy, with gradient for modern touch.
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Full Logo
              </Typography>
              <Logo2 width={280} variant="full" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Icon Only
              </Typography>
              <Logo2 width={100} variant="icon" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'primary.main', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                On Dark Background
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo2 width={200} variant="full" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#1565c0', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                Icon on Sidebar
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo2 width={60} variant="icon" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Concept 3 */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Concept 3: DNA/Cell Structure
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Scientific cell structure design. Ultra-modern, clean, representing cellular health and dermatology science.
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Full Logo
              </Typography>
              <Logo3 width={280} variant="full" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>
                Icon Only
              </Typography>
              <Logo3 width={100} variant="icon" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'primary.main', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                On Dark Background
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo3 width={200} variant="full" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#1565c0', p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom sx={{ color: 'white' }}>
                Icon on Sidebar
              </Typography>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Logo3 width={60} variant="icon" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Usage Instructions */}
      <Paper sx={{ p: 4, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom>
          💡 How to Use
        </Typography>
        <Typography variant="body2" paragraph>
          These are React components that you can use anywhere in the app:
        </Typography>
        <Box component="pre" sx={{ bgcolor: 'grey.900', color: 'white', p: 2, borderRadius: 1, overflow: 'auto' }}>
{`import Logo1 from './components/Logo1';

// Full logo
<Logo1 width={200} variant="full" />

// Icon only
<Logo1 width={60} variant="icon" />`}
        </Box>
      </Paper>
    </Container>
  );
};

export default LogoShowcase;
