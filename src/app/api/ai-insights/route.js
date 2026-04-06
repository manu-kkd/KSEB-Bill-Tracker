import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { bills } = await request.json();

    if (!bills || bills.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No bills provided for analysis' },
        { status: 400 }
      );
    }

    // Sort bills by date ascending to show chronological usage
    const sortedBills = [...bills].sort((a, b) => new Date(a.billingDate) - new Date(b.billingDate));

    // Construct the prompt context
    let promptContext = "Here is my electricity usage over the last few billing cycles:\n";
    sortedBills.forEach(bill => {
      promptContext += `- Date: ${new Date(bill.billingDate).toLocaleDateString()}, Units Consumed: ${bill.unitsConsumed}, Amount Paid: ₹${bill.amountPaid}\n`;
    });

    const prompt = `${promptContext}\nBased on this usage data, provide a brief analysis of my electricity usage trend. Give 3 short, actionable, and specific tips to reduce my electricity consumption and save money. Be friendly and concise. Format the response with simple bullet points.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ success: true, insights: text });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
