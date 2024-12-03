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

    const flightData = await fetch('/api/flights/cache/' + searchId);
    const results = await flightData.json();

    return NextResponse.json({
      flights: results.data.itineraries.map((itinerary: Partial<FlightItinerary>) => ({
        id: itinerary.id,
        price: itinerary.price,
        legs: itinerary.legs?.map((leg: Partial<FlightItinerary['legs'][0]>) => ({
          departure: {
            time: leg.departure?.time,
            airport: leg.departure?.airport
          },
          arrival: {
            time: leg.arrival?.time,
            airport: leg.arrival?.airport
          },
          duration: leg.duration,
          carrier: {
            name: leg.carrier?.name,
            code: leg.carrier?.code
          },
          flightNumber: leg.flightNumber
        }))
      })),
      totalResults: results.data.context.totalResults
    });

  } catch (error) {
    console.error('Error fetching flight results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 