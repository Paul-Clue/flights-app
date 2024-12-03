import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import { useState, useEffect } from 'react';
import { FlightTakeoff, FlightLand } from '@mui/icons-material';

interface ApiAirport {
  skyId: string;
  entityId: string;
  presentation: {
    title: string;
    subtitle: string;
  };
}

interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  skyId: string;
  entityId: string;
}

interface Props {
  type: 'origin' | 'destination';
  value: string;
  onChange: (value: string) => void;
}

export default function AirportAutocomplete({ type, value, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  useEffect(() => {
    let active = true;

    const fetchAirports = async () => {
      if (inputValue.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(
            inputValue
          )}`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
              'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Airport Search Response:', JSON.stringify(data, null, 2));

        if (active && data.data && Array.isArray(data.data)) {
          const airports: Airport[] = data.data.map((airport: ApiAirport) => ({
            iataCode: airport.skyId,
            name: airport.presentation.title,
            cityName: airport.presentation.subtitle,
            skyId: airport.skyId,
            entityId: airport.entityId,
          }));
          console.log('Mapped Airports:', airports);
          setOptions(airports);
        } else {
          console.log('No airports found in response:', data);
          setOptions([]);
        }
      } catch (error) {
        console.error('Error fetching airports:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAirports, 300);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [inputValue]);

  useEffect(() => {
    if (value) {
      setSelectedAirport({
        iataCode: value,
        name: value,
        cityName: value,
        skyId: value,
        entityId: value,
      });
    } else {
      setSelectedAirport(null);
    }
  }, [value]);

  return (
    <Autocomplete<Airport, false>
      value={selectedAirport}
      onChange={(_, newValue) => {
        setSelectedAirport(newValue);
        onChange(
          newValue
            ? JSON.stringify({
                skyId: newValue.skyId,
                entityId: newValue.entityId,
              })
            : ''
        );
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      getOptionLabel={(option) =>
        `${option.cityName} (${option.iataCode}) - ${option.name}`
      }
      isOptionEqualToValue={(option, value) =>
        option.iataCode === value.iataCode
      }
      loading={loading}
      loadingText='Searching airports...'
      noOptionsText={
        inputValue.length < 2
          ? 'Type to search airports...'
          : 'No airports found'
      }
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={type === 'origin' ? 'Where from?' : 'Where to?'}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position='start'>
                {type === 'origin' ? (
                  <FlightTakeoff sx={{ color: '#AFB1B6' }} />
                ) : (
                  <FlightLand sx={{ color: '#AFB1B6' }} />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: '#AFB1B6',
              },
            },
            width: { xs: '100%', sm: '100px', md: '180px', lg: '200px' },
            flexGrow: 1,
          }}
        />
      )}
    />
  );
}
