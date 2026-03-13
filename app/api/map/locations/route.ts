import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'map-locations.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.access(DATA_PATH);
  } catch (err) {
    // create empty array file
    await fs.writeFile(DATA_PATH, JSON.stringify({ locations: [] }, null, 2), 'utf8');
  }
}

export async function GET() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return new NextResponse(raw, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const locations = body.locations ?? [];
    await ensureDataFile();

    // Write locations to file (overwrite)
    await fs.writeFile(DATA_PATH, JSON.stringify({ locations }, null, 2), 'utf8');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to save locations', err);
    return NextResponse.json({ ok: false, message: 'failed' }, { status: 500 });
  }
}
