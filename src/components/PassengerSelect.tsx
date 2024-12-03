import {
  Select,
  MenuItem,
  Typography,
  IconButton,
  Button,
  Box,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { Person } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const StyledMenuItem = styled(MenuItem)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '12px 16px',
  '&:hover': {
    backgroundColor: 'transparent',
  },
});

const CounterWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: '8px',
});

const Controls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

interface PassengerCount {
  adults: number;
  children: number;
  infantsInSeat: number;
  infantsOnLap: number;
}

interface CounterProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

function PassengerCounter({ value, onIncrement, onDecrement, min = 0, max = 9 }: CounterProps) {
  return (
    <Controls>
      <IconButton 
        size="small" 
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        disabled={value <= min}
        sx={{ 
          border: '1px solid #ccc',
          padding: '4px',
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography sx={{ minWidth: '20px', textAlign: 'center' }}>{value}</Typography>
      <IconButton 
        size="small" 
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={value >= max}
        sx={{ 
          border: '1px solid #ccc',
          padding: '4px',
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Controls>
  );
}

interface PassengerSelectProps {
  onChange: (passengers: PassengerCount) => void;
  value: PassengerCount;
}

export default function PassengerSelect({ onChange, value }: PassengerSelectProps) {
  const [open, setOpen] = useState(false);
  
  const passengers = value;
  const setPassengers = (newValue: PassengerCount | ((prev: PassengerCount) => PassengerCount)) => {
    if (typeof newValue === 'function') {
      onChange(newValue(passengers));
    } else {
      onChange(newValue);
    }
  };

  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + 
           passengers.infantsInSeat + passengers.infantsOnLap;
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Select
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      value={getTotalPassengers()}
      size='small'
      sx={{
        color: '#AFB1B6',
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      }}
      renderValue={(selected) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Person sx={{ fontSize: 20 }} />
          {`${selected} Passenger${selected > 1 ? 's' : ''}`}
        </div>
      )}
      MenuProps={{
        PaperProps: {
          sx: {
            width: { xs: '280px', sm: '300px' },
            mt: 1,
            maxHeight: { xs: '80vh', sm: 'auto' }
          },
        },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
      }}
    >
      <StyledMenuItem disableRipple>
        <Box sx={{ width: '100%' }}>
          <CounterWrapper>
            <Box>
              <Typography variant="subtitle2">Adults</Typography>
              <Typography variant="caption" color="text.secondary">
                Age 12+
              </Typography>
            </Box>
            <PassengerCounter
              value={passengers.adults}
              onIncrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                adults: Math.min(prev.adults + 1, 9)
              }))}
              onDecrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                adults: Math.max(prev.adults - 1, 1)
              }))}
              min={1}
            />
          </CounterWrapper>

          <CounterWrapper>
            <Box>
              <Typography variant="subtitle2">Children</Typography>
              <Typography variant="caption" color="text.secondary">
                Aged 2-11
              </Typography>
            </Box>
            <PassengerCounter
              value={passengers.children}
              onIncrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                children: Math.min(prev.children + 1, 9)
              }))}
              onDecrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                children: Math.max(prev.children - 1, 0)
              }))}
            />
          </CounterWrapper>

          <CounterWrapper>
            <Box>
              <Typography variant="subtitle2">Infants</Typography>
              <Typography variant="caption" color="text.secondary">
                In seat
              </Typography>
            </Box>
            <PassengerCounter
              value={passengers.infantsInSeat}
              onIncrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                infantsInSeat: Math.min(prev.infantsInSeat + 1, 9)
              }))}
              onDecrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                infantsInSeat: Math.max(prev.infantsInSeat - 1, 0)
              }))}
            />
          </CounterWrapper>

          <CounterWrapper>
            <Box>
              <Typography variant="subtitle2">Infants</Typography>
              <Typography variant="caption" color="text.secondary">
                On lap
              </Typography>
            </Box>
            <PassengerCounter
              value={passengers.infantsOnLap}
              onIncrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                infantsOnLap: Math.min(prev.infantsOnLap + 1, 9)
              }))}
              onDecrement={() => setPassengers((prev: PassengerCount) => ({
                ...prev,
                infantsOnLap: Math.max(prev.infantsOnLap - 1, 0)
              }))}
            />
          </CounterWrapper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Button onClick={() => setOpen(false)} color="primary">
              Done
            </Button>
          </Box>
        </Box>
      </StyledMenuItem>
    </Select>
  );
}