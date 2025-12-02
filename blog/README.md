# ProPiel Blog

Modern, responsive blog for ProPiel dermatology clinic built with React + Vite and Material-UI.

## Features

- ✨ Modern, clean design with Material-UI components
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Custom theme matching ProPiel branding
- 🖼️ Real medical imagery from Unsplash
- 🔗 Integrated booking system link
- ⚡ Fast performance with Vite

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Emotion** - CSS-in-JS styling
- **Google Fonts (Inter)** - Typography

## Components

- **Navbar** - Responsive navigation with smooth scrolling
- **Hero** - Eye-catching hero section with CTA
- **Services** - Expandable service cards (Dermatología, Tamiz, Podología)
- **About** - Clinic features and expertise
- **Testimonials** - Patient testimonials with ratings
- **Contact** - Contact information and CTA
- **Footer** - Site footer with navigation and social links

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_BOOKING_URL=http://localhost:3001
```

## Development

Run development server:
```bash
npm run dev
```

The blog will be available at `http://localhost:5173` (or next available port).

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment

The blog can be deployed to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Railway** (with static site hosting)

### Vercel Deployment

1. Install Vercel CLI (if not installed):
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
   - `VITE_BOOKING_URL` = your production booking URL

## Configuration

### Booking URL

The "Agendar Cita" buttons link to the public booking system. Configure the URL via:

- **Development**: `VITE_BOOKING_URL` in `.env` file
- **Production**: Environment variable in hosting platform

Default fallback: `http://localhost:3001`

### Theme Customization

Edit `src/theme.js` to customize:
- Colors (primary, secondary)
- Typography
- Component styles
- Border radius
- Shadows

### Content Updates

Update content in component files:
- `src/components/Services.jsx` - Service descriptions
- `src/components/About.jsx` - About section features
- `src/components/Testimonials.jsx` - Patient testimonials
- `src/components/Contact.jsx` - Contact information
- `src/components/Footer.jsx` - Footer links and details

## Project Structure

```
blog-new/
├── public/
│   └── propiel_logo_*.svg        # ProPiel logos
├── src/
│   ├── components/
│   │   ├── About.jsx             # About section
│   │   ├── Contact.jsx           # Contact section
│   │   ├── Footer.jsx            # Footer
│   │   ├── Hero.jsx              # Hero section
│   │   ├── Logo.jsx              # ProPiel logo component
│   │   ├── Navbar.jsx            # Navigation
│   │   ├── Services.jsx          # Services cards
│   │   └── Testimonials.jsx      # Testimonials
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── theme.js                  # Material-UI theme
├── .env.example                  # Example environment variables
├── index.html                    # HTML template
├── package.json                  # Dependencies
└── vite.config.js                # Vite configuration
```

## License

© 2025 ProPiel Dermatología. All rights reserved.
