'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Skeleton,
  SelectChangeEvent,
} from '@mui/material';
import FlightCard from '@/components/FlightCard';

interface Flight {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  legs: Array<{
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
  }>;
}

// Create a separate component for the results content
function ResultsContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [filterByStops, setFilterByStops] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      const searchId = searchParams.get('id');
      if (!searchId) return;

      try {
        // Try to get cached results first
        const cachedResults = sessionStorage.getItem(`flights-${searchId}`);
        if (cachedResults) {
          const parsedResults = JSON.parse(cachedResults);
          if (Array.isArray(parsedResults) && parsedResults.length > 0) {
            setFlights(parsedResults);
            setLoading(false);
            return;
          }
        }

        const response = await fetch(`/api/flights/results?id=${searchId}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        
        if (data.flights && Array.isArray(data.flights) && data.flights.length > 0) {
          sessionStorage.setItem(`flights-${searchId}`, JSON.stringify(data.flights));
          setFlights(data.flights);
        } else {
          setFlights([]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterByStops(event.target.value);
  };

  const sortFlights = (flights: Flight[]) => {
    return [...flights].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.amount - b.price.amount;
        case 'duration':
          return (
            a.legs.reduce((sum, leg) => sum + leg.duration, 0) -
            b.legs.reduce((sum, leg) => sum + leg.duration, 0)
          );
        default:
          return 0;
      }
    });
  };

  const filterFlights = (flights: Flight[]) => {
    if (filterByStops === 'all') return flights;
    const stops = parseInt(filterByStops);
    return flights.filter((flight) => flight.legs.length - 1 === stops);
  };

  const processedFlights = sortFlights(filterFlights(flights));

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 2, sm: 3, md: 4 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 }, 
          color: 'white',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}
      >
        Flight Results
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ bgcolor: '#3A3B3F' }}>
            <InputLabel sx={{ color: 'white' }}>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
              sx={{ color: 'white' }}
            >
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ bgcolor: '#3A3B3F' }}>
            <InputLabel sx={{ color: 'white' }}>Stops</InputLabel>
            <Select
              value={filterByStops}
              onChange={handleFilterChange}
              label="Stops"
              sx={{ color: 'white' }}
            >
              <MenuItem value="all">All Flights</MenuItem>
              <MenuItem value="0">Non-stop</MenuItem>
              <MenuItem value="1">1 Stop</MenuItem>
              <MenuItem value="2">2+ Stops</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        [...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={200}
            sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }}
          />
        ))
      ) : processedFlights.length > 0 ? (
        processedFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            price={flight.price}
            legs={flight.legs}
          />
        ))
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'white' }}>
          No flights found matching your criteria
        </Typography>
      )}
    </Container>
  );
}

// Main page component with Suspense
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, color: 'white' }}>
            Loading Results...
          </Typography>
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={200}
              sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </Container>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}