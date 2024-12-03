'use client';

import FlightSearch from '@/components/FlightSearch';
import { Box, Typography } from '@mui/material';
import { Suspense } from 'react';

function MainContent() {
  return (
    <Box
      component='main'
      sx={{
        width: '100%',
        minWidth: '100%',
        minHeight: '100vh',
        bgcolor: '#202123',
        p: { xs: 2, sm: 4, md: 8 },
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
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          height: { xs: '100px', sm: '136px', md: '19vw' },
          width: { xs: '90vw', sm: '80vw', md: '70vw' },
          mx: 'auto',
          mb: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Typography
          variant='h1'
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
            fontWeight: 'normal',
            position: 'absolute',
            bottom: 0,
          }}
        >
          Flights
        </Typography>
      </Box>

      <Box sx={{ 
        maxWidth: 800, 
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <FlightSearch />
      </Box>
    </Box>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainContent />
    </Suspense>
  );
}
