'use client';

import { Box, Card, Typography, Divider } from '@mui/material';
import { Flight } from '@mui/icons-material';

interface FlightLeg {
  departure: {
    time: string;
    airport: string;
  };
  arrival: {
    time: string;
    airport: string;
  };
  duration: number;
  carrier: {
    name: string;
    code: string;
  };
  flightNumber: string;
}

interface FlightCardProps {
  price: {
    amount: number;
    currency: string;
  };
  legs: FlightLeg[];
}

export default function FlightCard({ price, legs }: FlightCardProps) {
  if (!price || !legs || legs.length === 0) {
    return (
      <Card sx={{ p: 2, mb: 2, bgcolor: '#3A3B3F', color: 'white' }}>
        <Typography>Flight details unavailable</Typography>
      </Card>
    );
  }

  const formatTime = (time: string) => {
    try {
      return new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Time unavailable' + error;
    }
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card sx={{ 
      p: { xs: 1.5, sm: 2 }, 
      mb: { xs: 1.5, sm: 2 }, 
      bgcolor: '#3A3B3F', 
      color: 'white' 
    }}>
      {legs.map((leg, index) => (
        <Box key={index}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
            justifyContent: 'space-between', 
            mb: { xs: 1, sm: 2 },
            gap: { xs: 1, sm: 0 }
          }}>
            <Box>
              <Typography variant='h6' component='div'>
                {leg.carrier.name}
              </Typography>
              <Typography color='red'>
                Flight {leg.flightNumber}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='h6'>
                {price.currency} {price.amount}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 }, 
            mb: { xs: 1, sm: 2 } 
          }}>
            <Box>
              <Typography variant='h6'>
                {formatTime(leg.departure.time)}
              </Typography>
              <Typography>{leg.departure.airport}</Typography>
            </Box>

            <Box
              sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Flight sx={{ transform: 'rotate(90deg)' }} />
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant='body2' color='white'>
                  {formatDuration(
                    new Date(leg.arrival.time).getTime() -
                      new Date(leg.departure.time).getTime()
                  )}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='h6'>
                {formatTime(leg.arrival.time)}
              </Typography>
              <Typography>{leg.arrival.airport}</Typography>
            </Box>
          </Box>

          {index < legs.length - 1 && (
            <Divider sx={{ 
              my: { xs: 1, sm: 2 }, 
              borderColor: 'rgba(255,255,255,0.12)' 
            }} />
          )}
        </Box>
      ))}
    </Card>
  );
}
