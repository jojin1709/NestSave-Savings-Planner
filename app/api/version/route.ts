import { NextResponse } from 'next/server';
import versionData from '../../../version.json';

export async function GET() {
  return NextResponse.json(versionData, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}
