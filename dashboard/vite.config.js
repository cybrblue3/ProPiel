import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/lab/Timeline',
      '@mui/lab/TimelineItem',
      '@mui/lab/TimelineSeparator',
      '@mui/lab/TimelineConnector',
      '@mui/lab/TimelineContent',
      '@mui/lab/TimelineDot',
      '@mui/lab/TimelineOppositeContent'
    ]
  }
})
