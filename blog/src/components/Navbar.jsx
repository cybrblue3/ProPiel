import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from './Logo';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Nosotros', href: '#nosotros' },
    { label: 'Contacto', href: '#contacto' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box
        component="a"
        href={import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'}
        sx={{
          py: 2,
          display: 'block',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
      >
        <Logo width={180} />
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              onClick={() => handleNavClick(item.href)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            sx={{ textAlign: 'center' }}
            component="a"
            href={import.meta.env.VITE_BOOKING_URL || 'http://localhost:3001'}
            target="_blank"
          >
            <ListItemText primary="Agendar Cita" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          left: 0,
          right: 0,
          width: '100%'
        }}
      >
          <Container maxWidth="lg">
            <Toolbar disableGutters>
              {/* Logo */}
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Box
                  component="a"
                  href={import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'}
                  sx={{
                    width: { xs: 140, sm: 160, md: 180 },
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  <Logo width={180} />
                </Box>
              </Box>

              {/* Desktop Menu */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    sx={{
                      color: 'text.primary',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: 0,
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'primary.main',
                        transition: 'width 0.3s ease'
                      },
                      '&:hover::after': {
                        width: '100%'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="contained"
                  component="a"
                  href={import.meta.env.VITE_BOOKING_URL || 'http://localhost:3001'}
                  target="_blank"
                  sx={{
                    borderRadius: 25,
                    px: 3
                  }}
                >
                  Agendar Cita
                </Button>
              </Box>

              {/* Mobile menu button */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
