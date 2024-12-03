import { NextResponse } from 'next/server';

interface FlightItinerary {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  legs: Array<{
    departure: {
      time: string;
      airport: string;
    };
    arrival: {
      time: string;
      airport: string;
    };
    duration: number;
    carrier: {
      name: string;
      code: string;
    };
    flightNumber: string;
  }>;
}

const flightCache: Record<string, FlightItinerary[]> = {};

export async function POST(request: Request) {
  const data = await request.json();
  const { searchId, flights } = data;
  flightCache[searchId] = flights;
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    const cachedFlights = flightCache[searchId];
    if (!cachedFlights) {
      return NextResponse.json(
        { error: 'No flights found for this search' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      flights: cachedFlights,
      totalResults: cachedFlights.length
    });

  } catch (error) {
    console.error('Error fetching flight results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 