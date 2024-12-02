'use client';

import FlightSearch from '@/components/FlightSearch';
import { Box, Typography } from '@mui/material';

export default function Home() {
  return (
    <Box
      component='main'
      sx={{
        width: '100%',
        minWidth: '100%',
        height: '100vh',
        bgcolor: '#202123',
        p: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(/hero-img.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          position: 'absolute',
          height: '19vw',
          minHeight: '136px',
          width: '70vw',
          left: '50%',
          transform: 'translate3d(-50%, 0, 0)',
        }}
      >
        <Typography
          variant='h1'
          sx={{
            fontSize: '3.5rem',
            fontWeight: 'normal',
            mb: 4,
            position: 'absolute',
            bottom: 0,
          }}
        >
          Flights
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 32 }}>
        <FlightSearch />
      </Box>
    </Box>
  );
}
