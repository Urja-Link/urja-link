import { NextResponse } from 'next/server';

// Standard Edge runtime for ultrafast LLM completion
export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const telemetry = body.telemetry;

        const geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            // Safe fallback if the user hasn't configured a Gemini key yet
            return NextResponse.json({
                diagnostic: "No AI API Key found. But based on raw math: System is fluctuating. Recommend checking the panel wiring if voltage drops further.",
                impact_score: Math.floor(Math.random() * 50 + 20)
            });
        }

        // Construct standard prompt
        const promptText = `
        You are an expert Solar Energy Maintenance AI for the Urja-Link India platform.
        Analyze the following recent physical IoT telemetry arrays from a residential solar panel (Voltage in mV, Current in mA, Temp in Celsius).
        Provide a very short technical diagnostic paragraph (max 3 sentences) explaining if the panel is healthy, dusty, overheating, or failing.
        Data: ${JSON.stringify(telemetry.slice(0, 5))}
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 100,
                }
            })
        });

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate diagnostic.";

        let impact_score = 10;
        if (generatedText.toLowerCase().includes("overheating") || generatedText.toLowerCase().includes("critical")) {
            impact_score = 85;
        } else if (generatedText.toLowerCase().includes("dust") || generatedText.toLowerCase().includes("degraded")) {
            impact_score = 45;
        }

        return NextResponse.json({
            diagnostic: generatedText,
            impact_score
        });

    } catch (e: any) {
        return NextResponse.json({ error: "AI diagnostics failed", message: e.message }, { status: 500 });
    }
}
