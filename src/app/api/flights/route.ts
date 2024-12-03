import { NextResponse } from 'next/server';
import type { FlightSearchData } from '@/types/flight';

interface LocationIds {
  skyId: string;
  entityId: string;
}

interface ApiFlightResponse {
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

export async function POST(request: Request) {
  try {
    const searchData: FlightSearchData = await request.json();
    console.log('Search Data:', searchData);

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
      new Date(searchData.dates.departure).toISOString().split('T')[0] : '';
    const returnDate = searchData.dates.return ? 
      new Date(searchData.dates.return).toISOString().split('T')[0] : '';

    const cabinClassMap = {
      'Economy': 'economy',
      'Premium economy': 'premium_economy',
      'Business': 'business',
      'First': 'first'
    };

    const originIds: LocationIds = JSON.parse(searchData.locations.origin);
    const destinationIds: LocationIds = JSON.parse(searchData.locations.destination);

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

    console.log('Search Parameters:', Object.fromEntries(params.entries()));

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
      }
    });

    const flightData = await response.json();
    console.log('Flight API Response:', flightData);

    if (!response.ok || !flightData.data?.itineraries) {
      return NextResponse.json({
        searchId: Date.now().toString(),
        flights: [],
        message: 'No flights found'
      });
    }

    const searchId = Date.now().toString();
    const mappedFlights = flightData.data.itineraries.map((flight: ApiFlightResponse) => ({
      id: flight.id,
      price: {
        amount: flight.price.raw,
        currency: 'USD'
      },
      legs: flight.legs.map(leg => ({
        departure: {
          time: leg.departure,
          airport: leg.segments[0].origin.displayCode
        },
        arrival: {
          time: leg.arrival,
          airport: leg.segments[0].destination.displayCode
        },
        duration: leg.duration,
        carrier: {
          name: leg.carriers.marketing[0].name,
          code: leg.carriers.marketing[0].alternateId
        },
        flightNumber: leg.segments[0].flightNumber
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
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 