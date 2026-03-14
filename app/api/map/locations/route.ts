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
        review: {
          select: { stars: true },
        },
      },
    });

    const locations = courts.map((c) => {
      const coords = (c.longitude != null && c.latitude != null) ? [c.longitude, c.latitude] : null;
      const reviewsWithStars = c.review.filter((r) => r.stars != null) as { stars: number }[];
      const reviewCount = reviewsWithStars.length;
      const avgStars =
        reviewCount > 0
          ? reviewsWithStars.reduce((sum, r) => sum + r.stars, 0) / reviewCount
          : null;
      return {
        id: `court-${c.id}`,
        type: 'basketball',
        title: c.name ?? '',
        subtitle: c.location ?? '',
        coordinates: coords,
        courtId: String(c.id),
        image: c.image ?? null,
        rating: avgStars != null ? Math.round(avgStars * 10) / 10 : null,
        reviewCount,
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
