'use client';

import {
  Box,
  Button,
  IconButton,
  // TextField,
  SelectChangeEvent,
  Select,
  MenuItem,
  // Menu,
  // InputAdornment,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import {
  CompareArrows,
  // Person,
  // FlightTakeoff,
  // FlightLand,
  // CalendarMonth,
  Search,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PassengerSelect from './PassengerSelect';
import AirportAutocomplete from './AirportAutocomplete';
// import { ChangeEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type FlightType = 'Round-trip' | 'One-way' | 'Multi-city';
type CabinClass = 'Economy' | 'Premium economy' | 'Business' | 'First';
interface FlightLocation {
  origin: string;
  destination: string;
}

interface DateRange {
  departure: Date | null;
  return: Date | null;
}

interface PassengerCount {
  adults: number;
  children: number;
  infantsInSeat: number;
  infantsOnLap: number;
}

export default function FlightSearch() {
  // section: state
  const containerRef = useRef<HTMLDivElement>(null);
  const [flightType, setFlightType] = useState<FlightType>('Round-trip');
  const [cabinClass, setCabinClass] = useState<CabinClass>('Economy');
  const [locations, setLocations] = useState<FlightLocation>({
    origin: '',
    destination: '',
  });
  const [open, setOpen] = useState<'departure' | 'return' | null>(null);
  const [dates, setDates] = useState<DateRange>({
    departure: null,
    return: null,
  });
  const [passengers, setPassengers] = useState<PassengerCount>({
    adults: 1,
    children: 0,
    infantsInSeat: 0,
    infantsOnLap: 0,
  });
  const router = useRouter();

  const handleChangeFlightType = (event: SelectChangeEvent) => {
    setFlightType(event.target.value as FlightType);
  };

  const handleChangeCabinClass = (event: SelectChangeEvent) => {
    setCabinClass(event.target.value as CabinClass);
  };

  // const handleLocationChange =
  //   (field: keyof FlightLocation) => (event: ChangeEvent<HTMLInputElement>) => {
  //     setLocations((prev) => ({
  //       ...prev,
  //       [field]: event.target.value,
  //     }));
  //   };

  const handleDateChange =
    (type: 'departure' | 'return') => (date: Date | null) => {
      setDates((prev) => ({
        ...prev,
        [type]: date,
      }));
      setOpen(null);
    };

  const handleSearch = async () => {
    // Add more specific validation
    if (!locations.origin) {
      alert('Please select an origin airport');
      return;
    }

    if (!locations.destination) {
      alert('Please select a destination airport');
      return;
    }

    if (locations.origin === locations.destination) {
      alert('Origin and destination cannot be the same');
      return;
    }

    if (!dates.departure) {
      alert('Please select a departure date');
      return;
    }

    // Add validation for return date if round-trip
    if (flightType === 'Round-trip' && !dates.return) {
      alert('Please select a return date for round-trip flight');
      return;
    }

    const searchData = {
      flightType,
      cabinClass,
      passengers,
      locations,
      dates,
    };

    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });

      const data = await response.json();
      console.log('Search Response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      if (!data.flights || !Array.isArray(data.flights)) {
        console.error('Invalid flight data structure:', data);
        throw new Error(data.message || 'Invalid flight data received');
      }

      if (data.flights.length === 0) {
        throw new Error('No flights found for this route. Please try different dates or airports.');
      }

      // Store the flight data in the API route cache
      await fetch('/api/flights/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId: data.searchId,
          flights: data.flights, // Store the mapped flights directly
        }),
      });

      // Store in sessionStorage as backup
      sessionStorage.setItem(
        `flights-${data.searchId}`,
        JSON.stringify(data.flights)
      );

      router.push(`/flights/results?id=${data.searchId}`);
    } catch (error) {
      console.error('Error details:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to search flights. Please try again.'
      );
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#3A3B3F',
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 2,
            alignItems: 'center',
          }}
        >
          {/* section: flight type */}
          <Select
            value={flightType}
            onChange={handleChangeFlightType}
            size='small'
            // IconComponent={Person}
            sx={{
              color: '#AFB1B6',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
            renderValue={(selected) => (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CompareArrowsIcon sx={{ fontSize: 20 }} />
                {selected}
              </div>
            )}
          >
            <MenuItem value='Round-trip'>Round trip</MenuItem>
            <MenuItem value='One-way'>One way</MenuItem>
            <MenuItem value='Multi-city'>Multi-city</MenuItem>
          </Select>

          {/* section: passengers */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PassengerSelect value={passengers} onChange={setPassengers} />
          </Box>

          {/* section: class */}
          <Select
            value={cabinClass}
            onChange={handleChangeCabinClass}
            size='small'
            sx={{
              color: '#AFB1B6',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
            <MenuItem value='Economy'>Economy</MenuItem>
            <MenuItem value='Premium economy'>Premium Economy</MenuItem>
            <MenuItem value='Business'>Business</MenuItem>
            <MenuItem value='First'>First</MenuItem>
          </Select>
        </Box>

        {/* section: from and to */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: '100%',
            }}
          >
            <AirportAutocomplete
              type='origin'
              value={locations.origin}
              onChange={(value) =>
                setLocations((prev) => ({ ...prev, origin: value }))
              }
            />

            <IconButton
              sx={{
                bgcolor: '#3A3B3F',
                '&:hover': { bgcolor: '#4A4B4F' },
                padding: 0,
                margin: -2,
              }}
            >
              <CompareArrows sx={{ color: 'white' }} />
            </IconButton>

            <AirportAutocomplete
              type='destination'
              value={locations.destination}
              onChange={(value) =>
                setLocations((prev) => ({ ...prev, destination: value }))
              }
            />
          </Box>

          {/* section: departure and return */}
          <Box
            sx={{
              display: 'flex',
              border: '1px solid #AFB1B6',
              paddingRight: 0,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: '100%',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div ref={containerRef} id='flight-date-container'>
                <Stack
                  direction='row'
                  sx={{
                    border: '1px solid #3A3B3F',
                    borderRadius: 1,
                    overflow: 'hidden',
                    paddingTop: 0.5,
                  }}
                >
                  <DatePicker
                    open={open === 'departure'}
                    onOpen={() => setOpen('departure')}
                    onClose={() => setOpen(null)}
                    value={dates.departure}
                    onChange={handleDateChange('departure')}
                    slotProps={{
                      popper: {
                        anchorEl: containerRef.current,
                        placement: 'bottom-start',
                      },
                    }}
                    slots={{
                      textField: () => (
                        <Button
                          onClick={() => setOpen('departure')}
                          startIcon={<CalendarTodayIcon />}
                          sx={{
                            flex: 1,
                            color: '#AFB1B6',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            borderRadius: 0,
                            padding: '10px 20px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          {dates.departure
                            ? dates.departure.toLocaleDateString()
                            : 'Departure'}
                        </Button>
                      ),
                    }}
                  />

                  <DatePicker
                    open={open === 'return'}
                    onOpen={() => setOpen('return')}
                    onClose={() => setOpen(null)}
                    value={dates.return}
                    onChange={handleDateChange('return')}
                    slotProps={{
                      popper: {
                        anchorEl: containerRef.current,
                        placement: 'bottom-start',
                      },
                    }}
                    minDate={dates.departure || undefined}
                    slots={{
                      textField: () => (
                        <Button
                          onClick={() => setOpen('return')}
                          startIcon={<CalendarTodayIcon />}
                          sx={{
                            flex: 1,
                            color: '#AFB1B6',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            borderLeft: '1px solid #AFB1B6',
                            borderRadius: 0,
                            padding: '10px 16px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          {dates.return
                            ? dates.return.toLocaleDateString()
                            : 'Return'}
                        </Button>
                      ),
                    }}
                  />
                </Stack>
              </div>
            </LocalizationProvider>
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          variant='contained'
          onClick={handleSearch}
          sx={{
            bgcolor: '#8AB4F8',
            width: '20%',
            borderRadius: 10,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#3A74FF',
            },
          }}
        >
          <Search sx={{ color: '#202123' }} />
          <Typography sx={{ color: '#202123' }}>Search</Typography>
        </Button>
      </Box>
    </>
  );
}
