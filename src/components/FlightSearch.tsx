'use client';

import {
  Box,
  Button,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  InputAdornment,
  Paper,
  Typography,
} from '@mui/material';
import {
  CompareArrows,
  Person,
  FlightTakeoff,
  FlightLand,
  CalendarMonth,
  Search
} from '@mui/icons-material';

export default function FlightSearch() {
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
          <ToggleButtonGroup
            value='round-trip'
            exclusive
            size='small'
            sx={{
              '& .MuiToggleButton-root': {
                color: 'white',
                textTransform: 'none',
              },
            }}
          >
            <ToggleButton value='round-trip'>Round trip</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person sx={{ color: 'white' }} />
            <Select
              value={1}
              size='small'
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            >
              <MenuItem value={1}>1</MenuItem>
            </Select>
          </Box>

          <Select
            value='economy'
            size='small'
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
            <MenuItem value='economy'>Economy</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder='Where from?'
              fullWidth
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
            />

            <IconButton
              sx={{
                bgcolor: '#3A3B3F',
                '&:hover': { bgcolor: '#4A4B4F' },
              }}
            >
              <CompareArrows sx={{ color: 'white' }} />
            </IconButton>

            <TextField
              placeholder='Where to?'
              fullWidth
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
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder='Departure'
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <CalendarMonth sx={{ color: 'white' }} />
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
            />

            <TextField
              placeholder='Return'
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <CalendarMonth sx={{ color: 'white' }} />
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
            />
          </Box>
        </Box>
      </Paper>
      <Box>
        <Button
          variant='contained'
          fullWidth
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
