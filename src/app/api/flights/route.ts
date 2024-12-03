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

const isCommercialAirport = (skyId: string) => {
  const nonCommercialAirports = ['OPF'];
  return !nonCommercialAirports.includes(skyId);
};

export async function POST(request: Request) {
  try {
    const searchData: FlightSearchData = await request.json();
    console.log('Search Request Data:', JSON.stringify(searchData, null, 2));

    const originIds: LocationIds = JSON.parse(searchData.locations.origin);
    const destinationIds: LocationIds = JSON.parse(searchData.locations.destination);

    if (!isCommercialAirport(originIds.skyId)) {
      return NextResponse.json({
        searchId: Date.now().toString(),
        flights: [],
        message: `${originIds.skyId} is not a commercial airport. Please select a major airport.`
      });
    }

    if (!isCommercialAirport(destinationIds.skyId)) {
      return NextResponse.json({
        searchId: Date.now().toString(),
        flights: [],
        message: `${destinationIds.skyId} is not a commercial airport. Please select a major airport.`
      });
    }

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

    console.log('Search Parameters:', {
      originSkyId: originIds.skyId,
      destinationSkyId: destinationIds.skyId,
      originEntityId: originIds.entityId,
      destinationEntityId: destinationIds.entityId,
      date: departureDate,
      returnDate,
      adults: searchData.passengers.adults,
      cabinClass: cabinClassMap[searchData.cabinClass]
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

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
      }
    });

    const flightData: ApiResponse = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(flightData, null, 2));

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    if (!flightData.data?.itineraries?.length) {
      return NextResponse.json({
        searchId: Date.now().toString(),
        flights: [],
        message: 'No flights available for the selected route and dates. Please try different dates or airports.'
      });
    }

    const searchId = Date.now().toString();
    const mappedFlights = flightData.data.itineraries.map((flight: ApiItinerary) => ({
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

    return NextResponse.json({
      searchId,
      flights: mappedFlights,
      message: 'Search completed successfully'
    });

  } catch (error) {
    console.error('Error processing flight search:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to search flights',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 