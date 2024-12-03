import { NextResponse } from 'next/server';
import type { FlightSearchData } from '@/types/flight';

interface LocationIds {
  skyId: string;
  entityId: string;
}

interface ApiItinerary {
  id: string;
  price: {
    raw: number;
    formatted: string;
  };
  legs: Array<{
    id: string;
    departure: string;
    arrival: string;
    duration: number;
    carriers: {
      marketing: Array<{
        name: string;
        alternateId: string;
      }>;
    };
    segments: Array<{
      flightNumber: string;
      origin: {
        displayCode: string;
      };
      destination: {
        displayCode: string;
      };
    }>;
  }>;
}

interface ApiResponse {
  data: {
    itineraries: ApiItinerary[];
    context: {
      status: string;
      totalResults: number;
    };
  };
  status: boolean;
  timestamp: number;
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export async function POST(request: Request) {
  try {
    const searchData: FlightSearchData = await request.json();
    console.log('Search Request Data:', JSON.stringify(searchData, null, 2));

    if (!searchData.locations.origin || !searchData.locations.destination || !searchData.dates.departure) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const url = 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights';

    const departureDate = searchData.dates.departure ? 
      formatDate(new Date(searchData.dates.departure)) : '';
    const returnDate = searchData.dates.return ? 
      formatDate(new Date(searchData.dates.return)) : '';

    const cabinClassMap = {
      'Economy': 'economy',
      'Premium economy': 'premium_economy',
      'Business': 'business',
      'First': 'first'
    };

    const originIds: LocationIds = JSON.parse(searchData.locations.origin);
    const destinationIds: LocationIds = JSON.parse(searchData.locations.destination);

    console.log('Parsed Location IDs:', {
      origin: originIds,
      destination: destinationIds,
      departureDate,
      returnDate
    });

    const params = new URLSearchParams({
      originSkyId: originIds.skyId,
      destinationSkyId: destinationIds.skyId,
      originEntityId: originIds.entityId,
      destinationEntityId: destinationIds.entityId,
      date: departureDate,
      returnDate: returnDate,
      adults: searchData.passengers.adults.toString(),
      children: searchData.passengers.children.toString(),
      infants: (searchData.passengers.infantsInSeat + searchData.passengers.infantsOnLap).toString(),
      cabinClass: cabinClassMap[searchData.cabinClass] || 'economy',
      currency: 'USD',
      market: 'US',
      countryCode: 'US'
    });

    const apiUrl = `${url}?${params}`;
    console.log('Full API URL:', apiUrl);
    console.log('API Headers:', {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY ? 'present' : 'missing',
      'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
      }
    });

    console.log('API Response Status:', response.status);
    const flightData: ApiResponse = await response.json();
    console.log('Raw API Response:', JSON.stringify(flightData, null, 2));

    if (!response.ok) {
      console.log('API request failed:', response.status, response.statusText);
      return NextResponse.json({
        searchId: Date.now().toString(),
        flights: [],
        message: 'API request failed'
      });
    }

    if (!flightData.data?.itineraries) {
      console.log('No itineraries in response:', flightData);
      return NextResponse.json({
        searchId: Date.now().toString(),
        flights: [],
        message: 'No flight data received'
      });
    }

    const searchId = Date.now().toString();
    const itineraries = flightData.data.itineraries;

    try {
      const mappedFlights = itineraries.map((flight: ApiItinerary) => ({
        id: flight.id,
        price: {
          amount: parseFloat(String(flight.price.raw)) || 0,
          currency: 'USD'
        },
        legs: flight.legs.map(leg => ({
          departure: {
            time: leg.departure,
            airport: leg.segments[0]?.origin?.displayCode || ''
          },
          arrival: {
            time: leg.arrival,
            airport: leg.segments[0]?.destination?.displayCode || ''
          },
          duration: leg.duration,
          carrier: {
            name: leg.carriers.marketing[0]?.name || 'Unknown Airline',
            code: leg.carriers.marketing[0]?.alternateId || ''
          },
          flightNumber: leg.segments[0]?.flightNumber || ''
        }))
      }));

      console.log('Mapped Flights:', JSON.stringify(mappedFlights, null, 2));

      if (mappedFlights.length === 0) {
        return NextResponse.json({
          searchId,
          flights: [],
          message: 'No flights available for this route'
        });
      }

      return NextResponse.json({
        searchId,
        flights: mappedFlights,
        message: 'Search completed successfully'
      });

    } catch (error) {
      console.error('Error mapping flights:', error);
      return NextResponse.json({
        searchId,
        flights: [],
        message: 'Error processing flight data'
      });
    }

  } catch (error) {
    console.error('Error processing flight search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 