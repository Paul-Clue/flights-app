import { NextResponse } from 'next/server';
import type { FlightSearchData } from '@/types/flight';

interface LocationIds {
  skyId: string;
  entityId: string;
}

export async function POST(request: Request) {
  try {
    const searchData: FlightSearchData = await request.json();

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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    const flightData = await response.json();
    console.log('Flight Data:', flightData);
    
    const searchId = Date.now().toString();

    return NextResponse.json({
      searchId,
      flights: flightData,
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