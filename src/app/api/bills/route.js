import { NextResponse } from 'next/server';
import { getBills, createBill } from '@/models/Bill';

export async function GET() {
  try {
    const bills = await getBills();
    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const bill = await createBill(body);
    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
