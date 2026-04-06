import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image uploaded' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash to avoid 429 strict quotas on pro models
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze this electricity bill (specifically KSEB or generic Indian electricity bill).
Extract the following information and return ONLY a raw JSON string (no markdown, no backticks, no html, just the JSON payload):
{
  "billingDate": "YYYY-MM-DD",
  "unitsConsumed": number,
  "amountPaid": number
}

Rules:
- billingDate must be formatted as YYYY-MM-DD.
- unitsConsumed must be a number (the total usage in kWh / units).
- amountPaid must be a number (the total bill amount / net payable).
- Do not output any other text besides the JSON array format representation.`;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim();
    console.log("Raw Gemini Output:", text);
    
    // Robustly extract JSON block even if Gemini includes conversational text
    let jsonStr = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const braceMatch = text.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonStr = braceMatch[0];
      }
    }
    
    let extractedData = {};
    try {
      extractedData = JSON.parse(jsonStr);
      console.log("Successfully extracted:", extractedData);
    } catch(err) {
      console.error("JSON Parsing failed. Expected JSON but got:", jsonStr);
      return NextResponse.json({ success: false, error: 'Failed to parse AI output. AI output: ' + text.substring(0, 100) }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to analyze image' }, { status: 500 });
  }
}
