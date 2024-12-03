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

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      router.push(`/flights/results?id=${data.searchId}`);
    } catch (error) {
      console.error('Error searching flights:', error);
      alert('Failed to search flights. Please try again.');
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#3A3B3F',
          p: 2,
          borderRadius: 2,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          {/* section: flight type */}
          <Select
            value={flightType}
            onChange={handleChangeFlightType}
            size='small'
            // IconComponent={Person}
            sx={{
              color: 'white',
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
              color: 'white',
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
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {/* <TextField
              placeholder='Where from?'
              fullWidth
              value={locations.origin}
              onChange={handleLocationChange('origin')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <FlightTakeoff sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#3A3B3F',
                  },
                },
              }}
            /> */}

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
              }}
            >
              <CompareArrows sx={{ color: 'white' }} />
            </IconButton>

            {/* <TextField
              placeholder='Where to?'
              fullWidth
              value={locations.destination}
              onChange={handleLocationChange('destination')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <FlightLand sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#3A3B3F',
                  },
                },
              }}
            /> */}
            <AirportAutocomplete
              type='destination'
              value={locations.destination}
              onChange={(value) =>
                setLocations((prev) => ({ ...prev, destination: value }))
              }
            />
          </Box>

          {/* section: departure and return */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div ref={containerRef} id='flight-date-container'>
                <Stack
                  direction='row'
                  sx={{
                    border: '1px solid #3A3B3F',
                    borderRadius: 1,
                    overflow: 'hidden',
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
                            color: 'white',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            borderRight: '1px solid #3A3B3F',
                            borderRadius: 0,
                            padding: '10px 16px',
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
                        anchorEl: document.getElementById(
                          'flight-date-container'
                        ),
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
                            color: 'white',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
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
      <Box>
        <Button
          variant='contained'
          fullWidth
          onClick={handleSearch}
          sx={{
            bgcolor: '#8AB4F8',
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
