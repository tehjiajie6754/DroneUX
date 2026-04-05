import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const deployments = await db.all('SELECT * FROM deployments ORDER BY date DESC');
    return NextResponse.json(deployments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, location, address, date, survivorsFound, totalSurvivors, coverage, timeUsed } = body;
    
    const db = await openDb();
    await db.run(
      'INSERT INTO deployments (id, location, address, date, survivorsFound, totalSurvivors, coverage, timeUsed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, location, address, date, survivorsFound, totalSurvivors, coverage, timeUsed]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deployment record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id param' }, { status: 400 });
    }

    const db = await openDb();
    await db.run('DELETE FROM deployments WHERE id = ?', [id]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete deployment record' }, { status: 500 });
  }
}
