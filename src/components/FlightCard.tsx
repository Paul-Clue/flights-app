'use client';

import { Box, Card, Typography, Divider } from '@mui/material';
import { Flight, Schedule } from '@mui/icons-material';

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
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card sx={{ p: 2, mb: 2, bgcolor: '#3A3B3F', color: 'white' }}>
      {legs.map((leg, index) => (
        <Box key={index}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" component="div">
                {leg.carrier.name}
              </Typography>
              <Typography color="text.secondary">
                Flight {leg.flightNumber}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                {price.currency} {price.amount}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h6">{formatTime(leg.departure.time)}</Typography>
              <Typography>{leg.departure.airport}</Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Flight sx={{ transform: 'rotate(90deg)' }} />
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatDuration(leg.duration)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">{formatTime(leg.arrival.time)}</Typography>
              <Typography>{leg.arrival.airport}</Typography>
            </Box>
          </Box>

          {index < legs.length - 1 && (
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
          )}
        </Box>
      ))}
    </Card>
  );
} 