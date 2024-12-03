export interface FlightSearchData {
  flightType: 'Round-trip' | 'One-way' | 'Multi-city';
  cabinClass: 'Economy' | 'Premium economy' | 'Business' | 'First';
  passengers: {
    adults: number;
    children: number;
    infantsInSeat: number;
    infantsOnLap: number;
  };
  locations: {
    origin: string;
    destination: string;
  };
  dates: {
    departure: Date | null;
    return: Date | null;
  };
} 