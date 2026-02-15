import { NextResponse } from 'next/server';
import { isFirebaseReady, getFirebaseError } from '@/lib/firebase-admin';

export async function GET() {
  const ready = isFirebaseReady();
  const err = getFirebaseError();

  return NextResponse.json({
    ready,
    error: err ? err.message : null,
  });
}
