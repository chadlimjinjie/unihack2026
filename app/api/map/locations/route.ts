import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        longitude: true,
        latitude: true,
        image: true,
      },
    });

    const locations = courts.map((c) => {
      const coords = (c.longitude != null && c.latitude != null) ? [c.longitude, c.latitude] : null;
      return {
        id: `court-${c.id}`,
        type: 'basketball',
        title: c.name ?? '',
        subtitle: c.location ?? '',
        coordinates: coords,
        courtId: String(c.id),
        image: c.image ?? null,
      };
    });

    return NextResponse.json({ locations });
  } catch (err) {
    console.error('Failed to read courts for map', err);
    return NextResponse.json({ locations: [] });
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, message: 'write not supported' }, { status: 405 });
}
