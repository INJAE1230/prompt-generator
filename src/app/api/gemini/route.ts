import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { systemPrompt, userMessage } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt + '\n\n' + userMessage }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();
  console.log('Gemini API response:', JSON.stringify(data, null, 2));

  if (!data.candidates) {
    return NextResponse.json({ result: JSON.stringify(data, null, 2) });
  }

  const text = data.candidates[0]?.content?.parts?.[0]?.text || '응답 없음';
  return NextResponse.json({ result: text });
}
